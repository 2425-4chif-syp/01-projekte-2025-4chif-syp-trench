using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Context;
using TrenchAPI.DTO;
using TrenchAPI.Models;

namespace TrenchAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SensorController : ControllerBase
    {
        private readonly WebDbContext _context;

        public SensorController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/Sensor
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sensor>>> GetSensor()
        {
            // Include SensorTyp in the query
            return await _context.Sensor.Include(s => s.SensorTyp).ToListAsync();
        }

        // GET: api/Sensor/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Sensor>> GetSensor(int id)
        {
            var sensor = await _context.Sensor.Include(s => s.SensorTyp)
                                              .FirstOrDefaultAsync(s => s.SensorID == id);
            if (sensor == null)
            {
                return NotFound();
            }

            return sensor;
        }

        // PUT: api/Sensor/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSensor(int id, Sensor sensor)
        {
            if (id != sensor.SensorID)
            {
                return BadRequest();
            }

            _context.Entry(sensor).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SensorExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Sensor
        [HttpPost]
        public async Task<ActionResult<Sensor>> PostSensor(SensorCreateDto sensorDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check that the referenced SensorTyp exists
            if (!_context.SensorTyp.Any(st => st.SensorTypID == sensorDto.SensorTypID))
            {
                return BadRequest("The specified SensorTyp does not exist.");
            }

            var sensor = new Sensor
            {
                SensorTypID = sensorDto.SensorTypID,
                Durchmesser = sensorDto.Durchmesser,
                Schenkel = sensorDto.Schenkel,
                Position = sensorDto.Position
            };

            // Assign the navigation property
            sensor.SensorTyp = _context.SensorTyp.Find(sensor.SensorTypID);

            _context.Sensor.Add(sensor);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSensor", new { id = sensor.SensorID }, sensor);
        }

        // DELETE: api/Sensor/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSensor(int id)
        {
            var sensor = await _context.Sensor.FindAsync(id);
            if (sensor == null)
            {
                return NotFound();
            }

            _context.Sensor.Remove(sensor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SensorExists(int id)
        {
            return _context.Sensor.Any(e => e.SensorID == id);
        }
    }
}
