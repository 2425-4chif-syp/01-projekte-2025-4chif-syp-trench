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
    public class SpuleTypController : ControllerBase
    {
        private readonly WebDbContext _context;

        public SpuleTypController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/SpuleTyp
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SpulenTyp>>> GetSpuleTyp()
        {
            return await _context.SpulenTyp.ToListAsync();
        }

        // GET: api/SpuleTyp/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SpulenTyp>> GetSpuleTyp(int id)
        {
            var spuleTyp = await _context.SpulenTyp.FindAsync(id);

            if (spuleTyp == null)
            {
                return NotFound();
            }

            return spuleTyp;
        }

        // PUT: api/SpuleTyp/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSpuleTyp(int id, SpulenTyp spuleTyp)
        {
            if (id != spuleTyp.SpulenTypID)
            {
                return BadRequest();
            }

            _context.Entry(spuleTyp).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SpuleTypExists(id))
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

        // POST: api/SpuleTyp
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SpulenTyp>> PostSpuleTyp(SpulenTyp spuleTyp)
        {
            _context.SpulenTyp.Add(spuleTyp);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSpuleTyp", new { id = spuleTyp.SpulenTypID }, spuleTyp);
        }

        // DELETE: api/SpuleTyp/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpuleTyp(int id)
        {
            var spuleTyp = await _context.SpulenTyp.FindAsync(id);
            if (spuleTyp == null)
            {
                return NotFound();
            }

            _context.SpulenTyp.Remove(spuleTyp);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SpuleTypExists(int id)
        {
            return _context.SpulenTyp.Any(e => e.SpulenTypID == id);
        }
    }
}
