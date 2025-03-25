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
            return await _context.Messsonde.ToListAsync();
        }

        // GET: api/Messsonde/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Messsonde>> GetMesssonde(int id)
        {
            var messsonde = await _context.Messsonde.FindAsync(id);

            if (messsonde == null)
            {
                return NotFound();
            }

            return messsonde;
        }

        // PUT: api/Messsonde/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Messsonde>> PostMesssonde(Messsonde messsonde)
        {
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

        private bool MesssondeExists(int id)
        {
            return _context.Messsonde.Any(e => e.ID == id);
        }
    }
}
