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
    public class MesssondenkalibrierungController : ControllerBase
    {
        private readonly WebDbContext _context;

        public MesssondenkalibrierungController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/Messsondenkalibrierung
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Messsondenkalibrierung>>> GetMesssondenkalibrierung()
        {
            return await _context.Messsondenkalibrierung.ToListAsync();
        }

        // GET: api/Messsondenkalibrierung/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Messsondenkalibrierung>> GetMesssondenkalibrierung(int id)
        {
            var messsondenkalibrierung = await _context.Messsondenkalibrierung.FindAsync(id);

            if (messsondenkalibrierung == null)
            {
                return NotFound();
            }

            return messsondenkalibrierung;
        }

        // PUT: api/Messsondenkalibrierung/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMesssondenkalibrierung(int id, Messsondenkalibrierung messsondenkalibrierung)
        {
            if (id != messsondenkalibrierung.ID)
            {
                return BadRequest();
            }

            _context.Entry(messsondenkalibrierung).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MesssondenkalibrierungExists(id))
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

        // POST: api/Messsondenkalibrierung
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Messsondenkalibrierung>> PostMesssondenkalibrierung(Messsondenkalibrierung messsondenkalibrierung)
        {
            _context.Messsondenkalibrierung.Add(messsondenkalibrierung);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMesssondenkalibrierung", new { id = messsondenkalibrierung.ID }, messsondenkalibrierung);
        }

        // DELETE: api/Messsondenkalibrierung/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMesssondenkalibrierung(int id)
        {
            var messsondenkalibrierung = await _context.Messsondenkalibrierung.FindAsync(id);
            if (messsondenkalibrierung == null)
            {
                return NotFound();
            }

            _context.Messsondenkalibrierung.Remove(messsondenkalibrierung);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MesssondenkalibrierungExists(int id)
        {
            return _context.Messsondenkalibrierung.Any(e => e.ID == id);
        }
    }
}
