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
    public class MesswertController : ControllerBase
    {
        private readonly WebDbContext _context;

        public MesswertController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/Messwert
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Messwert>>> GetMesswert()
        {
            return await _context.Messwert.ToListAsync();
        }

        // GET: api/Messwert/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Messwert>> GetMesswert(int id)
        {
            var messwert = await _context.Messwert.FindAsync(id);

            if (messwert == null)
            {
                return NotFound();
            }

            return messwert;
        }

        // PUT: api/Messwert/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMesswert(int id, Messwert messwert)
        {
            if (id != messwert.ID)
            {
                return BadRequest();
            }

            _context.Entry(messwert).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MesswertExists(id))
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

        // POST: api/Messwert
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Messwert>> PostMesswert(Messwert messwert)
        {
            _context.Messwert.Add(messwert);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMesswert", new { id = messwert.ID }, messwert);
        }

        // DELETE: api/Messwert/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMesswert(int id)
        {
            var messwert = await _context.Messwert.FindAsync(id);
            if (messwert == null)
            {
                return NotFound();
            }

            _context.Messwert.Remove(messwert);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MesswertExists(int id)
        {
            return _context.Messwert.Any(e => e.ID == id);
        }
    }
}
