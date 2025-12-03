using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;
using TrenchAPI.Persistence.DTO;

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
            return await _context.Sonde.Include(s => s.SondenTyp).ToListAsync();
        }

        // GET: api/Sonde/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Sonde>> GetSonde(int id)
        {
            var Sonde = await _context.Sonde.Include(s => s.SondenTyp).FirstOrDefaultAsync(s => s.ID == id);

            if (Sonde == null)
            {
                return NotFound();
            }

            return Sonde;
        }

        // PUT: api/Sonde/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSonde(int id, SondeUpdateDto dto)
        {
            if (id != dto.ID) return BadRequest("ID in Route stimmt nicht mit DTO überein.");

            var sonde = await _context.Sonde.FirstOrDefaultAsync(s => s.ID == id);
            if (sonde == null) return NotFound();

            if (!_context.SondenTyp.Any(st => st.ID == dto.SondenTypID))
                return BadRequest("Der angegebene Sondentyp existiert nicht.");

            sonde.SondenTypID        = dto.SondenTypID;
            sonde.Name               = dto.Name;
            sonde.Kalibrierungsfaktor= dto.Kalibrierungsfaktor;

            await _context.SaveChangesAsync();
            return NoContent();
        }


        // POST: api/Sonde
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Sonde>> PostSonde(SondeCreateDto sondeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!_context.SondenTyp.Any(st => st.ID == sondeDto.SondenTypID))
            {
                return BadRequest("Der angegebene Sondentyp existiert nicht. (DEBUG: 1)");
            }

            // If ID is set and already exists, reset to 0 to let database auto-generate
            int sondeId = sondeDto.ID;
            if (sondeId > 0 && await SondeExists(sondeId))
            {
                sondeId = 0;
            }
            
            var sonde = new Sonde
            {
                ID = sondeId,
                SondenTypID = sondeDto.SondenTypID,
                Name = sondeDto.Name,
                Kalibrierungsfaktor = sondeDto.Kalibrierungsfaktor,
            };

            var existingSondenTyp = _context.SondenTyp.Find(sonde.SondenTypID);
            if (existingSondenTyp == null)
            {
                return BadRequest("Der angegebene Sondentyp existiert nicht. (DEBUG: 2)");
            }

            sonde.SondenTyp = existingSondenTyp;

            _context.Sonde.Add(sonde);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSonde", new { id = sonde.ID }, sonde);
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

        private async Task<bool> SondeExists(int id)
        {
            return await _context.Sonde.AnyAsync(e => e.ID == id);
        }
    }
}
