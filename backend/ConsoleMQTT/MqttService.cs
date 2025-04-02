using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Client.Options;

public class MqttService
{
    private readonly IMqttClient _mqttClient;
    private readonly WebSocketService _webSocketService;
    
    public MqttService(WebSocketService webSocketService)
    {
        _webSocketService = webSocketService;
        var factory = new MqttFactory();
        _mqttClient = factory.CreateMqttClient();
    }

    public async Task StartAsync()
    {
        var options = new MqttClientOptionsBuilder()
            .WithWebSocketServer("ws://vm90.htl-leonding.ac.at:9001/ws")
            .WithCredentials("student", "passme")
            .Build();

        _mqttClient.ConnectedAsync += async e =>
        {
            Console.WriteLine("✅ MQTT verbunden!");
            await _mqttClient.SubscribeAsync("trench_test/#");
        };

        _mqttClient.ApplicationMessageReceivedAsync += async e =>
        {
            string topic = e.ApplicationMessage.Topic;
            string payload = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
            Console.WriteLine($"📡 Empfangene Nachricht: {topic} -> {payload}");
            
            // Senden der Daten über WebSocket an Frontend
            await _webSocketService.BroadcastAsync($"{topic}:{payload}");
        };

        await _mqttClient.ConnectAsync(options, CancellationToken.None);
    }
}
