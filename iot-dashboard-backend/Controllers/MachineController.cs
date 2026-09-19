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

        public MachineController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("TerahopIoTDb");
            _machineCollection = database.GetCollection<Machine>("Machines");
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
    }
}