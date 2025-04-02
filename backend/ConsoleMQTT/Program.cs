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
            await MqttSender.sendData();
        }
    }
}