using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var webSocketService = new WebSocketService();
        await webSocketService.StartWebSocketAsync();
    }
}
