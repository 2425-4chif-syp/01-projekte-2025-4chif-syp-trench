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
    public class MesseinstellungController : ControllerBase
    {
        private readonly WebDbContext _context;

        public MesseinstellungController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/Messeinstellung
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Messeinstellung>>> GetMesseinstellungen()
        {
            return await _context.Messeinstellung
                .Include(me => me.Spule)
                    .ThenInclude(sp => sp.SpuleTyp)
                .Include(me => me.SondenTyp)
                .ToListAsync();
        }


        // GET: api/Messeinstellung/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Messeinstellung>> GetMesseinstellung(int id)
        {
            var messeinstellung = await _context.Messeinstellung
                                            .Include(me => me.Spule)
                                                .ThenInclude(sp => sp.SpuleTyp)
                                            .Include(me => me.SondenTyp)
                                            .FirstOrDefaultAsync(s => s.ID == id);

            if (messeinstellung == null)
            {
                return NotFound();
            }

            return messeinstellung;
        }

        // PUT: api/Messeinstellung/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMesseinstellung(int id, MesseinstellungUpdateDto dto)
        {
            if (id != dto.ID) return BadRequest("ID in Route stimmt nicht mit DTO überein.");

            var messeinstellung = await _context.Messeinstellung
                                                .FirstOrDefaultAsync(me => me.ID == id);

            if (messeinstellung == null) return NotFound();

            var spule = await _context.Spule
                                      .Include(s => s.SpuleTyp)
                                      .FirstOrDefaultAsync(s => s.ID == dto.SpuleID);
            if (spule == null)
                return BadRequest("Die angegebene Spule existiert nicht.");

            var sondenTyp = await _context.SondenTyp.FirstOrDefaultAsync(st => st.ID == dto.SondenTypID);
            if (sondenTyp == null)
                return BadRequest("Der angegebene Sondentyp existiert nicht.");

            // Plausibilitätsprüfung: Max. Sonden pro Schenkel = floor(360 / (Joche * Alpha))
            var joche = spule.SpuleTyp?.Schenkelzahl ?? 0;
            if (joche <= 0)
                return BadRequest("Der zugehörige Spulentyp hat keine gültige Schenkelzahl.");

            if (sondenTyp.Alpha <= 0)
                return BadRequest("Der gewählte Sondentyp hat kein gültiges Alpha.");

            var maxSondenProSchenkelDecimal = 360m / (joche * sondenTyp.Alpha);
            var maxSondenProSchenkel = (int)Math.Floor(maxSondenProSchenkelDecimal);
            if (dto.SondenProSchenkel > maxSondenProSchenkel)
                return BadRequest($"Die Anzahl der Sonden pro Schenkel ist nicht plausibel. Maximal zulässig: {maxSondenProSchenkel}.");

            messeinstellung.SpuleID            = dto.SpuleID;
            messeinstellung.SondenTypID        = dto.SondenTypID;
            messeinstellung.SondenProSchenkel  = dto.SondenProSchenkel;
            messeinstellung.Name               = dto.Name;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/Messeinstellung
        [HttpPost]
        public async Task<ActionResult<Messeinstellung>> PostMesseinstellung(MesseinstellungCreateDto messeinstellungDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var spule = await _context.Spule
                                      .Include(s => s.SpuleTyp)
                                      .FirstOrDefaultAsync(s => s.ID == messeinstellungDto.SpuleID);
            if (spule == null)
            {
                return BadRequest("Die angegebene Spule existiert nicht.");
            }

            var sondenTyp = await _context.SondenTyp.FirstOrDefaultAsync(m => m.ID == messeinstellungDto.SondenTypID);
            if (sondenTyp == null)
            {
                return BadRequest("Der angegebene MesssondenTyp existiert nicht.");
            }

            // Plausibilitätsprüfung: Max. Sonden pro Schenkel = floor(360 / (Joche * Alpha))
            var joche = spule.SpuleTyp?.Schenkelzahl ?? 0;
            if (joche <= 0)
            {
                return BadRequest("Der zugehörige Spulentyp hat keine gültige Schenkelzahl.");
            }

            if (sondenTyp.Alpha <= 0)
            {
                return BadRequest("Der gewählte Sondentyp hat kein gültiges Alpha.");
            }

            var maxSondenProSchenkelDecimal = 360m / (joche * sondenTyp.Alpha);
            var maxSondenProSchenkel = (int)Math.Floor(maxSondenProSchenkelDecimal);
            if (messeinstellungDto.SondenProSchenkel > maxSondenProSchenkel)
            {
                return BadRequest($"Die Anzahl der Sonden pro Schenkel ist nicht plausibel. Maximal zulässig: {maxSondenProSchenkel}.");
            }

            // If ID is set and already exists, reset to 0 to let database auto-generate
            int messeinstellungId = messeinstellungDto.ID;
            if (messeinstellungId > 0 && await MesseinstellungExists(messeinstellungId))
            {
                messeinstellungId = 0;
            }
            
            var messeinstellung = new Messeinstellung
            {
                ID = messeinstellungId,
                SpuleID = messeinstellungDto.SpuleID,
                SondenTypID = messeinstellungDto.SondenTypID,
                SondenProSchenkel = messeinstellungDto.SondenProSchenkel,
                Name = messeinstellungDto.Name,
            };

            messeinstellung.Spule = spule;
            messeinstellung.SondenTyp = sondenTyp;

            _context.Messeinstellung.Add(messeinstellung);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMesseinstellung", new { id = messeinstellung.ID }, messeinstellung);
        }

        // DELETE: api/Messeinstellung/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMesseinstellung(int id)
        {
            var messeinstellung = await _context.Messeinstellung.FindAsync(id);
            if (messeinstellung == null)
            {
                return NotFound();
            }

            _context.Messeinstellung.Remove(messeinstellung);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> MesseinstellungExists(int id)
        {
            return await _context.Messeinstellung.AnyAsync(e => e.ID == id);
        }
    }
}
