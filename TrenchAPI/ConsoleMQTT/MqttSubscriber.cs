using MQTTnet;
using MQTTnet.Client;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.WebSockets;
using System.Text;
using System.Threading;

namespace ConsoleMqtt
{
    public class MqttSubscriber
    {
        private IMqttClient _mqttClient;
        private readonly ConcurrentDictionary<string, double> _topicValues = new ConcurrentDictionary<string, double>();
        private List<WebSocket> _webSocketClients = new List<WebSocket>();

        public IReadOnlyDictionary<string, double> CurrentValues => _topicValues;

        public async Task InitializeWithExistingClient(IMqttClient mqttClient)
        {
            _mqttClient = mqttClient ?? throw new ArgumentNullException(nameof(mqttClient));

            // Verify client is connected
            if (!_mqttClient.IsConnected)
            {
                throw new InvalidOperationException("MQTT client must be connected before initialization");
            }

            // Set up event handlers
            _mqttClient.ApplicationMessageReceivedAsync += HandleReceivedMessage;
            
            // Subscribe to the topic pattern with QoS ExactlyOnce to match publisher
            var topicFilter = new MqttTopicFilterBuilder()
                .WithTopic("trench_mqtt_mock_v2/#")
                .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                .Build();
            
            var subscribeResult = await _mqttClient.SubscribeAsync(topicFilter);
            
            Console.WriteLine($"Subscribed to topic: trench_mqtt_mock_v2/# (Result: {subscribeResult.Items.First().ResultCode})");
        }

        private async Task HandleReceivedMessage(MqttApplicationMessageReceivedEventArgs arg)
{
    try
    {
        var topic = arg.ApplicationMessage.Topic;
        var payloadBytes = arg.ApplicationMessage.PayloadSegment.Array;
        
        // Parse the new topic structure
        var topicParts = topic.Split('/', StringSplitOptions.RemoveEmptyEntries);
        
        // Find rj and probe parts in the topic
        string rjNumber = null;
        string probeNumber = null;
        
        foreach (var part in topicParts)
        {
            if (part.StartsWith("rj", StringComparison.OrdinalIgnoreCase) && rjNumber == null)
            {
                rjNumber = part.Length > 2 ? part.Substring(2) : null;
            }
            else if (part.StartsWith("probe", StringComparison.OrdinalIgnoreCase) && probeNumber == null)
            {
                probeNumber = part.Length > 5 ? part.Substring(5) : null;
            }
        }
        
        // Validate we found both parts and can parse the payload
        if (rjNumber != null && probeNumber != null &&
            int.TryParse(rjNumber, out var rjNum) &&
            int.TryParse(probeNumber, out var probeNum) &&
            payloadBytes != null && payloadBytes.Length >= 16)
        {
            // Convert byte array to float value
            var value = BitConverter.ToSingle(payloadBytes, 0);
            
            // Construct the legacy topic format
            var legacyTopic = $"S{rjNum}S{probeNum}";
            
            // Store the value
            _topicValues.AddOrUpdate(legacyTopic, value, (_, __) => value);
            
            // WebSocket-Clients benachrichtigen
            var message = $"{legacyTopic}:{value}";
            var buffer = Encoding.UTF8.GetBytes(message);
            
            // Thread-safe client iteration
            var clientsSnapshot = _webSocketClients.ToList();
            var clientsToRemove = new List<WebSocket>();
            
            foreach (var client in clientsSnapshot)
            {
                try
                {
                    if (client.State == WebSocketState.Open)
                    {
                        await client.SendAsync(
                            new ArraySegment<byte>(buffer),
                            WebSocketMessageType.Text,
                            true,
                            CancellationToken.None
                        );
                    }
                    else
                    {
                        clientsToRemove.Add(client);
                    }
                }
                catch (Exception clientEx)
                {
                    Console.WriteLine($"Error sending to WebSocket client: {clientEx.Message}");
                    clientsToRemove.Add(client);
                }
            }
            
            // Remove disconnected clients
            foreach (var client in clientsToRemove)
            {
                _webSocketClients.Remove(client);
            }
        }
        else
        {
            Console.WriteLine($"Failed to parse topic or payload: {topic}, payload bytes: {payloadBytes?.Length ?? 0}");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error processing message: {ex.Message}");
    }
}

        public async Task DisconnectAsync()
        {
            if (_mqttClient != null && _mqttClient.IsConnected)
            {
                _mqttClient.ApplicationMessageReceivedAsync -= HandleReceivedMessage;
                await _mqttClient.UnsubscribeAsync("trench_mqtt_mock_v2/#");
            }
            _topicValues.Clear();
        }

        public void AddWebSocketClient(WebSocket webSocket)
        {
            _webSocketClients.Add(webSocket);
        }

        public void RemoveWebSocketClient(WebSocket webSocket)
        {
            _webSocketClients.Remove(webSocket);
        }
    }
}