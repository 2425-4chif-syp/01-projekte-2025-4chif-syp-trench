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
    public class SpuleController : ControllerBase
    {
        private readonly WebDbContext _context;

        public SpuleController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/Spule
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Spule>>> GetSpule()
        {
            return await _context.Spule.Include(s => s.SpuleTyp).ToListAsync();
        }

        // GET: api/Spule/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Spule>> GetSpule(int id)
        {
            var spule = await _context.Spule.Include(s => s.SpuleTyp).FirstOrDefaultAsync(s => s.ID == id);

            if (spule == null)
            {
                return NotFound();
            }

            return spule;
        }

        // PUT: api/Spule/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSpule(int id, Spule spule)
        {
            if (id != spule.ID)
            {
                return BadRequest();
            }

            _context.Entry(spule).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SpuleExists(id))
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

        // POST: api/Spule
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Spule>> PostSpule(SpuleCreateDto spuleDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!_context.SpuleTyp.Any(st => st.ID == spuleDto.SpuleTypID))
            {
                return BadRequest("Der angegebene SpuleTyp existiert nicht.");
            }

            var spule = new Spule
            {
                // ID wird automatisch von der Datenbank generiert
                SpuleTypID = spuleDto.SpuleTypID,
                Bemessungsspannung = spuleDto.Bemessungsspannung,
                Bemessungsfrequenz = spuleDto.Bemessungsfrequenz,
                Auftragsnr = spuleDto.Auftragsnr,
                AuftragsPosNr = spuleDto.AuftragsPosNr,
                Einheit = spuleDto.Einheit,
            };

            var existingSpuleTyp = _context.SpuleTyp.Find(spule.SpuleTypID);
            if (existingSpuleTyp == null)
            {
                return BadRequest("Der angegebene SpuleTyp existiert nicht.");
            }

            spule.SpuleTyp = existingSpuleTyp;

            _context.Spule.Add(spule);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSpule", new { id = spule.ID }, spule);
        }

        // DELETE: api/Spule/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpule(int id)
        {
            var spule = await _context.Spule.FindAsync(id);
            if (spule == null)
            {
                return NotFound();
            }

            _context.Spule.Remove(spule);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete()]
        public async Task<IActionResult> DeleteSpulen()
        {
            var spulen = await _context.Spule.ToListAsync();
            if (spulen == null)
            {
                return NotFound();
            }

            foreach(var spule in spulen)
            {
                _context.Spule.Remove(spule);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SpuleExists(int id)
        {
            return _context.Spule.Any(e => e.ID == id);
        }
    }
}
