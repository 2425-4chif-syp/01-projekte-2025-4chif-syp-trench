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
                .WithTopic("trench_adc_test/#")
                .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                .Build();
            
            var subscribeResult = await _mqttClient.SubscribeAsync(topicFilter);
            
            Console.WriteLine($"Subscribed to topic: trench_adc_test/# (Result: {subscribeResult.Items.First().ResultCode})");
        }

        private async Task HandleReceivedMessage(MqttApplicationMessageReceivedEventArgs arg)
        {
            try
            {
                var topic = arg.ApplicationMessage.Topic;
                var payload = arg.ApplicationMessage.ConvertPayloadToString();
                
                if (double.TryParse(payload, out var value))
                {
                    _topicValues.AddOrUpdate(topic, value, (_, __) => value);
                    
                    // WebSocket-Clients benachrichtigen
                    var message = $"{topic}:{value}";
                    var buffer = Encoding.UTF8.GetBytes(message);
                    
                    foreach (var client in _webSocketClients)
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
                            _webSocketClients.Remove(client);
                        }
                    }
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
                await _mqttClient.UnsubscribeAsync("trench_adc_test/#");
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