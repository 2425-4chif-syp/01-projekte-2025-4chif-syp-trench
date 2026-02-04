using MQTTnet;
using MQTTnet.Client;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Persistence;
using TrenchAPI.Core.Entities;
using System.Globalization;
using System.Threading.Channels;
using System.Collections.Concurrent;
using Npgsql;

namespace TrenchAPI.WebAPI.Services
{
    public class MqttMeasurementService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MqttMeasurementService> _logger;
        private IMqttClient? _mqttClient;
        private int? _currentMessungId;
        private int? _currentMesseinstellungId;
        private Dictionary<string, int> _sondenPositionMap = new();
        
        // OPTIMIERT: Channel-basiertes Producer-Consumer Pattern (effizienter als ConcurrentQueue)
        private Channel<Messwert>? _messwertChannel;
        private Task[]? _consumerTasks;
        private CancellationTokenSource? _consumerCts;
        
        // Gleitender Mittelwert pro Sensor (Thread-safe)
        private ConcurrentDictionary<string, MovingAverageBuffer> _sensorBuffers = new();
        
        // Konfiguration
        private const int BATCH_SIZE = 5000;           // Größere Batches = weniger DB Roundtrips
        private const int BATCH_INTERVAL_MS = 250;     // Schnelleres Flushing
        private const int CONSUMER_THREAD_COUNT = 2;   // Parallele DB-Writer
        private const int CHANNEL_CAPACITY = 50000;    // Buffer für Spitzen
        
        // Moving Average Konfiguration
        private const int MOVING_AVG_WINDOW = 10;      // Fenstergröße für Mittelwert
        private const int OUTPUT_EVERY_N = 10;         // Jeden 10. Wert speichern (30 statt 300/sec)

