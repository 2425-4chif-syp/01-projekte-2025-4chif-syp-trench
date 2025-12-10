using MQTTnet;
using MQTTnet.Client;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Persistence;
using TrenchAPI.Core.Entities;
using System.Globalization;

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
                    .WithTopic("trench_adc_test/#")
                    .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                    .Build();

                await _mqttClient.SubscribeAsync(topicFilter, stoppingToken);
                _logger.LogInformation("Subscribed to MQTT topic: trench_adc_test/#");

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
                var payload = args.ApplicationMessage.ConvertPayloadToString();

                // Parse topic: trench_adc_test/S1S1 -> Schenkel 1, Sensor 1
                var topicParts = topic.Split('/');
                if (topicParts.Length != 2 || !topicParts[1].StartsWith("S"))
                {
                    return;
                }

                var sensorKey = topicParts[1]; // e.g., "S1S1"

                // Parse value
                if (!double.TryParse(payload, NumberStyles.Any, CultureInfo.InvariantCulture, out var value))
                {
                    _logger.LogWarning($"Could not parse MQTT value: {payload}");
                    return;
                }

                // Get SondenPosition ID from map
                if (!_sondenPositionMap.TryGetValue(sensorKey, out var sondenPositionId))
                {
                    _logger.LogWarning($"No SondenPosition found for key: {sensorKey}");
                    return;
                }

                // Save to database
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<WebDbContext>();

                var messwert = new Messwert
                {
                    messung_id = _currentMessungId.Value,
                    sondenposition_id = sondenPositionId,
                    wert = (decimal)value,
                    zeitpunkt = DateTime.UtcNow
                };

                context.Messwert.Add(messwert);
                await context.SaveChangesAsync();

                _logger.LogDebug($"Saved Messwert: {sensorKey} = {value}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling MQTT message");
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

            var sondenPositionen = await context.SondenPosition
                .Where(sp => sp.messeinstellung_id == messeinstellungId)
                .ToListAsync();

            _logger.LogInformation($"Found {sondenPositionen.Count} SondenPositionen for MesseinstellungID {messeinstellungId}");

            if (sondenPositionen.Count == 0)
            {
                _logger.LogWarning($"No SondenPositionen found for MesseinstellungID {messeinstellungId}. Cannot save MQTT values. Please create SondenPositionen first.");
            }

            _sondenPositionMap.Clear();
            foreach (var sp in sondenPositionen)
            {
                var key = $"S{sp.schenkel}S{sp.position}";
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
