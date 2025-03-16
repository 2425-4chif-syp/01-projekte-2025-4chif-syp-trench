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
    public class GesamtmessungController : ControllerBase
    {
        private readonly WebDbContext _context;

        public GesamtmessungController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/Gesamtmessung
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Gesamtmessung>>> GetGesamtmessung()
        {
            return await _context.Gesamtmessung.ToListAsync();
        }

        // GET: api/Gesamtmessung/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Gesamtmessung>> GetGesamtmessung(int id)
        {
            var gesamtmessung = await _context.Gesamtmessung.FindAsync(id);

            if (gesamtmessung == null)
            {
                return NotFound();
            }

            return gesamtmessung;
        }

        // PUT: api/Gesamtmessung/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGesamtmessung(int id, Gesamtmessung gesamtmessung)
        {
            if (id != gesamtmessung.GesamtmessungID)
            {
                return BadRequest();
            }

            _context.Entry(gesamtmessung).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GesamtmessungExists(id))
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

        // POST: api/Gesamtmessung
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Gesamtmessung>> PostGesamtmessung(Gesamtmessung gesamtmessung)
        {
            _context.Gesamtmessung.Add(gesamtmessung);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetGesamtmessung", new { id = gesamtmessung.GesamtmessungID }, gesamtmessung);
        }

        // DELETE: api/Gesamtmessung/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGesamtmessung(int id)
        {
            var gesamtmessung = await _context.Gesamtmessung.FindAsync(id);
            if (gesamtmessung == null)
            {
                return NotFound();
            }

            _context.Gesamtmessung.Remove(gesamtmessung);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GesamtmessungExists(int id)
        {
            return _context.Gesamtmessung.Any(e => e.GesamtmessungID == id);
        }
    }
}
