using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MQTTnet;
using MQTTnet.Client;

namespace VirtualMachineSimulator
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.Title = "Industrial IoT - Virtual Machine Simulator";
            Console.WriteLine("==================================================");
            Console.WriteLine("🤖 STARTING VIRTUAL MACHINE SIMULATOR (MQTT) 🤖");
            Console.WriteLine("==================================================");

            var factory = new MqttFactory();
            var mqttClient = factory.CreateMqttClient();

            var options = new MqttClientOptionsBuilder()
                .WithTcpServer("localhost", 1883)
                .WithClientId("VirtualMachine_01_" + Guid.NewGuid().ToString())
                .Build();

            // เมื่อเชื่อมต่อสำเร็จ ให้รอรับฟัง (Subscribe) ทุกคำสั่งของทุกเครื่องจักร
            mqttClient.ConnectedAsync += async e =>
            {
                Console.WriteLine("\n[STATUS] ✅ Connected to MQTT Broker (Mosquitto) successfully!");
                // ใช้เครื่องหมาย + เพื่อรับฟังทุก Machine ID (terahop/machine/อะไรก็ได้/command)
                await mqttClient.SubscribeAsync("terahop/machine/+/command");
                Console.WriteLine("[STATUS] 📡 Listening for commands from Dashboard...\n");
            };

            // เมื่อมีข้อความ (คำสั่ง) วิ่งเข้ามาจาก .NET Backend
            mqttClient.ApplicationMessageReceivedAsync += e =>
            {
                var payload = Encoding.UTF8.GetString(e.ApplicationMessage.PayloadSegment);
                var topic = e.ApplicationMessage.Topic;

                try
                {
                    using var doc = JsonDocument.Parse(payload);
                    var command = doc.RootElement.GetProperty("command").GetString();
                    var machineId = doc.RootElement.GetProperty("machineId").GetString();

                    // ส่งไปแสดงผลสีสันบนหน้าจอ
                    ProcessCommand(machineId, command);
                }
                catch (Exception)
                {
                    Console.WriteLine($"[ERROR] Failed to parse payload: {payload}");
                }

                return Task.CompletedTask;
            };

            // เริ่มการเชื่อมต่อ
            await mqttClient.ConnectAsync(options, CancellationToken.None);

            // ป้องกันไม่ให้โปรแกรมปิดตัวเอง
            Console.ReadLine();
        }

        // ฟังก์ชันสร้าง Effect สีสันบนหน้าจอตอนรับคำสั่ง
        static void ProcessCommand(string machineId, string command)
        {
            Console.WriteLine($"\n>> INCOMING MQTT MESSAGE ON TOPIC: terahop/machine/{machineId}/command");
            Console.Write($"[{DateTime.Now:HH:mm:ss}] [Device: {machineId}] -> ");

            switch (command)
            {
                case "EMERGENCY_STOP":
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("🛑 EMERGENCY STOP ACTIVATED!");
                    Console.WriteLine("          - Cutting main power...");
                    Console.WriteLine("          - Engaging safety brakes...");
                    Console.WriteLine("          - System Halted.");
                    break;
                case "APPROVE":
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("✅ PRESCRIPTIVE ACTION APPROVED");
                    Console.WriteLine("          - Adjusting parameters to optimal state...");
                    Console.WriteLine("          - Resuming normal operations.");
                    break;
                case "OVERRIDE":
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine("⚠️ MANUAL OVERRIDE RECEIVED");
                    Console.WriteLine("          - Bypassing AI safety locks...");
                    Console.WriteLine("          - Operator assumes manual control.");
                    break;
                default:
                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Console.WriteLine($"⚡ CUSTOM COMMAND EXECUTED: {command}");
                    Console.WriteLine("          - Processing diagnostic sequence...");
                    break;
            }
            Console.ResetColor(); // รีเซ็ตสีกลับเป็นปกติ
        }
    }
}