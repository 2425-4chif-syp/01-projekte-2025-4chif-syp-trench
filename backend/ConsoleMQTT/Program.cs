using MQTTnet;
using MQTTnet.Client;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ConsoleMqtt
{
    class Program
    {
        private static IMqttClient _mqttPublisherClient;
        private static MqttSubscriber _subscriber;

        static async Task Main(string[] args)
        {
            // Create separate factory instances (optional)
            var factory = new MqttFactory();

            // Configure publisher (using your existing WebSocket config)
            _mqttPublisherClient = factory.CreateMqttClient();
            var publisherOptions = new MqttClientOptionsBuilder()
                .WithWebSocketServer("ws://vm90.htl-leonding.ac.at:9001/ws")
                .WithCredentials("student", "passme")
                .Build();

            // Configure subscriber (using TCP/MQTT protocol)
            var subscriberClient = factory.CreateMqttClient();
            var subscriberOptions = new MqttClientOptionsBuilder()
                .WithTcpServer("vm90.htl-leonding.ac.at") // Default port 1883
                .WithCredentials("student", "passme")
                .Build();

            // Connect publisher
            var pubConnectResult = await _mqttPublisherClient.ConnectAsync(publisherOptions);
            if (pubConnectResult.ResultCode != MqttClientConnectResultCode.Success)
            {
                Console.WriteLine($"Failed to connect publisher: {pubConnectResult.ResultCode}");
                return;
            }

            // Connect subscriber
            var subConnectResult = await subscriberClient.ConnectAsync(subscriberOptions);
            if (subConnectResult.ResultCode != MqttClientConnectResultCode.Success)
            {
                Console.WriteLine($"Failed to connect subscriber: {subConnectResult.ResultCode}");
                return;
            }

            Console.WriteLine("Both clients connected successfully");

            // Initialize subscriber
            _subscriber = new MqttSubscriber();
            await _subscriber.InitializeWithExistingClient(subscriberClient);

            // Start sending messages
            await SendMessagesPeriodically();

            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();

            // Cleanup
            await _subscriber.DisconnectAsync();
            await _mqttPublisherClient.DisconnectAsync();
        }

        private static async Task SendMessagesPeriodically()
        {
            var random = new Random();

            while (true)
            {
                var messages = new List<MqttApplicationMessage>();

                for (int i = 1; i <= 4; i++)
                {
                    for (int j = 1; j <= 8; j++)
                    {
                        string topic = $"trench_adc_test/S{i}S{j}";
                        double randomValue = 1000 + random.NextDouble() * 1000;
                        string payload = randomValue.ToString("F2");

                        var message = new MqttApplicationMessageBuilder()
                            .WithTopic(topic)
                            .WithPayload(payload)
                            .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                            .WithRetainFlag()
                            .Build();

                        messages.Add(message);
                    }
                }

                var publishTasks = messages.Select(message => 
                {
                    Console.WriteLine($"Publishing to {message.Topic}: {System.Text.Encoding.UTF8.GetString(message.Payload)}");
                    return _mqttPublisherClient.PublishAsync(message, CancellationToken.None);
                });

                await Task.WhenAll(publishTasks);
                Console.WriteLine($"All {messages.Count} messages published at {DateTime.Now:T}");

                await Task.Delay(5000);
            }
        }
    }
}