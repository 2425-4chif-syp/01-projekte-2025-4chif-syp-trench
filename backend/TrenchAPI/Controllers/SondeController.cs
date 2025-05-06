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
    public class SondeController : ControllerBase
    {
        private readonly WebDbContext _context;

        public SondeController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/Sonde
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sonde>>> GetSonde()
        {
            return await _context.Sonde.ToListAsync();
        }

        // GET: api/Sonde/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Sonde>> GetSonde(int id)
        {
            var Sonde = await _context.Sonde.FindAsync(id);

            if (Sonde == null)
            {
                return NotFound();
            }

            return Sonde;
        }

        // PUT: api/Sonde/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSonde(int id, Sonde Sonde)
        {
            if (id != Sonde.ID)
            {
                return BadRequest();
            }

            _context.Entry(Sonde).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SondeExists(id))
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

        // POST: api/Sonde
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Sonde>> PostSonde(Sonde Sonde)
        {
            _context.Sonde.Add(Sonde);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSonde", new { id = Sonde.ID }, Sonde);
        }

        // DELETE: api/Sonde/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSonde(int id)
        {
            var Sonde = await _context.Sonde.FindAsync(id);
            if (Sonde == null)
            {
                return NotFound();
            }

            _context.Sonde.Remove(Sonde);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SondeExists(int id)
        {
            return _context.Sonde.Any(e => e.ID == id);
        }
    }
}
