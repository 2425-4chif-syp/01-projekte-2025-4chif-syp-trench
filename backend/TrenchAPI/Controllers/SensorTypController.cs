using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Context;
using TrenchAPI.Models;

namespace TrenchAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SensorTypController : ControllerBase
    {
        private readonly WebDbContext _context;

        public SensorTypController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/SensorTyp
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SensorTyp>>> GetSensorTyp()
        {
            return await _context.SensorTyp.ToListAsync();
        }

        // GET: api/SensorTyp/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SensorTyp>> GetSensorTyp(int id)
        {
            var sensorTyp = await _context.SensorTyp.FindAsync(id);

            if (sensorTyp == null)
            {
                return NotFound();
            }

            return sensorTyp;
        }

        // PUT: api/SensorTyp/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSensorTyp(int id, SensorTyp sensorTyp)
        {
            if (id != sensorTyp.SensorTypID)
            {
                return BadRequest();
            }

            _context.Entry(sensorTyp).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SensorTypExists(id))
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

        // POST: api/SensorTyp
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SensorTyp>> PostSensorTyp(SensorTyp sensorTyp)
        {
            _context.SensorTyp.Add(sensorTyp);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSensorTyp", new { id = sensorTyp.SensorTypID }, sensorTyp);
        }

        // DELETE: api/SensorTyp/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSensorTyp(int id)
        {
            var sensorTyp = await _context.SensorTyp.FindAsync(id);
            if (sensorTyp == null)
            {
                return NotFound();
            }

            _context.SensorTyp.Remove(sensorTyp);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SensorTypExists(int id)
        {
            return _context.SensorTyp.Any(e => e.SensorTypID == id);
        }
    }
}