        public MqttMeasurementService(
            IServiceProvider serviceProvider,
            ILogger<MqttMeasurementService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("MQTT Measurement Service starting...");

            try
            {
                // Initialize MQTT Client
                MqttFactory factory = new MqttFactory();
                _mqttClient = factory.CreateMqttClient();

                MqttClientOptions options = new MqttClientOptionsBuilder()
                    .WithTcpServer("vm90.htl-leonding.ac.at")
                    .WithCredentials("student", "passme")
                    .WithCleanSession()
                    .Build();

                _mqttClient.ApplicationMessageReceivedAsync += HandleMqttMessage;

                await _mqttClient.ConnectAsync(options, stoppingToken);
                _logger.LogInformation("Connected to MQTT broker");

                // Subscribe to topic
                MqttClientSubscribeOptions subscribeOptions = new MqttClientSubscribeOptionsBuilder()
                    .WithTopicFilter(f => f
                        .WithTopic("trench_mqtt_mock_v2/#")
                        .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce))
                    .Build();

                await _mqttClient.SubscribeAsync(subscribeOptions, stoppingToken);
                _logger.LogInformation("Subscribed to MQTT topic: trench_mqtt_mock_v2/#");

                // Keep the service running
                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in MQTT Measurement Service");
            }
        }

        private async Task HandleMqttMessage(MqttApplicationMessageReceivedEventArgs args)
        {
            try
            {
                // Only process if a measurement is active
                if (_currentMessungId == null || _currentMesseinstellungId == null || _messwertChannel == null)
                {
                    return;
                }

                string topic = args.ApplicationMessage.Topic;
                byte[]? payloadBytes = args.ApplicationMessage.PayloadSegment.Array;

                // Parse topic: mqtt_topic/rj1/probe1 -> Schenkel X=1, Sensor Y=1
                string[] topicParts = topic.Split('/');
                
                // Expecting at least 3 parts: base_topic/rjX/probeY
                if (topicParts.Length < 3)
                {
                    return;
                }

                // Get the last two parts for rj and probe
                string rjPart = topicParts[topicParts.Length - 2]; // e.g., "rj1"
                string probePart = topicParts[topicParts.Length - 1]; // e.g., "probe1"

                // Parse rj number (remove "rj" prefix)
                if (!rjPart.StartsWith("rj", StringComparison.OrdinalIgnoreCase) || 
                    !int.TryParse(rjPart.Substring(2), out int rjNumber))
                {
                    return;
                }

                // Parse probe number (remove "probe" prefix)
                if (!probePart.StartsWith("probe", StringComparison.OrdinalIgnoreCase) || 
                    !int.TryParse(probePart.Substring(5), out int probeNumber))
                {
                    return;
                }

                // Construct the sensor key in the format "S{rjNumber}S{probeNumber}"
                string sensorKey = $"S{rjNumber}S{probeNumber}";

                // Parse value from binary payload
                if (payloadBytes == null || payloadBytes.Length < 16)
                {
                    return;
                }
                
                float value = BitConverter.ToSingle(payloadBytes, 0);

                // Get SondenPosition ID from map
                if (!_sondenPositionMap.TryGetValue(sensorKey, out int sondenPositionId))
                {
                    return;
                }

                // ============ GLEITENDER MITTELWERT ============
                // Hole oder erstelle Buffer für diesen Sensor
                MovingAverageBuffer buffer = _sensorBuffers.GetOrAdd(
                    sensorKey, 
                    _ => new MovingAverageBuffer(MOVING_AVG_WINDOW, OUTPUT_EVERY_N)
                );

                // Füge Wert zum Buffer hinzu - nur wenn genug Samples gesammelt, speichern
                if (!buffer.AddValue((decimal)value, out decimal smoothedValue))
                {
                    // Noch nicht genug Werte für Ausgabe - überspringen
                    return;
                }

                // Erstelle Messwert mit geglättetem Wert
                Messwert messwert = new Messwert
                {
                    MessungID = _currentMessungId.Value,
                    SondenPositionID = sondenPositionId,
                    Wert = smoothedValue,  // Geglätteter Mittelwert statt Rohwert
                    Zeitpunkt = DateTime.UtcNow
                };

                // TryWrite ist non-blocking - wenn Channel voll, verwerfe (sollte nicht passieren)
                _messwertChannel.Writer.TryWrite(messwert);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error handling MQTT message for topic: {args.ApplicationMessage.Topic}");
            }
        }

        /// <summary>
        /// Consumer-Task: Liest aus dem Channel und speichert in Batches
        /// Mehrere dieser Tasks laufen parallel für maximale Performance
        /// </summary>
        private async Task ConsumerLoopAsync(int consumerId, CancellationToken ct)
        {
            _logger.LogInformation($"Consumer {consumerId} started");
            List<Messwert> batch = new List<Messwert>(BATCH_SIZE);
            DateTime lastSaveTime = DateTime.UtcNow;
            
            try
            {
                while (!ct.IsCancellationRequested)
                {
                    try
                    {
                        // Warte auf Daten mit Timeout für regelmäßiges Flushing
                        using CancellationTokenSource timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                        timeoutCts.CancelAfter(BATCH_INTERVAL_MS);
                        
                        try
                        {
                            Messwert messwert = await _messwertChannel!.Reader.ReadAsync(timeoutCts.Token);
                            batch.Add(messwert);
                        }
                        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
                        {
                            // Timeout - flush wenn Daten vorhanden
                        }
                        
                        // Batch speichern wenn voll oder Timeout erreicht
                        double timeSinceLastSave = (DateTime.UtcNow - lastSaveTime).TotalMilliseconds;
                        if (batch.Count >= BATCH_SIZE || (batch.Count > 0 && timeSinceLastSave >= BATCH_INTERVAL_MS))
                        {
                            await SaveBatchWithCopyAsync(batch, consumerId);
                            batch.Clear();
                            lastSaveTime = DateTime.UtcNow;
                        }
                    }
                    catch (ChannelClosedException)
                    {
                        break;
                    }
                }
                
                // Flush remaining
                if (batch.Count > 0)
                {
                    await SaveBatchWithCopyAsync(batch, consumerId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Consumer {consumerId} error");
            }
            
            _logger.LogInformation($"Consumer {consumerId} stopped");
        }

        /// <summary>
        /// ULTRA-SCHNELL: PostgreSQL COPY für Bulk-Insert (10-100x schneller als INSERT)
        /// </summary>
        private async Task SaveBatchWithCopyAsync(List<Messwert> batch, int consumerId)
        {
            if (batch.Count == 0) return;
            
            DateTime startTime = DateTime.UtcNow;
            
            try
            {
                using IServiceScope scope = _serviceProvider.CreateScope();
                WebDbContext context = scope.ServiceProvider.GetRequiredService<WebDbContext>();
                string? connectionString = context.Database.GetConnectionString();
                
                await using NpgsqlConnection conn = new NpgsqlConnection(connectionString);
                await conn.OpenAsync();
                
                // PostgreSQL COPY ist extrem schnell für Bulk-Inserts
                await using NpgsqlBinaryImporter writer = await conn.BeginBinaryImportAsync(
                    "COPY \"Messwert\" (\"MessungID\", \"SondenPositionID\", \"Wert\", \"Zeitpunkt\") FROM STDIN (FORMAT BINARY)");
                
                foreach (var m in batch)
                {
                    await writer.StartRowAsync();
                    await writer.WriteAsync(m.MessungID, NpgsqlTypes.NpgsqlDbType.Integer);
                    await writer.WriteAsync(m.SondenPositionID, NpgsqlTypes.NpgsqlDbType.Integer);
                    await writer.WriteAsync(m.Wert, NpgsqlTypes.NpgsqlDbType.Numeric);
                    await writer.WriteAsync(m.Zeitpunkt, NpgsqlTypes.NpgsqlDbType.TimestampTz);
                }
                
                await writer.CompleteAsync();
                
                double elapsed = (DateTime.UtcNow - startTime).TotalMilliseconds;
                _logger.LogDebug($"Consumer {consumerId}: COPY {batch.Count} rows in {elapsed:F0}ms ({batch.Count / elapsed * 1000:F0} rows/sec)");
            }
            catch (PostgresException ex) when (ex.SqlState == "23505")
            {
                // Duplicate key - fallback to AddRange
                _logger.LogWarning($"Consumer {consumerId}: COPY failed with duplicate key, using fallback");
                await SaveBatchFallbackAsync(batch);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Consumer {consumerId}: COPY failed, using fallback");
                await SaveBatchFallbackAsync(batch);
            }
        }
        
        /// <summary>
        /// Fallback: Standard EF Core AddRange wenn COPY fehlschlägt
        /// </summary>
        private async Task SaveBatchFallbackAsync(List<Messwert> batch)
        {
            try
            {
                using IServiceScope scope = _serviceProvider.CreateScope();
                WebDbContext context = scope.ServiceProvider.GetRequiredService<WebDbContext>();
                
                await SynchronizeMesswertSequenceAsync(context);
                
                context.ChangeTracker.AutoDetectChangesEnabled = false;
                
                // Erstelle neue Entities ohne IDs
                List<Messwert> newBatch = batch.Select(m => new Messwert
                {
                    MessungID = m.MessungID,
                    SondenPositionID = m.SondenPositionID,
                    Wert = m.Wert,
                    Zeitpunkt = m.Zeitpunkt
                }).ToList();
                
                context.Messwert.AddRange(newBatch);
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fallback save failed");
            }
        }

        public virtual async Task StartMeasurement(int messungId, int messeinstellungId)
        {
            _logger.LogInformation($"Starting measurement: MessungID={messungId}, MesseinstellungID={messeinstellungId}");
            _logger.LogInformation($"Moving Average: Window={MOVING_AVG_WINDOW}, OutputEveryN={OUTPUT_EVERY_N} (reduces 300/sec to {300/OUTPUT_EVERY_N}/sec)");

            _currentMessungId = messungId;
            _currentMesseinstellungId = messeinstellungId;

            // Reset alle Moving Average Buffer für neue Messung
            _sensorBuffers.Clear();

            // Erstelle Channel für Producer-Consumer Pattern
            _messwertChannel = Channel.CreateBounded<Messwert>(new BoundedChannelOptions(CHANNEL_CAPACITY)
            {
                FullMode = BoundedChannelFullMode.DropOldest, // Bei Überlauf älteste verwerfen
                SingleReader = false,
                SingleWriter = false
            });
            
            // Starte Consumer-Threads
            _consumerCts = new CancellationTokenSource();
            _consumerTasks = new Task[CONSUMER_THREAD_COUNT];
            for (int i = 0; i < CONSUMER_THREAD_COUNT; i++)
            {
                int consumerId = i;
                _consumerTasks[i] = Task.Run(() => ConsumerLoopAsync(consumerId, _consumerCts.Token));
            }
            
            _logger.LogInformation($"Started {CONSUMER_THREAD_COUNT} consumer threads");

            // Load SondenPositionen for this Messeinstellung
            using IServiceScope scope = _serviceProvider.CreateScope();
            WebDbContext context = scope.ServiceProvider.GetRequiredService<WebDbContext>();

            // Synchronize Messwert sequence at the start to prevent duplicate key errors
            await SynchronizeMesswertSequenceAsync(context);

            List<SondenPosition> sondenPositionen = await context.SondenPosition
                .Where(sp => sp.MesseinstellungID == messeinstellungId)
                .AsNoTracking()
                .ToListAsync();

            _logger.LogInformation($"Found {sondenPositionen.Count} SondenPositionen for MesseinstellungID {messeinstellungId}");

            if (sondenPositionen.Count == 0)
            {
                _logger.LogWarning($"No SondenPositionen found for MesseinstellungID {messeinstellungId}. Cannot save MQTT values. Please create SondenPositionen first.");
            }

            _sondenPositionMap.Clear();
            foreach (SondenPosition sp in sondenPositionen)
            {
                string key = $"S{sp.Schenkel}S{sp.Position}";
                _sondenPositionMap[key] = sp.ID;
                _logger.LogInformation($"Mapped {key} -> SondenPositionID: {sp.ID}");
            }

            _logger.LogInformation($"Loaded {_sondenPositionMap.Count} SondenPositionen mappings");
        }

        public void StopMeasurement()
        {
            _logger.LogInformation("Stopping measurement");
            
            // Signal consumers to stop
            _messwertChannel?.Writer.Complete();
            
            // Cancel the consumer tasks first
            _consumerCts?.Cancel();
            
            // Then wait for Consumer-Threads to finish
            if (_consumerTasks != null)
            {
                _logger.LogInformation("Waiting for consumer threads to finish...");
                Task.WhenAll(_consumerTasks);
            }
            
            _consumerCts?.Dispose();
            _consumerCts = null;
            _consumerTasks = null;
            _messwertChannel = null;
            
            _currentMessungId = null;
            _currentMesseinstellungId = null;
            _sondenPositionMap.Clear();
            
            _logger.LogInformation("Measurement stopped");
        }

        public bool IsMeasuring => _currentMessungId.HasValue;

        private async Task SynchronizeMesswertSequenceAsync(WebDbContext context)
        {
            try
            {
                // Synchronize the Messwert sequence to the current max ID + 1
                string sql = @"SELECT setval(
                    pg_get_serial_sequence('""Messwert""', 'ID'), 
                    COALESCE((SELECT MAX(""ID"") FROM ""Messwert""), 0) + 1, 
                    false)";
                
                await context.Database.ExecuteSqlRawAsync(sql);
            }
            catch
            {
                // Ignore errors - sequence might not exist or already be correct
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("MQTT Measurement Service stopping...");

            // Stop measurement if running
            if (IsMeasuring)
            {
                StopMeasurement();
            }

            if (_mqttClient != null && _mqttClient.IsConnected)
            {
                await _mqttClient.DisconnectAsync(cancellationToken: cancellationToken);
                _mqttClient.Dispose();
            }

            await base.StopAsync(cancellationToken);
        }
    }
}
