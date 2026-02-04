using MQTTnet;
using MQTTnet.Client;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
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
        private static Dictionary<string, List<string>> _csvData = new Dictionary<string, List<string>>();

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

            // Load CSV data
            LoadCsvData();

            // Start sending messages
            Console.WriteLine("Starting to send messages...");
            await SendMessagesPeriodically();

            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();

            // Cleanup
            await _subscriber.DisconnectAsync();
            await _mqttPublisherClient.DisconnectAsync();
        }

        private static void LoadCsvData()
        {
            // Find CSV file relative to current directory or solution root
            string csvFileName = "20260112-Dump.csv";
            string csvPath = FindCsvFile(csvFileName);
            
            if (csvPath == null || !File.Exists(csvPath))
            {
                Console.WriteLine($"CSV file not found: {csvFileName}");
                return;
            }
            
            Console.WriteLine($"Using CSV file: {csvPath}");

            var lines = File.ReadAllLines(csvPath);
            Console.WriteLine($"Loaded {lines.Length} lines from CSV");

            foreach (var line in lines)
            {
                var parts = line.Split(',');
                if (parts.Length >= 2)
                {
                    string topicPath = parts[0]; // e.g., "/data/rj1/probe8"
                    string encodedData = parts[1]; // base64 encoded byte array

                    // Extract rj and probe from topic path
                    var topicParts = topicPath.Split('/');
                    if (topicParts.Length >= 3)
                    {
                        string key = $"{topicParts[2]}/{topicParts[3]}"; // e.g., "rj1/probe8"
                        
                        if (!_csvData.ContainsKey(key))
                        {
                            _csvData[key] = new List<string>();
                        }
                        
                        _csvData[key].Add(encodedData);
                    }
                }
            }

            Console.WriteLine($"Organized data for {_csvData.Count} unique probe(s)");
            foreach (var kvp in _csvData)
            {
                Console.WriteLine($"  {kvp.Key}: {kvp.Value.Count} entries");
            }
            
            if (_csvData.Count == 0)
            {
                Console.WriteLine("WARNING: No probe data was loaded from CSV!");
            }
        }

        private static string? FindCsvFile(string fileName)
        {
            // Start from current directory
            string currentDir = Directory.GetCurrentDirectory();
            
            // Check current directory first
            string path = Path.Combine(currentDir, fileName);
            if (File.Exists(path))
                return path;
            
            // Search up to 5 levels up to find the file
            DirectoryInfo? dirInfo = new DirectoryInfo(currentDir);
            for (int i = 0; i < 5 && dirInfo != null; i++)
            {
                path = Path.Combine(dirInfo.FullName, fileName);
                if (File.Exists(path))
                    return path;
                
                dirInfo = dirInfo.Parent;
            }
            
            return null;
        }

        private static async Task SendMessagesPeriodically()
        {
            if (_csvData.Count == 0)
            {
                Console.WriteLine("ERROR: No CSV data loaded. Cannot send messages.");
                return;
            }
            
            var tasks = new List<Task>();

            // Create independent thread for each probe that has data
            foreach (var kvp in _csvData)
            {
                string probeKey = kvp.Key;
                var task = Task.Run(async () => await SendProbeMessagesPeriodically(probeKey));
                tasks.Add(task);
            }

            // Wait for all threads to complete (they run indefinitely)
            await Task.WhenAll(tasks);
        }

        private static async Task SendProbeMessagesPeriodically(string probeKey)
        {
            var stopwatch = Stopwatch.StartNew();
            long iterationCount = 0;
            const double targetFrequency = 300.0; // 300 times per second
            const double targetIntervalMs = 1000.0 / targetFrequency; // 3.33 ms
            
            // Extract rj and probe numbers from key (e.g., "rj1/probe8")
            var parts = probeKey.Split('/');
            string rjPart = parts[0]; // "rj1"
            string probePart = parts[1]; // "probe8"
            
            string topic = $"trench_mqtt_mock_vTEST/{rjPart}/{probePart}";
            
            if (!_csvData.ContainsKey(probeKey) || _csvData[probeKey].Count == 0)
            {
                Console.WriteLine($"No data for {probeKey}");
                return;
            }

            var dataList = _csvData[probeKey];
            int dataIndex = 0;

            while (true)
            {
                // Get the current encoded data from CSV
                string encodedData = dataList[dataIndex];
                
                // Decode base64 to byte array
                byte[] payload = Convert.FromBase64String(encodedData);

                var message = new MqttApplicationMessageBuilder()
                    .WithTopic(topic)
                    .WithPayload(payload)
                    .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                    .WithRetainFlag()
                    .Build();

                await _mqttPublisherClient.PublishAsync(message, CancellationToken.None);

                // Move to next data entry, loop back to start if at end
                dataIndex = (dataIndex + 1) % dataList.Count;

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