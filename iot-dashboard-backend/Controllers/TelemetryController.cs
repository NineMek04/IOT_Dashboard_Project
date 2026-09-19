using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using iot_dashboard_backend.Models;

namespace iot_dashboard_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TelemetryController : ControllerBase
    {
        private readonly IMongoCollection<Telemetry> _telemetryCollection;

        public TelemetryController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("TerahopIoTDb");
            _telemetryCollection = database.GetCollection<Telemetry>("Telemetries");
        }

        [HttpGet("{machineId}")]
        public async Task<ActionResult<List<Telemetry>>> GetTelemetryByMachineId(string machineId)
        {
            var data = await _telemetryCollection.Find(x => x.MachineId == machineId)
                                                 .SortByDescending(x => x.Timestamp)
                                                 .Limit(100)
                                                 .ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTelemetry(Telemetry newTelemetry)
        {
            newTelemetry.Timestamp = DateTime.UtcNow;
            await _telemetryCollection.InsertOneAsync(newTelemetry);

            return Ok(newTelemetry);
        }
    }
}