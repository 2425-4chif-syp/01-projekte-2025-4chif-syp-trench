using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using MQTTnet;
using MQTTnet.Client;
using System;
using System.Diagnostics.Tracing;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace ConsoleMqtt
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddCors();
            builder.Services.AddSingleton<MqttSubscriber>();
            
            // Konfiguriere Kestrel für WebSocket
            builder.WebHost.ConfigureKestrel(serverOptions =>
            {
                serverOptions.ListenAnyIP(8080);
            });
            
            var app = builder.Build();

            // Initialize MQTT client and subscriber
            var factory = new MqttFactory();
            var mqttClient = factory.CreateMqttClient();
            var mqttOptions = new MqttClientOptionsBuilder()
                .WithTcpServer("vm90.htl-leonding.ac.at")
                .WithCredentials("student", "passme")
                .Build();

            var connectResult = await mqttClient.ConnectAsync(mqttOptions);
            if (connectResult.ResultCode != MqttClientConnectResultCode.Success)
            {
                Console.WriteLine($"Failed to connect to MQTT broker: {connectResult.ResultCode}");
                return;
            }

            var mqttSubscriber = app.Services.GetRequiredService<MqttSubscriber>();
            await mqttSubscriber.InitializeWithExistingClient(mqttClient);

            app.UseCors(builder =>
            {
                builder.WithOrigins("http://localhost:4200", "http://frontend:4200")
                       .AllowAnyHeader()
                       .AllowAnyMethod()
                       .AllowCredentials();
            });

            app.UseWebSockets(new WebSocketOptions
            {
                KeepAliveInterval = TimeSpan.FromSeconds(120)
            });

            app.Map("/ws", async context =>
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                    mqttSubscriber.AddWebSocketClient(webSocket);
                    
                    var buffer = new byte[1024];
                    try
                    {
                        while (webSocket.State == WebSocketState.Open)
                        {
                            var result = await webSocket.ReceiveAsync(buffer, CancellationToken.None);
                            if (result.MessageType == WebSocketMessageType.Close)
                            {
                                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                                break;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"WebSocket error: {ex.Message}");
                    }
                    finally
                    {
                        mqttSubscriber.RemoveWebSocketClient(webSocket);
                    }
                }
                else
                {
                    context.Response.StatusCode = 400;
                    await context.Response.WriteAsync("Expected a WebSocket request");
                }
            });

            // Start MQTT sender in background
            _ = MqttSender.sendData();

            Console.WriteLine("Starting WebSocket server on http://0.0.0.0:8080");
            await app.RunAsync();
        }
    }
}