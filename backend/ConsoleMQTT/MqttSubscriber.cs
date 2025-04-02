using MQTTnet;
using MQTTnet.Client;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConsoleMqtt
{
    public class MqttSubscriber
    {
        private IMqttClient _mqttClient;
        private readonly ConcurrentDictionary<string, double> _topicValues = new ConcurrentDictionary<string, double>();

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

        private Task HandleReceivedMessage(MqttApplicationMessageReceivedEventArgs arg)
        {
            try
            {
                var topic = arg.ApplicationMessage.Topic;
                var payload = arg.ApplicationMessage.ConvertPayloadToString();
                
                if (double.TryParse(payload, out var value))
                {
                    _topicValues.AddOrUpdate(topic, value, (_, __) => value);
                    Console.WriteLine($"Received update - {topic}: {value}");
                    
                    if (_topicValues.Count == 32)
                    {
                        Console.WriteLine("\nComplete Set Received:");
                        foreach (var kvp in _topicValues.OrderBy(x => x.Key))
                        {
                            Console.WriteLine($"{kvp.Key.PadRight(20)}: {kvp.Value:F2}");
                        }
                    }
                }
                else
                {
                    Console.WriteLine($"Invalid number in {topic}: {payload}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing message: {ex.Message}");
            }
            
            return Task.CompletedTask;
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
    }
}