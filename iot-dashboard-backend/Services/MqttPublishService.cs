using MQTTnet;
using MQTTnet.Client;
using System.Text.Json;

namespace iot_dashboard_backend.Services
{
    public class MqttPublishService
    {
        private IMqttClient _mqttClient;
        private MqttClientOptions _mqttOptions;

        public MqttPublishService()
        {
            var factory = new MqttFactory();
            _mqttClient = factory.CreateMqttClient();

            _mqttOptions = new MqttClientOptionsBuilder()
                .WithTcpServer("localhost", 1883)
                .WithClientId("Terahop_DotNet_Backend_" + Guid.NewGuid().ToString())
                .Build();
        }

        public async Task PublishCommandAsync(string machineId, string commandType)
        {
            if (!_mqttClient.IsConnected)
            {
                await _mqttClient.ConnectAsync(_mqttOptions, CancellationToken.None);
            }

            var payload = JsonSerializer.Serialize(new
            {
                machineId = machineId,
                command = commandType,
                timestamp = DateTime.UtcNow
            });

            var mqttMessage = new MqttApplicationMessageBuilder()
                .WithTopic($"terahop/machine/{machineId}/command")
                .WithPayload(payload)
                .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.AtLeastOnce)
                .Build();

            await _mqttClient.PublishAsync(mqttMessage, CancellationToken.None);
            Console.WriteLine($"[MQTT] 📡 ยิงคำสั่ง {commandType} ไปที่เครื่อง {machineId} สำเร็จ!");
        }
    }
}