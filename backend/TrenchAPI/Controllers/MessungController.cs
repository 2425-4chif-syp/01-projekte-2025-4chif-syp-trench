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
    public class MessungController : ControllerBase
    {
        private readonly WebDbContext _context;

        public MessungController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/Messung
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Messung>>> GetMessung()
        {
            return await _context.Messung.ToListAsync();
        }

        // GET: api/Messung/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Messung>> GetMessung(int id)
        {
            var messung = await _context.Messung.FindAsync(id);

            if (messung == null)
            {
                return NotFound();
            }

            return messung;
        }

        // PUT: api/Messung/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMessung(int id, Messung messung)
        {
            if (id != messung.ID)
            {
                return BadRequest();
            }

            _context.Entry(messung).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MessungExists(id))
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

        // POST: api/Messung
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Messung>> PostMessung(Messung messung)
        {
            _context.Messung.Add(messung);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMessung", new { id = messung.ID }, messung);
        }

        // DELETE: api/Messung/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessung(int id)
        {
            var messung = await _context.Messung.FindAsync(id);
            if (messung == null)
            {
                return NotFound();
            }

            _context.Messung.Remove(messung);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MessungExists(int id)
        {
            return _context.Messung.Any(e => e.ID == id);
        }
    }
}
