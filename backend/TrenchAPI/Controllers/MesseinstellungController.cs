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
                .Include(m => m.Spule)
                .Include(m => m.MesssondenTyp)
                .ToListAsync();
        }

        // GET: api/Messeinstellung/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Messeinstellung>> GetMesseinstellung(int id)
        {
            var messeinstellung = await _context.Messeinstellung
                .Include(m => m.Spule)
                .Include(m => m.MesssondenTyp)
                .FirstOrDefaultAsync(m => m.ID == id);

            if (messeinstellung == null)
            {
                return NotFound();
            }

            return messeinstellung;
        }

        // PUT: api/Messeinstellung/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMesseinstellung(int id, Messeinstellung messeinstellung)
        {
            if (id != messeinstellung.ID)
            {
                return BadRequest();
            }

            _context.Entry(messeinstellung).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MesseinstellungExists(id))
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

        // POST: api/Messeinstellung
        [HttpPost]
        public async Task<ActionResult<Messeinstellung>> PostMesseinstellung(MesseinstellungCreateDto messeinstellungDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var spule = await _context.Spule.FindAsync(messeinstellungDto.SpuleID);
            if (spule == null)
            {
                return BadRequest("Die angegebene Spule existiert nicht.");
            }

            var messsondenTyp = await _context.MesssondenTyp.FindAsync(messeinstellungDto.MesssondenTypID);
            if (messsondenTyp == null)
            {
                return BadRequest("Der angegebene MesssondenTyp existiert nicht.");
            }

            var messeinstellung = new Messeinstellung
            {
                ID = messeinstellungDto.ID,
                SpuleID = messeinstellungDto.SpuleID,
                MesssondenTypID = messeinstellungDto.MesssondenTypID,
                Sonden_pro_schenkel = messeinstellungDto.Sonden_pro_schenkel,
                Bemessungsspannung = messeinstellungDto.Bemessungsspannung,
                Bemessungsfrequenz = messeinstellungDto.Bemessungsfrequenz,
                Pruefspannung = messeinstellungDto.Pruefspannung,
                Notiz = messeinstellungDto.Notiz
            };

            var existingSpule = _context.Spule.Find(messeinstellung.SpuleID);
            if (existingSpule == null)
            {
                return BadRequest("Die angegebene Spule existiert nicht.");
            }

            var existingMesssondenTyp = _context.MesssondenTyp.Find(messeinstellung.MesssondenTypID);
            if (existingMesssondenTyp == null)
            {
                return BadRequest("Der angegebene MesssondenTyp existiert nicht.");
            }

            messeinstellung.Spule = existingSpule;
            messeinstellung.MesssondenTyp = existingMesssondenTyp;

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
