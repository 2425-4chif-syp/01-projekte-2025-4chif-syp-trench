using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public class WebSocketService
{
    private readonly ClientWebSocket _webSocket;

    public WebSocketService()
    {
        _webSocket = new ClientWebSocket();
    }

    public async Task StartWebSocketAsync()
    {
        Uri serverUri = new Uri("ws://localhost:5127/ws"); // WebSocket-Server-URL
        await _webSocket.ConnectAsync(serverUri, CancellationToken.None);
        Console.WriteLine("✅ WebSocket verbunden!");

        // Empfang von Nachrichten
        await ReceiveMessagesAsync();
    }

    public async Task ReceiveMessagesAsync()
    {
        byte[] buffer = new byte[1024];

        while (_webSocket.State == WebSocketState.Open)
        {
            var result = await _webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (result.MessageType == WebSocketMessageType.Text)
            {
                string message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                Console.WriteLine($"📡 Empfangene Nachricht: {message}");
            }
        }
    }

    public async Task SendMessageAsync(string message)
    {
        byte[] buffer = Encoding.UTF8.GetBytes(message);
        await _webSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        Console.WriteLine($"📤 Gesendete Nachricht: {message}");
    }
}