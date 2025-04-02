using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public class WebSocketService
{
    private readonly List<WebSocket> _clients = new();

    public async Task HandleWebSocketAsync(WebSocket webSocket)
    {
        _clients.Add(webSocket);
        Console.WriteLine("🔗 Neuer WebSocket-Client verbunden");

        var buffer = new byte[1024 * 4];
        while (webSocket.State == WebSocketState.Open)
        {
            var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (result.MessageType == WebSocketMessageType.Close)
            {
                break;
            }
        }

        _clients.Remove(webSocket);
        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Client getrennt", CancellationToken.None);
    }

    public async Task BroadcastAsync(string message)
    {
        var buffer = Encoding.UTF8.GetBytes(message);
        foreach (var client in _clients)
        {
            if (client.State == WebSocketState.Open)
            {
                await client.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }
}
