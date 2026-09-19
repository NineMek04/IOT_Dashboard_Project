using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace iot_dashboard_backend.Models
{
    public class Telemetry
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        // อ้างอิงไปยังเครื่องจักรตัวไหน
        [BsonElement("machineId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string MachineId { get; set; } = null!;

        // --- ข้อมูลชี้วัดสุขภาพแบบเรียลไทม์ (Condition-Based Monitoring) ---
        [BsonElement("temperature")]
        public double Temperature { get; set; } // อุณหภูมิ (องศาเซลเซียส)

        [BsonElement("vibrationLevel")]
        public double VibrationLevel { get; set; } // ความสั่นสะเทือน (mm/s)

        [BsonElement("currentDraw")]
        public double CurrentDraw { get; set; } // กระแสไฟฟ้าที่กิน (Ampere)

        // --- ข้อมูลการผลิตและข้อผิดพลาด ---
        [BsonElement("yieldRate")]
        public double YieldRate { get; set; } // เปอร์เซ็นต์งานดี (ถ้ามี)

        [BsonElement("errorCode")]
        public string? ErrorCode { get; set; } // ถ้าเป็น null คือเครื่องจักรทำงานปกติ

        [BsonElement("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}