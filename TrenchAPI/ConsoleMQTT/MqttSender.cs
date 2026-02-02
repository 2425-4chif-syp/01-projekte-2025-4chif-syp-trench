using MQTTnet;
using MQTTnet.Client;
using System;
using System.Diagnostics;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace ConsoleMqtt
{
    class MqttSender
    {
        private static IMqttClient? _mqttPublisherClient;
        private static MqttSubscriber? _subscriber;

        public static async Task sendData()
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
            Console.WriteLine("Starting to send messages...");
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
            var stopwatch = Stopwatch.StartNew();
            long iterationCount = 0;
            const double targetFrequency = 300.0; // 300 times per second
            const double targetIntervalMs = 1000.0 / targetFrequency; // 3.33 ms

            while (true)
            {
                var messages = new List<MqttApplicationMessage>();

                for (int i = 1; i <= 4; i++)
                {
                    for (int j = 1; j <= 8; j++)
                    {
                        string topic = $"trench_mqtt_mock_v2/rj{i}/probe{j}";
                        
                        // Generate standard normal distribution using Box-Muller transform
                        double u1 = 1.0 - random.NextDouble();
                        double u2 = 1.0 - random.NextDouble();
                        double standardNormal = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
                        
                        // Scale to range 2.5 to 3.9 (mean = 3.2, std dev = 0.35)
                        double randomValue = 3.2 + standardNormal * 0.35;
                        randomValue = Math.Max(2.5, Math.Min(3.9, randomValue)); // Clamp to range
                        
                        byte[] payload = new byte[16];
                        BitConverter.GetBytes((float)randomValue).CopyTo(payload, 0);

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
                    //Console.WriteLine($"Publishing to {message.Topic}: {System.Text.Encoding.UTF8.GetString(message.Payload)}");
                    return _mqttPublisherClient.PublishAsync(message, CancellationToken.None);
                });

                await Task.WhenAll(publishTasks);
                //Console.WriteLine($"All {messages.Count} messages published at {DateTime.Now:T}");

                iterationCount++;
                
                // Calculate next iteration
                double targetElapsedMs = iterationCount * targetIntervalMs;
                double actualElapsedMs = stopwatch.Elapsed.TotalMilliseconds;
                double waitTimeMs = targetElapsedMs - actualElapsedMs;

                // Use SpinWait for sub-millisecond precision when close to target
                if (waitTimeMs > 1)
                {
                    await Task.Delay((int)waitTimeMs - 1);
                    waitTimeMs = targetElapsedMs - stopwatch.Elapsed.TotalMilliseconds;
                }

                // Spin wait for the remaining sub-millisecond time
                while (stopwatch.Elapsed.TotalMilliseconds < targetElapsedMs)
                {
                    Thread.SpinWait(10);
                }
            }
        }
    }
}