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
using TrenchAPI.WebAPI.Services;

namespace TrenchAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessungController : ControllerBase
    {
        private readonly WebDbContext _context;
        private readonly MqttMeasurementService _mqttService;
        private static bool _isMeasuring = false;
        private static int? _currentMessungID = null;

        public MessungController(WebDbContext context, MqttMeasurementService mqttService)
        {
            _context = context;
            _mqttService = mqttService;
        }

        // GET: api/Messung
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Messung>>> GetMessung()
        {
                return await _context.Messung
                    .Include(m => m.Messeinstellung)
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
                .Where(m => m.messung_id == id)
                .OrderBy(m => m.zeitpunkt)
                .Select(m => new {
                    m.ID,
                    m.messung_id,
                    m.sondenposition_id,
                    m.wert,
                    m.zeitpunkt
                })
                .ToListAsync();

            return messwerte;
        }

        [HttpPost("startMeasuring")]
        public async Task<ActionResult<int>> StartMeasuring([FromBody] MessungStartDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!_context.Messeinstellung.Any(me => me.ID == dto.messeinstellung_id))
            {
                return BadRequest("Die angegebene Messeinstellung existiert nicht.");
            }

            // Erstelle neue Messung
            var messung = new Messung
            {
                messeinstellung_id = dto.messeinstellung_id,
                anfangszeitpunkt = DateTime.UtcNow,
                endzeitpunkt = DateTime.MinValue,
                name = dto.name ?? $"Messung_{DateTime.UtcNow:yyyyMMdd_HHmmss}",
                tauchkernstellung = dto.tauchkernstellung,
                pruefspannung = dto.pruefspannung,
                notiz = dto.notiz ?? ""
            };

            _context.Messung.Add(messung);
            await _context.SaveChangesAsync();

            _isMeasuring = true;
            _currentMessungID = messung.ID;

            // Start MQTT measurement service
            await _mqttService.StartMeasurement(messung.ID, dto.messeinstellung_id);

            return Ok(messung.ID);
        }

        [HttpPost("stopMeasuring")]
        public async Task<ActionResult> StopMeasuring()
        {
            if (!_isMeasuring || _currentMessungID == null)
            {
                return BadRequest("Keine aktive Messung gefunden.");
            }

            var messung = await _context.Messung.FindAsync(_currentMessungID.Value);
            if (messung == null)
            {
                return NotFound("Messung nicht gefunden.");
            }

            messung.endzeitpunkt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _isMeasuring = false;
            _currentMessungID = null;

            // Stop MQTT measurement service
            _mqttService.StopMeasurement();

            return Ok();
        }

        // POST: api/Messung/AddLiveMesswert
        [HttpPost("AddLiveMesswert")]
        public async Task<ActionResult> AddLiveMesswert([FromBody] LiveMesswertDto dto)
        {
            if (!_isMeasuring || _currentMessungID == null)
            {
                return BadRequest("Keine aktive Messung.");
            }

            if (!_context.SondenPosition.Any(sp => sp.ID == dto.sondenposition_id))
            {
                return BadRequest("Die angegebene SondenPosition existiert nicht.");
            }

            var messwert = new Messwert
            {
                messung_id = _currentMessungID.Value,
                sondenposition_id = dto.sondenposition_id,
                wert = dto.wert,
                zeitpunkt = DateTime.UtcNow
            };

            _context.Messwert.Add(messwert);
            await _context.SaveChangesAsync();

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
                .OrderByDescending(m => m.anfangszeitpunkt)
                .FirstOrDefaultAsync();

            if (currentMessung == null)
            {
                return NotFound("Keine Messung gefunden");
            }

            var messwerte = await _context.Messwert
                .Where(m => m.messung_id == currentMessung.ID)
                .OrderBy(m => m.zeitpunkt)
                .Select(m => new {
                    m.ID,
                    m.messung_id,
                    m.sondenposition_id,
                    m.wert,
                    m.zeitpunkt
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

            if (!_context.Messeinstellung.Any(st => st.ID == messungDto.messeinstellung_id))
            {
                return BadRequest("Der angegebene Messeinstellung existiert nicht for some reason?. (DEBUG: 1)");
            }

            var messung = new Messung
            {
                // Don't set ID - let database auto-generate it
                messeinstellung_id = messungDto.messeinstellung_id,
                anfangszeitpunkt = messungDto.anfangszeitpunkt,
                endzeitpunkt = messungDto.endzeitpunkt,
                name = messungDto.name,
                tauchkernstellung = messungDto.tauchkernstellung,
                pruefspannung = messungDto.pruefspannung,
                notiz = messungDto.notiz
            };

            var existingMesseinstellung = _context.Messeinstellung.Find(messung.messeinstellung_id);

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
            Console.WriteLine($"=== PostCompleteMessung aufgerufen ===");
            Console.WriteLine($"MesseinstellungID: {messungDto.messeinstellung_id}");
            Console.WriteLine($"Anzahl Messsonden: {messungDto.Messsonden?.Count ?? 0}");
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine("ModelState ist ungültig!");
                return BadRequest(ModelState);
            }

            // Erstelle die Messung
            var messung = new Messung
            {
                messeinstellung_id = messungDto.messeinstellung_id,
                anfangszeitpunkt = messungDto.anfangszeitpunkt,
                endzeitpunkt = messungDto.endzeitpunkt,
                notiz = messungDto.notiz
            };

            _context.Messung.Add(messung);
            await _context.SaveChangesAsync();
            Console.WriteLine($"Messung erstellt mit ID: {messung.ID}");

            // Hole die existierenden SondenPositionen für diese Messeinstellung
            var sondenPositionen = await _context.SondenPosition
                .Where(sp => sp.messeinstellung_id == messungDto.messeinstellung_id)
                .ToListAsync();

            Console.WriteLine($"Gefundene SondenPositionen: {sondenPositionen.Count}");
            foreach (var sp in sondenPositionen)
            {
                Console.WriteLine($"  - ID: {sp.ID}, Schenkel: {sp.schenkel}, Position: {sp.position}");
            }

            if (!sondenPositionen.Any())
            {
                Console.WriteLine("FEHLER: Keine Sondenpositionen gefunden!");
                return BadRequest("Keine Sondenpositionen für diese Messeinstellung gefunden. Bitte konfigurieren Sie zuerst die Sondenpositionen.");
            }

            if (messungDto.Messsonden == null || !messungDto.Messsonden.Any())
            {
                Console.WriteLine("WARNUNG: Keine Messsonden-Daten vorhanden");
                return CreatedAtAction("GetMessung", new { id = messung.ID }, messung);
            }

            int totalMesswerte = 0;
            // Speichere die Messwerte
            foreach (var messsonde in messungDto.Messsonden)
            {
                Console.WriteLine($"Verarbeite Messsonde: Schenkel {messsonde.schenkel}, Position {messsonde.position}, Messwerte: {messsonde.Messwerte?.Count ?? 0}");
                
                // Finde die passende SondenPosition für diesen Schenkel und Position
                var sondenPosition = sondenPositionen.FirstOrDefault(sp => 
                    sp.schenkel == messsonde.schenkel && 
                    sp.position == messsonde.position);

                if (sondenPosition == null)
                {
                    Console.WriteLine($"WARNUNG: Keine SondenPosition gefunden für Schenkel {messsonde.schenkel}, Position {messsonde.position}");
                    continue;
                }

                Console.WriteLine($"SondenPosition gefunden: ID {sondenPosition.ID}");

                // Speichere alle Messwerte für diese Position
                if (messsonde.Messwerte != null)
                {
                    for (int i = 0; i < messsonde.Messwerte.Count; i++)
                    {
                        var wert = messsonde.Messwerte[i];
                        var messwert = new Messwert
                        {
                            messung_id = messung.ID,
                            sondenposition_id = sondenPosition.ID,
                            wert = (decimal)wert,
                            zeitpunkt = messung.anfangszeitpunkt.AddSeconds(i)
                        };

                        _context.Messwert.Add(messwert);
                        totalMesswerte++;
                    }
                }
            }

            Console.WriteLine($"Speichere {totalMesswerte} Messwerte...");
            await _context.SaveChangesAsync();
            Console.WriteLine($"Messung erfolgreich gespeichert mit {totalMesswerte} Messwerten!");

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