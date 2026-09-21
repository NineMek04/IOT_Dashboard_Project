using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace iot_dashboard_backend.Models
{
    public class MaintenanceRecord
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string MachineId { get; set; } = string.Empty;
        public string OrderRef { get; set; } = string.Empty;
        public string IssueDescription { get; set; } = string.Empty;
        public string ResolutionNotes { get; set; } = string.Empty;
        public string TechnicianName { get; set; } = string.Empty; // เก็บ E-Signature
        public DateTime CompletedAt { get; set; }
    }
}