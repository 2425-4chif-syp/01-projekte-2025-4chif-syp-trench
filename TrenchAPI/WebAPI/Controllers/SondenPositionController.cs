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
    public class SondenPositionController : ControllerBase
    {
        private readonly WebDbContext _context;

        public SondenPositionController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/SondenPosition
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SondenPosition>>> GetSondenPosition()
        {
            return await _context.SondenPosition
                .Include(sp => sp.Sonde)
                    .ThenInclude(s => s.SondenTyp)
                .Include(sp => sp.Messeinstellung)
                    .ThenInclude(me => me.Spule)!.ThenInclude(s => s.SpuleTyp)
                .Include(sp => sp.Messeinstellung)
                    .ThenInclude(me => me.SondenTyp)
                .ToListAsync();
        }

        // GET: api/SondenPosition/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SondenPosition>> GetSondenPosition(int id)
        {
            var sondenPosition = await _context.SondenPosition
                .Include(sp => sp.Sonde)
                    .ThenInclude(s => s.SondenTyp)
                .Include(sp => sp.Messeinstellung)
                    .ThenInclude(me => me.Spule)!.ThenInclude(s => s.SpuleTyp)
                .Include(sp => sp.Messeinstellung)
                    .ThenInclude(me => me.SondenTyp)
                .FirstOrDefaultAsync(sp => sp.ID == id);

            if (sondenPosition == null)
            {
                return NotFound();
            }

            return sondenPosition;
        }

        [HttpGet("Messeinstellung/{messeinstellungId}")]
        public async Task<ActionResult<IEnumerable<SondenPosition>>> GetSondenPositionByMesseinstellung(int messeinstellungId)
        {
            var sondenPosition = await _context.SondenPosition
                .Include(sp => sp.Sonde)
                    .ThenInclude(s => s.SondenTyp)
                .Include(sp => sp.Messeinstellung)
                    .ThenInclude(me => me.Spule)!.ThenInclude(s => s.SpuleTyp)
                .Include(sp => sp.Messeinstellung)
                    .ThenInclude(me => me.SondenTyp)
                .Where(sp => sp.MesseinstellungID == messeinstellungId)
                .ToListAsync();

            if (sondenPosition.Count == 0)
            {
                return NotFound();
            }

            return sondenPosition;
        }

        // PUT: api/SondenPosition/5 
        [HttpPut("{id}")]
public async Task<IActionResult> PutSondenPosition(int id, SondenPositionUpdateDto dto)
{
    if (id != dto.ID) return BadRequest("ID passt nicht.");
    if (!ModelState.IsValid) return BadRequest(ModelState);

    var sondenPosition = await _context.SondenPosition
                                       .FirstOrDefaultAsync(sp => sp.ID == id);
    if (sondenPosition is null) return NotFound();

    // Messeinstellung prüfen
    if (!_context.Messeinstellung.Any(me => me.ID == dto.MesseinstellungID))
        return BadRequest("Die angegebene Messeinstellung existiert nicht.");

    // Sonde nur prüfen, wenn sie angegeben wurde
    if (dto.SondeID.HasValue &&
        !_context.Sonde.Any(s => s.ID == dto.SondeID.Value))
        return BadRequest("Die angegebene Sonde existiert nicht.");

    // Werte übernehmen
    sondenPosition.SondeID = dto.SondeID;            // null oder Wert
    sondenPosition.MesseinstellungID = dto.MesseinstellungID;
    sondenPosition.Position = dto.Position;
    sondenPosition.Schenkel = dto.Schenkel;

    await _context.SaveChangesAsync();
    return NoContent();
}


        // POST: api/SondenPosition
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754

        [HttpPost]
public async Task<ActionResult<SondenPosition>> PostSondenPosition(SondenPositionCreateDto dto)
{
    if (!ModelState.IsValid) return BadRequest(ModelState);

    // Messeinstellung MUSS existieren
    if (!_context.Messeinstellung.Any(me => me.ID == dto.MesseinstellungID))
        return BadRequest("Die angegebene Messeinstellung existiert nicht.");

    // Sonde nur prüfen, wenn sie angegeben wurde
    Sonde? existingSonde = null;
    if (dto.SondeID.HasValue)
    {
        existingSonde = await _context.Sonde.FindAsync(dto.SondeID.Value);
        if (existingSonde is null)
            return BadRequest("Die angegebene Sonde existiert nicht.");
    }

    var sondenPosition = new SondenPosition
    {
        SondeID = dto.SondeID,                // kann null sein
        Sonde   = existingSonde,              // null oder Entity
        MesseinstellungID = dto.MesseinstellungID,
        Position = dto.Position,
        Schenkel = dto.Schenkel
    };

    _context.SondenPosition.Add(sondenPosition);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetSondenPosition),
                           new { id = sondenPosition.ID },
                           sondenPosition);
}


        // DELETE: api/SondenPosition/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSondenPosition(int id)
        {
            var sondenPosition = await _context.SondenPosition.FindAsync(id);
            if (sondenPosition == null)
            {
                return NotFound();
            }

            _context.SondenPosition.Remove(sondenPosition);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SondenPositionExists(int id)
        {
            return _context.SondenPosition.Any(e => e.ID == id);
        }
    }
}
