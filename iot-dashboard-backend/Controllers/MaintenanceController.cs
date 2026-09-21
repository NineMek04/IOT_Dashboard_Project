using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using iot_dashboard_backend.Models;

namespace iot_dashboard_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaintenanceController : ControllerBase
    {
        private readonly IMongoCollection<MaintenanceRecord> _maintenanceCollection;

        public MaintenanceController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("IndustrialIoTDb");
            // เชื่อมไปที่ตาราง MaintenanceRecords ใน MongoDB
            _maintenanceCollection = database.GetCollection<MaintenanceRecord>("MaintenanceRecords");
        }

        // 🔵 POST: api/Maintenance (รับข้อมูลจากหน้าเว็บตอนเซ็นเอกสารมาบันทึก)
        [HttpPost]
        public async Task<IActionResult> CreateMaintenanceRecord([FromBody] MaintenanceRecord record)
        {
            if (record.CompletedAt == default)
            {
                record.CompletedAt = DateTime.UtcNow; // เซ็ตเวลาปัจจุบันถ้าไม่ได้ส่งมา
            }

            await _maintenanceCollection.InsertOneAsync(record);
            return Ok(new { message = "บันทึกประวัติการซ่อมบำรุงลงระบบเรียบร้อยแล้ว", recordId = record.Id });
        }

        // 🟢 GET: api/Maintenance/machine/{machineId} (ดึงประวัติการซ่อมของเครื่องนั้นๆ)
        [HttpGet("machine/{machineId}")]
        public async Task<ActionResult<List<MaintenanceRecord>>> GetHistoryByMachineId(string machineId)
        {
            // ดึงประวัติของเครื่องจักรตัวนี้ และเรียงจากวันที่ซ่อมล่าสุดขึ้นก่อน (Descending)
            var filter = Builders<MaintenanceRecord>.Filter.Eq(r => r.MachineId, machineId);
            var history = await _maintenanceCollection.Find(filter)
                                                      .SortByDescending(r => r.CompletedAt)
                                                      .ToListAsync();
            return Ok(history);
        }

        // 🟢 GET: api/Maintenance (เผื่อไว้ดึงประวัติการซ่อมทั้งหมดของทั้งโรงงาน)
        [HttpGet]
        public async Task<ActionResult<List<MaintenanceRecord>>> GetAllHistory()
        {
            var history = await _maintenanceCollection.Find(_ => true)
                                                      .SortByDescending(r => r.CompletedAt)
                                                      .ToListAsync();
            return Ok(history);
        }
    }
}