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
    public class MesssondenTypController : ControllerBase
    {
        private readonly WebDbContext _context;

        public MesssondenTypController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/MesssondenTyp
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MesssondenTyp>>> GetMesssondenTyp()
        {
            return await _context.MesssondenTyp.ToListAsync();
        }

        // GET: api/MesssondenTyp/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MesssondenTyp>> GetMesssondenTyp(int id)
        {
            var messsondenTyp = await _context.MesssondenTyp.FindAsync(id);

            if (messsondenTyp == null)
            {
                return NotFound();
            }

            return messsondenTyp;
        }

        // PUT: api/MesssondenTyp/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMesssondenTyp(int id, MesssondenTyp messsondenTyp)
        {
            if (id != messsondenTyp.ID)
            {
                return BadRequest();
            }

            _context.Entry(messsondenTyp).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MesssondenTypExists(id))
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

        // POST: api/MesssondenTyp
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<MesssondenTyp>> PostMesssondenTyp(MesssondenTyp messsondenTyp)
        {
            _context.MesssondenTyp.Add(messsondenTyp);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMesssondenTyp", new { id = messsondenTyp.ID }, messsondenTyp);
        }

        // DELETE: api/MesssondenTyp/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMesssondenTyp(int id)
        {
            var messsondenTyp = await _context.MesssondenTyp.FindAsync(id);
            if (messsondenTyp == null)
            {
                return NotFound();
            }

            _context.MesssondenTyp.Remove(messsondenTyp);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MesssondenTypExists(int id)
        {
            return _context.MesssondenTyp.Any(e => e.ID == id);
        }
    }
}
