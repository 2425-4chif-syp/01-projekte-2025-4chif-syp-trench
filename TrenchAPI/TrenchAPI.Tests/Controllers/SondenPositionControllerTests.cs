using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Controllers;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;
using TrenchAPI.Persistence.DTO;

namespace TrenchAPI.Tests.Controllers
{
    public class SondenPositionControllerTests : IDisposable
    {
        private readonly WebDbContext _context;
        private readonly SondenPositionController _controller;

        public SondenPositionControllerTests()
        {
            var options = new DbContextOptionsBuilder<WebDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new WebDbContext(options);
            _controller = new SondenPositionController(_context);

            SeedDatabase();
        }

        private void SeedDatabase()
        {
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
                Name = "Test Sonde",
                SondenTypID = 1,
                SondenTyp = sondenTyp,
                Kalibrierungsfaktor = 1.0m
            };

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

            var sondenPosition = new SondenPosition
            {
                ID = 1,
                SondeID = 1,
                Sonde = sonde,
                MesseinstellungID = 1,
                Messeinstellung = messeinstellung,
                Schenkel = 1,
                Position = 1
            };

            _context.SondenTyp.Add(sondenTyp);
            _context.Sonde.Add(sonde);
            _context.SpuleTyp.Add(spuleTyp);
            _context.Spule.Add(spule);
            _context.Messeinstellung.Add(messeinstellung);
            _context.SondenPosition.Add(sondenPosition);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetSondenPosition_ReturnsAllSondenPositions()
        {
            // Act
            var result = await _controller.GetSondenPosition();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<SondenPosition>>>(result);
            var positions = Assert.IsAssignableFrom<IEnumerable<SondenPosition>>(actionResult.Value);
            Assert.Single(positions);
        }

        [Fact]
        public async Task GetSondenPosition_WithValidId_ReturnsSondenPosition()
        {
            // Act
            var result = await _controller.GetSondenPosition(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<SondenPosition>>(result);
            var position = Assert.IsType<SondenPosition>(actionResult.Value);
            Assert.Equal(1, position.ID);
        }

        [Fact]
        public async Task GetSondenPosition_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetSondenPosition(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetSondenPositionByMesseinstellung_ReturnsFilteredPositions()
        {
            // Act
            var result = await _controller.GetSondenPositionByMesseinstellung(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<SondenPosition>>>(result);
            var positions = Assert.IsAssignableFrom<IEnumerable<SondenPosition>>(actionResult.Value);
            Assert.Single(positions);
        }

        [Fact]
        public async Task PutSondenPosition_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var updateDto = new SondenPositionUpdateDto
            {
                ID = 1,
                SondeID = 1,
                MesseinstellungID = 1,
                Schenkel = 2,
                Position = 2
            };

            // Act
            var result = await _controller.PutSondenPosition(1, updateDto);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the update
            var updated = await _context.SondenPosition.FindAsync(1);
            Assert.Equal(2, updated?.Schenkel);
            Assert.Equal(2, updated?.Position);
        }

        [Fact]
        public async Task PutSondenPosition_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var updateDto = new SondenPositionUpdateDto
            {
                ID = 2,
                SondeID = 1,
                MesseinstellungID = 1,
                Schenkel = 1,
                Position = 1
            };

            // Act
            var result = await _controller.PutSondenPosition(1, updateDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("ID mismatch", badRequestResult.Value);
        }

        [Fact]
        public async Task PostSondenPosition_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var createDto = new SondenPositionCreateDto
            {
                SondeID = 1,
                MesseinstellungID = 1,
                Schenkel = 2,
                Position = 2
            };

            // Act
            var result = await _controller.PostSondenPosition(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var position = Assert.IsType<SondenPosition>(createdAtActionResult.Value);
            Assert.Equal(2, position.Schenkel);
            Assert.Equal(2, await _context.SondenPosition.CountAsync());
        }

        [Fact]
        public async Task DeleteSondenPosition_WithValidId_ReturnsNoContent()
        {
            // Act
            var result = await _controller.DeleteSondenPosition(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await _context.SondenPosition.CountAsync());
        }

        [Fact]
        public async Task DeleteSondenPosition_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteSondenPosition(999);

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
