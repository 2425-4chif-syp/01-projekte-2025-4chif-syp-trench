using System;
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
        private static bool _isMeasuring = false;

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

        // GET: api/Messung/5/Messwerte
        [HttpGet("{id}/Messwerte")]
        public async Task<ActionResult<IEnumerable<object>>> GetMesswerte(int id)
        {
            var messung = await _context.Messung
                .FirstOrDefaultAsync(m => m.ID == id);

            if (messung == null)
            {
                return NotFound("Messung nicht gefunden");
            }

            var messwerte = await _context.Messwert
                .Where(m => m.MessungID == id)
                .OrderBy(m => m.Zeitpunkt)
                .Select(m => new {
                    m.ID,
                    m.MessungID,
                    m.SondenPositionID,
                    m.Wert,
                    m.Zeitpunkt
                })
                .ToListAsync();

            return messwerte;
        }

        [HttpPost("startMeasuring")]
        public ActionResult StartMeasuring()
        {
            _isMeasuring = true;
            return Ok();
        }

        [HttpPost("stopMeasuring")]
        public ActionResult StopMeasuring()
        {
            _isMeasuring = false;
            return Ok();
        }

        // GET: api/Messung/Current/Values
        [HttpGet("Current/Values")]
        public async Task<ActionResult<IEnumerable<object>>> GetCurrentMessungValues()
        {
            if (!_isMeasuring)
            {
                return NotFound("Keine aktive Messung gefunden");
            }

            var currentMessung = await _context.Messung
                .OrderByDescending(m => m.Anfangszeitpunkt)
                .FirstOrDefaultAsync();

            if (currentMessung == null)
            {
                return NotFound("Keine Messung gefunden");
            }

            var messwerte = await _context.Messwert
                .Where(m => m.MessungID == currentMessung.ID)
                .OrderBy(m => m.Zeitpunkt)
                .Select(m => new {
                    m.ID,
                    m.MessungID,
                    m.SondenPositionID,
                    m.Wert,
                    m.Zeitpunkt
                })
                .ToListAsync();

            return messwerte;
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
        public async Task<ActionResult<Messung>> PostCompleteMessung(CompleteMessungDto messungDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Erstelle die Messung
            var messung = new Messung
            {
                MesseinstellungID = messungDto.MesseinstellungID,
                Anfangszeitpunkt = messungDto.Anfangszeitpunkt,
                Endzeitpunkt = messungDto.Endzeitpunkt,
                Notiz = messungDto.Notiz
            };

            _context.Messung.Add(messung);
            await _context.SaveChangesAsync();

            // Hole die Messeinstellung mit den zugehörigen Sonden
            var messeinstellung = await _context.Messeinstellung
                .Include(me => me.Spule)
                .Include(me => me.SondenTyp)
                .FirstOrDefaultAsync(me => me.ID == messungDto.MesseinstellungID);

            if (messeinstellung == null)
            {
                return BadRequest("Messeinstellung nicht gefunden");
            }

            // Hole die zugehörigen Sonden für den Sondentyp
            var sonden = await _context.Sonde
                .Where(s => s.SondenTypID == messeinstellung.SondenTypID)
                .ToListAsync();

            if (!sonden.Any())
            {
                return BadRequest("Keine Sonden für den Sondentyp gefunden");
            }

            // Erstelle die SondenPositionen
            var sondenPositionen = new Dictionary<(int schenkel, int position), SondenPosition>();
            foreach (var messsonde in messungDto.Messsonden)
            {
                // Nehme die erste verfügbare Sonde für diesen Sondentyp
                var sonde = sonden.FirstOrDefault();
                if (sonde == null)
                {
                    return BadRequest("Keine Sonde verfügbar");
                }

                var sondenPosition = new SondenPosition
                {
                    MesseinstellungID = messungDto.MesseinstellungID,
                    SondeID = sonde.ID,
                    Schenkel = messsonde.Schenkel,
                    Position = messsonde.Position
                };

                _context.SondenPosition.Add(sondenPosition);
                sondenPositionen[(messsonde.Schenkel, messsonde.Position)] = sondenPosition;
            }

            await _context.SaveChangesAsync();
            // Speichere die Messwerte
            foreach (var messsonde in messungDto.Messsonden)
            {
                var sondenPosition = sondenPositionen[(messsonde.Schenkel, messsonde.Position)];
                foreach (var wert in messsonde.Messwerte)
                {
                    var messwert = new Messwert
                    {
                        MessungID = messung.ID,
                        SondenPositionID = sondenPosition.ID,
                        Wert = (decimal)wert,
                        Zeitpunkt = messung.Anfangszeitpunkt.AddSeconds(messsonde.Messwerte.IndexOf(wert))
                    };

                    _context.Messwert.Add(messwert);
                }
            }

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