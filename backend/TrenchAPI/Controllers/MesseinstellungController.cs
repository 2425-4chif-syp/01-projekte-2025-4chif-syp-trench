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

            if (!_context.Spule.Any(s => s.ID == dto.SpuleID))
                return BadRequest("Die angegebene Spule existiert nicht.");
            if (!_context.SondenTyp.Any(st => st.ID == dto.SondenTypID))
                return BadRequest("Der angegebene Sondentyp existiert nicht.");

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

            if (!_context.Spule.Any(s => s.ID == messeinstellungDto.SpuleID))
            {
                return BadRequest("Die angegebene Spule existiert nicht.");
            }

            if (!_context.SondenTyp.Any(m => m.ID == messeinstellungDto.SondenTypID))
            {
                return BadRequest("Der angegebene MesssondenTyp existiert nicht.");
            }

            var messeinstellung = new Messeinstellung
            {
                ID = messeinstellungDto.ID,
                SpuleID = messeinstellungDto.SpuleID,
                SondenTypID = messeinstellungDto.SondenTypID,
                SondenProSchenkel = messeinstellungDto.SondenProSchenkel,
                Name = messeinstellungDto.Name,
            };

            messeinstellung.Spule = await _context.Spule.Include(s => s.SpuleTyp).FirstOrDefaultAsync(m => m.ID == messeinstellung.SpuleID);
            messeinstellung.SondenTyp = await _context.SondenTyp.FindAsync(messeinstellung.SondenTypID);

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
