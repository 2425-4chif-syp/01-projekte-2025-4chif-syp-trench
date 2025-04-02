using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System.Net.WebSockets;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<WebSocketService>();
builder.Services.AddSingleton<MqttService>();

var app = builder.Build();

app.UseWebSockets();
var webSocketService = app.Services.GetRequiredService<WebSocketService>();
var mqttService = app.Services.GetRequiredService<MqttService>();

// Starte den MQTT-Service
await mqttService.StartAsync();

// WebSocket-Endpunkt
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ws" && context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        await webSocketService.HandleWebSocketAsync(webSocket);
    }
    else
    {
        await next();
    }
});

app.Run();
