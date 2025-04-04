using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;
using TrenchAPI.Persistence.DTO;

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
            return await _context.Messwert
                .Include(mw => mw.Messsonde)
                .ToListAsync();
        }

        // GET: api/Messwert/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Messwert>> GetMesswert(int id)
        {
            var messwert = await _context.Messwert
                .Include(mw => mw.Messsonde)
                .FirstOrDefaultAsync(mw => mw.ID == id);

            if (messwert == null)
            {
                return NotFound();
            }

            return messwert;
        }

        // PUT: api/Messwert/5
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
        [HttpPost]
        public async Task<ActionResult<Messwert>> PostMesswert(MesswertCreateDto messwertDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var messsonde = await _context.Messsonde.FindAsync(messwertDto.MesssondeID);
            if (messsonde == null)
            {
                return BadRequest("Die angegebene Messsonde existiert nicht.");
            }

            var messwert = new Messwert
            {
                ID = messwertDto.ID,
                MesssondeID = messwertDto.MesssondeID,
                Wert = messwertDto.Wert,
                Zeitpunkt = messwertDto.Zeitpunkt,
                Messsonde = messsonde
            };

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

        // DELETE: api/Messwert
        [HttpDelete]
        public async Task<IActionResult> DeleteMesswerte()
        {
            var messwerte = await _context.Messwert.ToListAsync();
            if (!messwerte.Any())
            {
                return NotFound();
            }

            _context.Messwert.RemoveRange(messwerte);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MesswertExists(int id)
        {
            return _context.Messwert.Any(e => e.ID == id);
        }
    }
}
