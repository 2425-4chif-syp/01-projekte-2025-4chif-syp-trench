using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Controllers;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;
using TrenchAPI.Persistence.DTO;

namespace TrenchAPI.Tests.Controllers
{
    public class MesswertControllerTests : IDisposable
    {
        private readonly WebDbContext _context;
        private readonly MesswertController _controller;

        public MesswertControllerTests()
        {
            var options = new DbContextOptionsBuilder<WebDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new WebDbContext(options);
            _controller = new MesswertController(_context);

            SeedDatabase();
        }

        private void SeedDatabase()
        {
            var spuleTyp = new SpuleTyp
            {
                ID = 1,
                Name = "Test SpuleTyp",
                Schenkelzahl = 3,
                Bandbreite = 10.0m,
                Schichthoehe = 5.0m,
                Durchmesser = 2.0m,
                Toleranzbereich = 0.5m,
                Notiz = ""
            };

            var spule = new Spule
            {
                ID = 1,
                Auftragsnr = "TEST001",
                AuftragsPosNr = "POS1",
                SpuleTypID = 1,
                SpuleTyp = spuleTyp,
                Bemessungsspannung = 220.0m,
                Bemessungsfrequenz = 50.0m,
                Einheit = "Hz",
                Notiz = ""
            };

            var sondenTyp = new SondenTyp
            {
                ID = 1,
                Name = "Test SondenTyp",
                Breite = 10.0m,
                Hoehe = 5.0m,
                Windungszahl = 100,
                Alpha = 1.5m,
                Notiz = ""
            };

            var sonde = new Sonde
            {
                ID = 1,
                SondenTypID = 1,
                SondenTyp = sondenTyp,
                Name = "Test Sonde",
                Kalibrierungsfaktor = 1.5m
            };

            var messeinstellung = new Messeinstellung
            {
                ID = 1,
                Name = "Test Messeinstellung",
                SpuleID = 1,
                Spule = spule,
                SondenTypID = 1,
                SondenTyp = sondenTyp,
                SondenProSchenkel = 3
            };

            var messung = new Messung
            {
                ID = 1,
                MesseinstellungID = 1,
                Messeinstellung = messeinstellung,
                Anfangszeitpunkt = DateTime.UtcNow.AddHours(-1),
                Endzeitpunkt = DateTime.UtcNow,
                Name = "Test Messung",
                Tauchkernstellung = 50.0m,
                Pruefspannung = 230.0m,
                Notiz = ""
            };

            var sondenPosition = new SondenPosition
            {
                ID = 1,
                MesseinstellungID = 1,
                Messeinstellung = messeinstellung,
                SondeID = 1,
                Sonde = sonde,
                Schenkel = 1,
                Position = 100
            };

            var messwert = new Messwert
            {
                ID = 1,
                MessungID = 1,
                Messung = messung,
                SondenPositionID = 1,
                SondenPosition = sondenPosition,
                Wert = 25.5m,
                Zeitpunkt = DateTime.UtcNow
            };

            _context.SpuleTyp.Add(spuleTyp);
            _context.Spule.Add(spule);
            _context.SondenTyp.Add(sondenTyp);
            _context.Sonde.Add(sonde);
            _context.Messeinstellung.Add(messeinstellung);
            _context.Messung.Add(messung);
            _context.SondenPosition.Add(sondenPosition);
            _context.Messwert.Add(messwert);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetMesswert_ReturnsAllMesswerte()
        {
            // Act
            var result = await _controller.GetMesswert();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Messwert>>>(result);
            var messwerte = Assert.IsAssignableFrom<IEnumerable<Messwert>>(actionResult.Value);
            Assert.Single(messwerte);
        }

        [Fact]
        public async Task GetMesswert_WithValidId_ReturnsMesswert()
        {
            // Act
            var result = await _controller.GetMesswert(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Messwert>>(result);
            var messwert = Assert.IsType<Messwert>(actionResult.Value);
            Assert.Equal(1, messwert.ID);
            Assert.Equal(25.5m, messwert.Wert);
        }

        [Fact]
        public async Task GetMesswert_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetMesswert(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetMesswertByMessungId_WithValidId_ReturnsMesswerte()
        {
            // Act
            var result = await _controller.GetMesswertByMessungId(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var messwerte = Assert.IsAssignableFrom<IEnumerable<Messwert>>(okResult.Value);
            Assert.Single(messwerte);
        }

        [Fact]
        public async Task GetMesswertByMessungId_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetMesswertByMessungId(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task PostMesswert_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var newMesswertDto = new MesswertCreateDto
            {
                MessungID = 1,
                SondenPositionID = 1,
                Wert = 30.5m,
                Zeitpunkt = DateTime.UtcNow
            };

            // Act
            var result = await _controller.PostMesswert(newMesswertDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var messwert = Assert.IsType<Messwert>(createdAtActionResult.Value);
            Assert.Equal(30.5m, messwert.Wert);
        }

        [Fact]
        public async Task PostMesswert_WithInvalidMessungID_ReturnsBadRequest()
        {
            // Arrange
            var newMesswertDto = new MesswertCreateDto
            {
                MessungID = 999, // Non-existent Messung
                SondenPositionID = 1,
                Wert = 30.5m,
                Zeitpunkt = DateTime.UtcNow
            };

            // Act
            var result = await _controller.PostMesswert(newMesswertDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task PostMesswert_WithInvalidSondenPositionID_ReturnsBadRequest()
        {
            // Arrange
            var newMesswertDto = new MesswertCreateDto
            {
                MessungID = 1,
                SondenPositionID = 999, // Non-existent SondenPosition
                Wert = 30.5m,
                Zeitpunkt = DateTime.UtcNow
            };

            // Act
            var result = await _controller.PostMesswert(newMesswertDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task PutMesswert_WithValidData_ReturnsNoContent()
        {
            // Arrange
            _context.ChangeTracker.Clear(); // Clear tracked entities
            
            var updatedMesswert = new Messwert
            {
                ID = 1,
                MessungID = 1,
                SondenPositionID = 1,
                Wert = 35.0m,
                Zeitpunkt = DateTime.UtcNow
            };

            // Act
            var result = await _controller.PutMesswert(1, updatedMesswert);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify update
            _context.ChangeTracker.Clear(); // Clear again before querying
            var messwert = await _context.Messwert.FindAsync(1);
            Assert.Equal(35.0m, messwert.Wert);
        }

        [Fact]
        public async Task PutMesswert_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var updatedMesswert = new Messwert
            {
                ID = 2, // Different from URL parameter
                MessungID = 1,
                SondenPositionID = 1,
                Wert = 35.0m,
                Zeitpunkt = DateTime.UtcNow
            };

            // Act
            var result = await _controller.PutMesswert(1, updatedMesswert);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task DeleteMesswert_WithValidId_ReturnsNoContent()
        {
            // Act
            var result = await _controller.DeleteMesswert(1);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify deletion
            var messwert = await _context.Messwert.FindAsync(1);
            Assert.Null(messwert);
        }

        [Fact]
        public async Task DeleteMesswert_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteMesswert(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
