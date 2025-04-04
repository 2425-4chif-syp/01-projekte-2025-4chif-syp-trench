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
    public class MesssondeController : ControllerBase
    {
        private readonly WebDbContext _context;

        public MesssondeController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/Messsonde
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Messsonde>>> GetMesssonde()
        {
            return await _context.Messsonde.Include(ms => ms.Messung).ToListAsync();
        }

        // GET: api/Messsonde/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Messsonde>> GetMesssonde(int id)
        {
            var messsonde = await _context.Messsonde
                .Include(ms => ms.Messung)
                .FirstOrDefaultAsync(ms => ms.ID == id);

            if (messsonde == null)
            {
                return NotFound();
            }

            return messsonde;
        }

        // PUT: api/Messsonde/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMesssonde(int id, Messsonde messsonde)
        {
            if (id != messsonde.ID)
            {
                return BadRequest();
            }

            _context.Entry(messsonde).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MesssondeExists(id))
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

        // POST: api/Messsonde
        [HttpPost]
        public async Task<ActionResult<Messsonde>> PostMesssonde(MesssondeCreateDto messsondeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var messung = await _context.Messung.FindAsync(messsondeDto.MessungID);
            if (messung == null)
            {
                return BadRequest("Die angegebene Messung existiert nicht.");
            }

            var messsonde = new Messsonde
            {
                ID = messsondeDto.ID,
                MessungID = messsondeDto.MessungID,
                Schenkel = messsondeDto.Schenkel,
                Notiz = messsondeDto.Notiz,
                Messung = messung
            };

            _context.Messsonde.Add(messsonde);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMesssonde", new { id = messsonde.ID }, messsonde);
        }

        // DELETE: api/Messsonde/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMesssonde(int id)
        {
            var messsonde = await _context.Messsonde.FindAsync(id);
            if (messsonde == null)
            {
                return NotFound();
            }

            _context.Messsonde.Remove(messsonde);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Messsonde
        [HttpDelete]
        public async Task<IActionResult> DeleteMesssonden()
        {
            var messsonden = await _context.Messsonde.ToListAsync();
            if (!messsonden.Any())
            {
                return NotFound();
            }

            _context.Messsonde.RemoveRange(messsonden);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MesssondeExists(int id)
        {
            return _context.Messsonde.Any(e => e.ID == id);
        }
    }
}
