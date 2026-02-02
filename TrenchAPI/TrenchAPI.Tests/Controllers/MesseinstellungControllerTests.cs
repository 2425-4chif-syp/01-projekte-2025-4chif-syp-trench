using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Controllers;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;
using TrenchAPI.Persistence.DTO;

namespace TrenchAPI.Tests.Controllers
{
    public class MesseinstellungControllerTests : IDisposable
    {
        private readonly WebDbContext _context;
        private readonly MesseinstellungController _controller;

        public MesseinstellungControllerTests()
        {
            var options = new DbContextOptionsBuilder<WebDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new WebDbContext(options);
            _controller = new MesseinstellungController(_context);

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

            _context.SpuleTyp.Add(spuleTyp);
            _context.Spule.Add(spule);
            _context.SondenTyp.Add(sondenTyp);
            _context.Messeinstellung.Add(messeinstellung);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetMesseinstellungen_ReturnsAllMesseinstellungen()
        {
            // Act
            var result = await _controller.GetMesseinstellungen();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Messeinstellung>>>(result);
            var messeinstellungen = Assert.IsAssignableFrom<IEnumerable<Messeinstellung>>(actionResult.Value);
            Assert.Single(messeinstellungen);
        }

        [Fact]
        public async Task GetMesseinstellung_WithValidId_ReturnsMesseinstellung()
        {
            // Act
            var result = await _controller.GetMesseinstellung(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Messeinstellung>>(result);
            var messeinstellung = Assert.IsType<Messeinstellung>(actionResult.Value);
            Assert.Equal(1, messeinstellung.ID);
            Assert.Equal("Test Messeinstellung", messeinstellung.Name);
        }

        [Fact]
        public async Task GetMesseinstellung_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetMesseinstellung(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task PutMesseinstellung_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var updateDto = new MesseinstellungUpdateDto
            {
                ID = 1,
                Name = "Updated Messeinstellung",
                SpuleID = 1,
                SondenTypID = 1,
                SondenProSchenkel = 3
            };

            // Act
            var result = await _controller.PutMesseinstellung(1, updateDto);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the update
            var updated = await _context.Messeinstellung.FindAsync(1);
            Assert.Equal("Updated Messeinstellung", updated?.Name);
        }

        [Fact]
        public async Task PutMesseinstellung_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var updateDto = new MesseinstellungUpdateDto
            {
                ID = 2,
                Name = "Test",
                SpuleID = 1,
                SondenTypID = 1,
                SondenProSchenkel = 3
            };

            // Act
            var result = await _controller.PutMesseinstellung(1, updateDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("ID in Route stimmt nicht mit DTO überein.", badRequestResult.Value);
        }

        [Fact]
        public async Task PostMesseinstellung_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var createDto = new MesseinstellungCreateDto
            {
                Name = "New Messeinstellung",
                SpuleID = 1,
                SondenTypID = 1,
                SondenProSchenkel = 3
            };

            // Act
            var result = await _controller.PostMesseinstellung(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var messeinstellung = Assert.IsType<Messeinstellung>(createdAtActionResult.Value);
            Assert.Equal("New Messeinstellung", messeinstellung.Name);
            Assert.Equal(2, await _context.Messeinstellung.CountAsync());
        }

        [Fact]
        public async Task DeleteMesseinstellung_WithValidId_ReturnsNoContent()
        {
            // Act
            var result = await _controller.DeleteMesseinstellung(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await _context.Messeinstellung.CountAsync());
        }

        [Fact]
        public async Task DeleteMesseinstellung_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteMesseinstellung(999);

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
