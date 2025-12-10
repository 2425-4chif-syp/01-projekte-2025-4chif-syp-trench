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
                                      .FirstOrDefaultAsync(s => s.ID == dto.spule_id);
            if (spule == null)
                return BadRequest("Die angegebene Spule existiert nicht.");

            var sondenTyp = await _context.SondenTyp.FirstOrDefaultAsync(st => st.ID == dto.sondentyp_id);
            if (sondenTyp == null)
                return BadRequest("Der angegebene Sondentyp existiert nicht.");

            messeinstellung.spule_id            = dto.spule_id;
            messeinstellung.sondentyp_id        = dto.sondentyp_id;
            messeinstellung.sonden_pro_schenkel  = dto.sonden_pro_schenkel;
            messeinstellung.name               = dto.name;

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
                                      .FirstOrDefaultAsync(s => s.ID == messeinstellungDto.spule_id);
            if (spule == null)
            {
                return BadRequest("Die angegebene Spule existiert nicht.");
            }

            var sondenTyp = await _context.SondenTyp.FirstOrDefaultAsync(m => m.ID == messeinstellungDto.sondentyp_id);
            if (sondenTyp == null)
            {
                return BadRequest("Der angegebene MesssondenTyp existiert nicht.");
            }

            var messeinstellung = new Messeinstellung
            {
                ID = messeinstellungDto.ID,
                spule_id = messeinstellungDto.spule_id,
                sondentyp_id = messeinstellungDto.sondentyp_id,
                sonden_pro_schenkel = messeinstellungDto.sonden_pro_schenkel,
                name = messeinstellungDto.name,
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

        private bool MesseinstellungExists(int id)
        {
            return _context.Messeinstellung.Any(e => e.ID == id);
        }
    }
}
