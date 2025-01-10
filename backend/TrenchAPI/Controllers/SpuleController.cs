using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Context;
using TrenchAPI.Models;

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
            return await _context.Spule.ToListAsync();
        }

        // GET: api/Spule/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Spule>> GetSpule(int id)
        {
            var spule = await _context.Spule.FindAsync(id);

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
            if (id != spule.SpuleID)
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
        public async Task<ActionResult<Spule>> PostSpule(Spule spule)
        {
            _context.Spule.Add(spule);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSpule", new { id = spule.SpuleID }, spule);
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

        private bool SpuleExists(int id)
        {
            return _context.Spule.Any(e => e.SpuleID == id);
        }
    }
}
