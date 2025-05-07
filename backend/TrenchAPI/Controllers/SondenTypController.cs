﻿using System;
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
    public class SondenTypController : ControllerBase
    {
        private readonly WebDbContext _context;

        public SondenTypController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/SondenTyp
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SondenTyp>>> GetSondenTyp()
        {
            return await _context.SondenTyp.ToListAsync();
        }

        // GET: api/SondenTyp/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SondenTyp>> GetSondenTyp(int id)
        {
            var SondenTyp = await _context.SondenTyp.FindAsync(id);

            if (SondenTyp == null)
            {
                return NotFound();
            }

            return SondenTyp;
        }

        // PUT: api/SondenTyp/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSondenTyp(int id, SondenTyp SondenTyp)
        {
            if (id != SondenTyp.ID)
            {
                return BadRequest();
            }

            _context.Entry(SondenTyp).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SondenTypExists(id))
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

        // POST: api/SondenTyp
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SondenTyp>> PostSondenTyp(SondenTyp SondenTyp)
        {
            _context.SondenTyp.Add(SondenTyp);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSondenTyp", new { id = SondenTyp.ID }, SondenTyp);
        }

        // DELETE: api/SondenTyp/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSondenTyp(int id)
        {
            var SondenTyp = await _context.SondenTyp.FindAsync(id);
            if (SondenTyp == null)
            {
                return NotFound();
            }

            _context.SondenTyp.Remove(SondenTyp);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SondenTypExists(int id)
        {
            return _context.SondenTyp.Any(e => e.ID == id);
        }
    }
}
