﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;
using TrenchAPI.Persistence.DTO;
using System.Text.Json;

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
                return await _context.Messung
                    .Include(m => m.Messeinstellung)
                        .ThenInclude(me => me.Spule)!.ThenInclude(s => s.SpuleTyp)
                    .Include(m => m.Messeinstellung)
                        .ThenInclude(me => me.SondenTyp)
                    .ToListAsync();       
        }

        // GET: api/Messung/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Messung>> GetMessung(int id)
        {
            var messung = await _context.Messung
                .Include(m => m.Messeinstellung)
                .FirstOrDefaultAsync(m => m.ID == id);

            if (messung == null)
            {
                return NotFound();
            }

            return messung;
        }

        // PUT: api/Messung/5
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
        [HttpPost]
        public async Task<ActionResult<Messung>> PostMessung(MessungCreateDto messungDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!_context.Messeinstellung.Any(st => st.ID == messungDto.MesseinstellungID))
            {
                return BadRequest("Der angegebene Messeinstellung existiert nicht for some reason?. (DEBUG: 1)");
            }

            var messung = new Messung
            {
                ID = messungDto.ID,
                MesseinstellungID = messungDto.MesseinstellungID,
                Anfangszeitpunkt = messungDto.Anfangszeitpunkt,
                Endzeitpunkt = messungDto.Endzeitpunkt,
                Name = messungDto.Name,
                Tauchkernstellung = messungDto.Tauchkernstellung,
                Pruefspannung = messungDto.Pruefspannung,
                Notiz = messungDto.Notiz
            };

            var existingMesseinstellung = _context.Messeinstellung.Find(messung.MesseinstellungID);

            if (existingMesseinstellung == null)
            {
                return BadRequest("Der angegebene Messeinstellung existiert nicht. (DEBUG: 2)");
            }

            _context.Messung.Add(messung);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMessung", new { id = messung.ID }, messung);
        }

        // POST: api/Messung/Complete
        [HttpPost("Complete")]
        public async Task<ActionResult<Messung>> PostCompleteMessung(Messung messung)
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

        // DELETE: api/Messung
        [HttpDelete]
        public async Task<IActionResult> DeleteMessungen()
        {
            var messungen = await _context.Messung.ToListAsync();
            if (!messungen.Any())
            {
                return NotFound();
            }

            _context.Messung.RemoveRange(messungen);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MessungExists(int id)
        {
            return _context.Messung.Any(e => e.ID == id);
        }
    }
}