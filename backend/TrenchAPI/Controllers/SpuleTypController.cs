﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Models;

namespace TrenchAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpuleTypController : ControllerBase
    {
        private readonly SpuleTypContext _context;

        public SpuleTypController(SpuleTypContext context)
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
        public async Task<IActionResult> PutSpuleTyp(int id, SpuleTyp spuleTyp)
        {
            if (id != spuleTyp.SpulenTypId)
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
        public async Task<ActionResult<SpuleTyp>> PostSpuleTyp(SpuleTyp spuleTyp)
        {
            _context.SpuleTyp.Add(spuleTyp);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSpuleTyp", new { id = spuleTyp.SpulenTypId }, spuleTyp);
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

        private bool SpuleTypExists(int id)
        {
            return _context.SpuleTyp.Any(e => e.SpulenTypId == id);
        }
    }
}