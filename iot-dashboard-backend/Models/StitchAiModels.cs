namespace iot_dashboard_backend.Models
{
    // รับค่ามาจาก Angular
    public class AiDiagnosisRequest
    {
        public string MachineId { get; set; } = string.Empty;
        public string ManualCommand { get; set; } = string.Empty;
    }

    // ส่งค่ากลับไปให้ Angular เพื่อ Render
    public class AiDiagnosisResponse
    {
        public string RootCause { get; set; } = string.Empty;
        public string ImpactPrediction { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
        public double ConfidenceScore { get; set; }
    }
}