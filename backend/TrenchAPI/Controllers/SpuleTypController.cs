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
    public class SpuleTypController : ControllerBase
    {
        private readonly WebDbContext _context;

        public SpuleTypController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/SpuleTyp
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SpuleTyp>>> GetSpuleTyp()
        {
            return await _context.SpuleTyp.ToListAsync();
        }

        // GET: api/SpuleTyp/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SpuleTyp>> GetSpuleTyp(int id)
        {
            var spuleTyp = await _context.SpuleTyp.FindAsync(id);

            if (spuleTyp == null)
            {
                return NotFound();
            }

            return spuleTyp;
        }

        // PUT: api/SpuleTyp/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ApiKeyAuth]
        public async Task<IActionResult> PutSpuleTyp(int id, SpuleTyp spuleTyp)
        {
            if (id != spuleTyp.ID)
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
        [ApiKeyAuth]
        public async Task<ActionResult<SpuleTyp>> PostSpuleTyp(SpuleTyp spuleTyp)
        {
            _context.SpuleTyp.Add(spuleTyp);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSpuleTyp", new { id = spuleTyp.ID }, spuleTyp);
        }

        // DELETE: api/SpuleTyp/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpuleTyp(int id)
        {
            var spuleTyp = await _context.SpuleTyp.FindAsync(id);
            if (spuleTyp == null)
            {
                return NotFound();
            }

            _context.SpuleTyp.Remove(spuleTyp);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete()]
        public async Task<IActionResult> DeleteSpuleTypen()
        {
            var spulenTypen = await _context.SpuleTyp.ToListAsync();
            if (spulenTypen == null)
            {
                return NotFound();
            }

            foreach (var spuleTyp in spulenTypen)
            {
                _context.SpuleTyp.Remove(spuleTyp);
            }

            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    _context.Database.ExecuteSqlRaw("ALTER SEQUENCE \"YourTableName_ID_seq\" RESTART WITH 1");

                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SpuleTypExists(int id)
        {
            return _context.SpuleTyp.Any(e => e.ID == id);
        }
    }
}
