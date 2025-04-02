using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MQTTnet;
using MQTTnet.Client;

namespace MQTTClientApp
{
    class Program
    {
        private static IMqttClient _mqttClient;

        static async Task Main(string[] args)
        {
            // Configure MQTT client options
            var factory = new MqttFactory();
            _mqttClient = factory.CreateMqttClient();

            var options = new MqttClientOptionsBuilder()
                .WithWebSocketServer("ws://vm90.htl-leonding.ac.at:9001/ws")
                .WithCredentials("student", "passme")
                .Build();

            // Connect to the MQTT broker
            var connectResult = await _mqttClient.ConnectAsync(options, CancellationToken.None);

            if (connectResult.ResultCode == MqttClientConnectResultCode.Success)
            {
                Console.WriteLine("Connected to MQTT broker.");

                // Start sending messages periodically
                await SendMessagesPeriodically();
            }
            else
            {
                Console.WriteLine($"Failed to connect to MQTT broker: {connectResult.ResultCode}");
            }
        }

        private static async Task SendMessagesPeriodically()
        {
            var random = new Random();

            while (true)
            {
                // Create a list to hold all messages
                var messages = new List<MqttApplicationMessage>();

                // Generate random values for all sensors
                for (int i = 1; i <= 4; i++)
                {
                    for (int j = 1; j <= 8; j++)
                    {
                        string topic = $"trench_adc_test/S{i}S{j}";
                        double randomValue = 1000 + random.NextDouble()*1000; // Random number between 1000 and 2000
                        string payload = randomValue.ToString("F2"); // Format to 4 decimal places

                        var message = new MqttApplicationMessageBuilder()
                            .WithTopic(topic)
                            .WithPayload(payload)
                            .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                            .WithRetainFlag()
                            .Build();

                        messages.Add(message); // Add the message to the list
                    }
                }

                // Publish all messages concurrently
                var publishTasks = new List<Task>();
                foreach (var message in messages)
                {
                    publishTasks.Add(_mqttClient.PublishAsync(message, CancellationToken.None));
                    Console.WriteLine($"Prepared to publish to {message.Topic}: {System.Text.Encoding.UTF8.GetString(message.Payload)}");
                }

                // Wait for all messages to be published
                await Task.WhenAll(publishTasks);

                Console.WriteLine("All messages published.");

                // Wait for 5 seconds before sending the next set of messages
                await Task.Delay(5000);
            }
        }
    }
}