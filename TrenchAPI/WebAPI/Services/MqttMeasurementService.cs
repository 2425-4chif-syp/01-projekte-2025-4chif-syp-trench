using MQTTnet;
using MQTTnet.Client;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Persistence;
using TrenchAPI.Core.Entities;
using System.Globalization;
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
                var factory = new MqttFactory();
                _mqttClient = factory.CreateMqttClient();

                var options = new MqttClientOptionsBuilder()
                    .WithTcpServer("vm90.htl-leonding.ac.at")
                    .WithCredentials("student", "passme")
                    .WithCleanSession()
                    .Build();

                _mqttClient.ApplicationMessageReceivedAsync += HandleMqttMessage;

                await _mqttClient.ConnectAsync(options, stoppingToken);
                _logger.LogInformation("Connected to MQTT broker");

                // Subscribe to topic
                var topicFilter = new MqttTopicFilterBuilder()
                    .WithTopic("trench_mqtt_mock_v2/#")
                    .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                    .Build();

                await _mqttClient.SubscribeAsync(topicFilter, stoppingToken);
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
        if (_currentMessungId == null || _currentMesseinstellungId == null)
        {
            return;
        }

        var topic = args.ApplicationMessage.Topic;
        var payloadBytes = args.ApplicationMessage.PayloadSegment.Array;

        // Parse topic: mqtt_topic/rj1/probe1 -> Schenkel X=1, Sensor Y=1
        var topicParts = topic.Split('/');
        
        // Expecting at least 3 parts: base_topic/rjX/probeY
        if (topicParts.Length < 3)
        {
            return;
        }

        // Get the last two parts for rj and probe
        var rjPart = topicParts[topicParts.Length - 2]; // e.g., "rj1"
        var probePart = topicParts[topicParts.Length - 1]; // e.g., "probe1"

        // Parse rj number (remove "rj" prefix)
        if (!rjPart.StartsWith("rj", StringComparison.OrdinalIgnoreCase) || 
            !int.TryParse(rjPart.Substring(2), out var rjNumber))
        {
            _logger.LogWarning($"Could not parse rj number from topic part: {rjPart}");
            return;
        }

        // Parse probe number (remove "probe" prefix)
        if (!probePart.StartsWith("probe", StringComparison.OrdinalIgnoreCase) || 
            !int.TryParse(probePart.Substring(5), out var probeNumber))
        {
            _logger.LogWarning($"Could not parse probe number from topic part: {probePart}");
            return;
        }

        // Construct the sensor key in the format "S{rjNumber}S{probeNumber}"
        var sensorKey = $"S{rjNumber}S{probeNumber}";

        // Parse value from binary payload
        if (payloadBytes == null || payloadBytes.Length < 16)
        {
            _logger.LogWarning($"Invalid payload length: {payloadBytes?.Length ?? 0} bytes");
            return;
        }
        
        var value = BitConverter.ToSingle(payloadBytes, 0);

        // Get SondenPosition ID from map
        if (!_sondenPositionMap.TryGetValue(sensorKey, out var sondenPositionId))
        {
            _logger.LogWarning($"No SondenPosition found for key: {sensorKey}");
            return;
        }

        // Log which subtopics we traversed (for debugging/tracking)
        _logger.LogDebug($"Processing MQTT message - Topic: {topic}, RJ: {rjNumber}, Probe: {probeNumber}, SensorKey: {sensorKey}");

        // Save to database
        using var scope = _serviceProvider.CreateScope();
        WebDbContext context = scope.ServiceProvider.GetRequiredService<WebDbContext>();

        // Create a new Messwert entity
        Messwert messwert = new Messwert
        {
            MessungID = _currentMessungId.Value,
            SondenPositionID = sondenPositionId,
            Wert = (decimal)value,
            Zeitpunkt = DateTime.UtcNow
        };

        context.Messwert.Add(messwert);
        
        try
        {
            await context.SaveChangesAsync();
            _logger.LogDebug($"Saved Messwert: {sensorKey} = {value}");
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex) when (ex.InnerException is PostgresException pgEx && pgEx.SqlState == "23505")
        {
            // Duplicate key error - synchronize sequence and retry
            _logger.LogWarning($"Duplicate key error for Messwert, synchronizing sequence...");
            await SynchronizeMesswertSequenceAsync(context);
            
            // Clear the context and create a new entity
            context.ChangeTracker.Clear();
            var retryMesswert = new Messwert
            {
                MessungID = _currentMessungId.Value,
                SondenPositionID = sondenPositionId,
                Wert = (decimal)value,
                Zeitpunkt = DateTime.UtcNow
            };
            
            context.Messwert.Add(retryMesswert);
            
            // Retry once
            await context.SaveChangesAsync();
            _logger.LogDebug($"Saved Messwert after sequence sync: {sensorKey} = {value}");
        }
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error handling MQTT message for topic: {args.ApplicationMessage.Topic}");
    }
}

        public async Task StartMeasurement(int messungId, int messeinstellungId)
        {
            _logger.LogInformation($"Starting measurement: MessungID={messungId}, MesseinstellungID={messeinstellungId}");

            _currentMessungId = messungId;
            _currentMesseinstellungId = messeinstellungId;

            // Load SondenPositionen for this Messeinstellung
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<WebDbContext>();

            // Synchronize Messwert sequence at the start to prevent duplicate key errors
            await SynchronizeMesswertSequenceAsync(context);

            var sondenPositionen = await context.SondenPosition
                .Where(sp => sp.MesseinstellungID == messeinstellungId)
                .ToListAsync();

            _logger.LogInformation($"Found {sondenPositionen.Count} SondenPositionen for MesseinstellungID {messeinstellungId}");

            if (sondenPositionen.Count == 0)
            {
                _logger.LogWarning($"No SondenPositionen found for MesseinstellungID {messeinstellungId}. Cannot save MQTT values. Please create SondenPositionen first.");
            }

            _sondenPositionMap.Clear();
            foreach (var sp in sondenPositionen)
            {
                var key = $"S{sp.Schenkel}S{sp.Position}";
                _sondenPositionMap[key] = sp.ID;
                _logger.LogInformation($"Mapped {key} -> SondenPositionID: {sp.ID}");
            }

            _logger.LogInformation($"Loaded {_sondenPositionMap.Count} SondenPositionen mappings");
        }

        public void StopMeasurement()
        {
            _logger.LogInformation("Stopping measurement");
            _currentMessungId = null;
            _currentMesseinstellungId = null;
            _sondenPositionMap.Clear();
        }

        public bool IsMeasuring => _currentMessungId.HasValue;

        private async Task SynchronizeMesswertSequenceAsync(WebDbContext context)
        {
            try
            {
                // Synchronize the Messwert sequence to the current max ID + 1
                var sql = @"SELECT setval(
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

            if (_mqttClient != null && _mqttClient.IsConnected)
            {
                await _mqttClient.DisconnectAsync(cancellationToken: cancellationToken);
                _mqttClient.Dispose();
            }

            await base.StopAsync(cancellationToken);
        }
    }
}
