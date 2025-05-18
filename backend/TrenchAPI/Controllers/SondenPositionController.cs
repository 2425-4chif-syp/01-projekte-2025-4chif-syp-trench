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
    public class SondenPositionController : ControllerBase
    {
        private readonly WebDbContext _context;

        public SondenPositionController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/SondenPosition
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SondenPosition>>> GetSondenPosition()
        {
            return await _context.SondenPosition.ToListAsync();
        }

        // GET: api/SondenPosition/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SondenPosition>> GetSondenPosition(int id)
        {
            var sondenPosition = await _context.SondenPosition.FindAsync(id);

            if (sondenPosition == null)
            {
                return NotFound();
            }

            return sondenPosition;
        }

        // PUT: api/SondenPosition/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSondenPosition(int id, SondenPosition sondenPosition)
        {
            if (id != sondenPosition.ID)
            {
                return BadRequest();
            }

            _context.Entry(sondenPosition).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SondenPositionExists(id))
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

        // POST: api/SondenPosition
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754

        [HttpPost]
        public async Task<ActionResult<SondenPosition>> PostSondenPosition(SondenPositionCreateDto sondenPositionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!_context.Messeinstellung.Any(st => st.ID == sondenPositionDto.SondeID))
            {
                return BadRequest("Der angegebene Sonde existiert nicht. (DEBUG: 1)");
            }

            if (!_context.Messeinstellung.Any(st => st.ID == sondenPositionDto.MesseinstellungID))
            {
                return BadRequest("Der angegebene Messeinstellung existiert nicht. (DEBUG: 1)");
            }

            var sondenPosition = new SondenPosition
            {
                ID = sondenPositionDto.ID,
                SondeID = sondenPositionDto.SondeID,
                MesseinstellungID = sondenPositionDto.MesseinstellungID,
                Position = sondenPositionDto.Position,
                Schenkel = sondenPositionDto.Schenkel
            };

            var existingSonde = _context.Sonde.Find(sondenPosition.SondeID);
            var existingMesseinstellung = _context.Messeinstellung.Find(sondenPosition.MesseinstellungID);

            if (existingSonde == null)
            {
                return BadRequest("Der angegebene Sonde existiert nicht. (DEBUG: 2)");
            }

            if (existingMesseinstellung == null)
            {
                return BadRequest("Der angegebene Messeinstellung existiert nicht. (DEBUG: 2)");
            }

            _context.SondenPosition.Add(sondenPosition);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSondenPosition", new { id = sondenPosition.ID }, sondenPosition);
        }

        // DELETE: api/SondenPosition/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSondenPosition(int id)
        {
            var sondenPosition = await _context.SondenPosition.FindAsync(id);
            if (sondenPosition == null)
            {
                return NotFound();
            }

            _context.SondenPosition.Remove(sondenPosition);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SondenPositionExists(int id)
        {
            return _context.SondenPosition.Any(e => e.ID == id);
        }
    }
}
