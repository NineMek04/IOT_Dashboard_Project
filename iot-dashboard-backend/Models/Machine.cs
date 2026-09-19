using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace iot_dashboard_backend.Models
{
    public class Machine
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("machineName")]
        public string MachineName { get; set; } = null!;

        [BsonElement("machineType")]
        public string MachineType { get; set; } = null!; // เช่น "Wire Bonder", "Burn-in Oven"

        [BsonElement("status")]
        public string Status { get; set; } = "Running"; // Running, Idle, Maintenance, Error

        // --- ข้อมูลอายุการใช้งาน (Lifecycle) ---
        [BsonElement("runTimeHours")]
        public double RunTimeHours { get; set; } // ชั่วโมงการทำงานสะสม

        [BsonElement("cycleCount")]
        public long CycleCount { get; set; } // จำนวนรอบการทำงานสะสม

        // --- ข้อมูลการสอบเทียบและบำรุงรักษา (Maintenance & Calibration) ---
        [BsonElement("lastMaintenanceDate")]
        public DateTime LastMaintenanceDate { get; set; }

        [BsonElement("nextMaintenanceDate")]
        public DateTime NextMaintenanceDate { get; set; } // สำหรับแจ้งเตือน PM (Preventive Maintenance)

        [BsonElement("calibrationDriftOffset")]
        public double CalibrationDriftOffset { get; set; } // ค่าความคลาดเคลื่อนที่ยอมรับได้
    }
}