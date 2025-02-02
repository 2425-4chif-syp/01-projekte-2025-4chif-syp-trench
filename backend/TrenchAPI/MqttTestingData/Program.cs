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

        // Predefined sets of numbers for example_data sensors
        private static readonly List<double[]> ExampleDataSets = new List<double[]>
        {
            new double[] { 1069.7, 1351.4, 1723.8, 1826.3, 1452.2, 1091.7 },
            new double[] { 1015.9, 1325.5, 1667.3, 1670.4, 1351.4, 1051.0 },
            new double[] { 1161.2, 1423.0, 1744.1, 1807.6, 1472.1, 1139.1 }
        };

        private static int _currentExampleDataSetIndex = 0;

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

                // Generate random values for test_data sensors
                for (int i = 1; i <= 6; i++)
                {
                    string topic = $"trench_test/test_data/sensor_{i}";
                    double randomValue = random.NextDouble(); // Random number between 0 and 1
                    string payload = randomValue.ToString("F4"); // Format to 4 decimal places

                    var message = new MqttApplicationMessageBuilder()
                        .WithTopic(topic)
                        .WithPayload(payload)
                        .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                        .WithRetainFlag()
                        .Build();

                    messages.Add(message); // Add the message to the list
                }

                // Generate values for example_data sensors (cycle through predefined sets)
                var exampleDataSet = ExampleDataSets[_currentExampleDataSetIndex];
                for (int i = 1; i <= 6; i++)
                {
                    string topic = $"trench_test/example_data/sensor_{i}";
                    double value = exampleDataSet[i - 1]; // Get the value from the current dataset
                    string payload = value.ToString("F4"); // Format to 4 decimal places

                    var message = new MqttApplicationMessageBuilder()
                        .WithTopic(topic)
                        .WithPayload(payload)
                        .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                        .WithRetainFlag()
                        .Build();

                    messages.Add(message); // Add the message to the list
                }

                // Move to the next dataset for the next iteration
                _currentExampleDataSetIndex = (_currentExampleDataSetIndex + 1) % ExampleDataSets.Count;

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