using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;

namespace TrenchAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SensormessungController : ControllerBase
    {
        private readonly WebDbContext _context;

        public SensormessungController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/Sensormessung
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sensormessung>>> GetSensormessung()
        {
            return await _context.Sensormessung.ToListAsync();
        }

        // GET: api/Sensormessung/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Sensormessung>> GetSensormessung(int id)
        {
            var sensormessung = await _context.Sensormessung.FindAsync(id);

            if (sensormessung == null)
            {
                return NotFound();
            }

            return sensormessung;
        }

        // PUT: api/Sensormessung/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSensormessung(int id, Sensormessung sensormessung)
        {
            if (id != sensormessung.SensormessungID)
            {
                return BadRequest();
            }

            _context.Entry(sensormessung).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SensormessungExists(id))
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

        // POST: api/Sensormessung
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Sensormessung>> PostSensormessung(Sensormessung sensormessung)
        {
            _context.Sensormessung.Add(sensormessung);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSensormessung", new { id = sensormessung.SensormessungID }, sensormessung);
        }

        // DELETE: api/Sensormessung/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSensormessung(int id)
        {
            var sensormessung = await _context.Sensormessung.FindAsync(id);
            if (sensormessung == null)
            {
                return NotFound();
            }

            _context.Sensormessung.Remove(sensormessung);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SensormessungExists(int id)
        {
            return _context.Sensormessung.Any(e => e.SensormessungID == id);
        }
    }
}
