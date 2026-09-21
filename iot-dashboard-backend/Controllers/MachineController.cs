using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using iot_dashboard_backend.Models;

namespace iot_dashboard_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MachineController : ControllerBase
    {
        private readonly IMongoCollection<Machine> _machineCollection;
        private readonly iot_dashboard_backend.Services.MqttPublishService _mqttService;

        public MachineController(IMongoClient mongoClient, iot_dashboard_backend.Services.MqttPublishService mqttService)
        {
            var database = mongoClient.GetDatabase("IndustrialIoTDb");
            _machineCollection = database.GetCollection<Machine>("Machines");
            _mqttService = mqttService;
        }

        // 🟢 GET: api/machine (ดึงรายการเครื่องจักรทั้งหมดไปโชว์หน้าเว็บ)
        [HttpGet]
        public async Task<ActionResult<List<Machine>>> GetAllMachines()
        {
            var machines = await _machineCollection.Find(_ => true).ToListAsync();
            return Ok(machines);
        }

        // 🔵 POST: api/machine (ลงทะเบียนเครื่องจักรใหม่)
        [HttpPost]
        public async Task<IActionResult> CreateMachine(Machine newMachine)
        {
            await _machineCollection.InsertOneAsync(newMachine);
            return Ok(newMachine);
        }

        // 🔴 DELETE: api/machine/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMachine(string id)
        {
            var result = await _machineCollection.DeleteOneAsync(x => x.Id == id);

            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "ไม่พบเครื่องจักรที่ต้องการลบ" });
            }

            return Ok(new { message = "ลบเครื่องจักรออกจากระบบเรียบร้อยแล้ว" });
        }

        // ==========================================
        // 👇 ส่วนที่เพิ่มใหม่สำหรับทำระบบ Dummy Telemetry
        // ==========================================

        public class TelemetryUpdateRequest
        {
            public string Status { get; set; } = string.Empty;
            public int RunTimeHours { get; set; }
            public int CycleCount { get; set; }
        }

        // 🟠 PUT: api/machine/{id}/telemetry (รับค่าจำลองจาก Angular มาอัปเดตลง MongoDB)
        // 🟠 PUT: api/machine/{id}/telemetry
        [HttpPut("{id}/telemetry")]
        public async Task<IActionResult> UpdateTelemetry(string id, [FromBody] TelemetryUpdateRequest request)
        {
            // 💡 ทริค: ตรวจสอบว่า id ที่ส่งมาเป็นรหัส 24 หลัก (ObjectId) หรือเป็นชื่อเครื่อง (MachineName)
            bool isObjectId = MongoDB.Bson.ObjectId.TryParse(id, out _);
            var filter = isObjectId
                ? Builders<Machine>.Filter.Eq(m => m.Id, id)
                : Builders<Machine>.Filter.Eq(m => m.MachineName, id);

            var updateDef = Builders<Machine>.Update
                .Set(m => m.Status, request.Status)
                .Set(m => m.RunTimeHours, request.RunTimeHours)
                .Set(m => m.CycleCount, request.CycleCount);

            var result = await _machineCollection.UpdateOneAsync(filter, updateDef);

            if (result.MatchedCount == 0) return NotFound(new { message = "ไม่พบข้อมูลเครื่องจักร" });

            return Ok(new { message = "อัปเดต Telemetry สำเร็จ" });
        }


        public class MachineCommandRequest
        {
            public string Action { get; set; } = string.Empty;
        }


        // ⚡️ POST: api/machine/{id}/command
        [HttpPost("{id}/command")]
        public async Task<IActionResult> ExecuteCommand(string id, [FromBody] MachineCommandRequest request)
        {
            // 💡 ใช้ทริคเดียวกันกับด้านบน
            bool isObjectId = MongoDB.Bson.ObjectId.TryParse(id, out _);
            var filter = isObjectId
                ? Builders<Machine>.Filter.Eq(m => m.Id, id)
                : Builders<Machine>.Filter.Eq(m => m.MachineName, id);

            var machine = await _machineCollection.Find(filter).FirstOrDefaultAsync();
            if (machine == null) return NotFound(new { message = "ไม่พบเครื่องจักร" });

            string newStatus = machine.Status;

            switch (request.Action)
            {
                case "EMERGENCY_STOP": newStatus = "Offline"; break;
                case "APPROVE": newStatus = "Maintenance"; break;
                case "OVERRIDE": newStatus = "Warning"; break;
            }

            var updateDef = Builders<Machine>.Update.Set(m => m.Status, newStatus);
            await _machineCollection.UpdateOneAsync(filter, updateDef);

            await _mqttService.PublishCommandAsync(id, request.Action);

            return Ok(new { message = $"Command {request.Action} sent successfully.", updatedStatus = newStatus });
        }
    }
}