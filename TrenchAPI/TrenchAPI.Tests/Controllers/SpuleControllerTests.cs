using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Controllers;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;
using TrenchAPI.Persistence.DTO;

namespace TrenchAPI.Tests.Controllers
{
    public class SpuleControllerTests : IDisposable
    {
        private readonly WebDbContext _context;
        private readonly SpuleController _controller;

        public SpuleControllerTests()
        {
            var options = new DbContextOptionsBuilder<WebDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new WebDbContext(options);
            _controller = new SpuleController(_context);

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

            _context.SpuleTyp.Add(spuleTyp);
            _context.Spule.Add(spule);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetSpule_ReturnsAllSpulen()
        {
            // Act
            var result = await _controller.GetSpule();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Spule>>>(result);
            var spulen = Assert.IsAssignableFrom<IEnumerable<Spule>>(actionResult.Value);
            Assert.Single(spulen);
        }

        [Fact]
        public async Task GetSpule_WithValidId_ReturnsSpule()
        {
            // Act
            var result = await _controller.GetSpule(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Spule>>(result);
            var spule = Assert.IsType<Spule>(actionResult.Value);
            Assert.Equal(1, spule.ID);
            Assert.Equal("TEST001", spule.Auftragsnr);
        }

        [Fact]
        public async Task GetSpule_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetSpule(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task PostSpule_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var newSpuleDto = new SpuleCreateDto
            {
                SpuleTypID = 1,
                Auftragsnr = "TEST002",
                AuftragsPosNr = "POS2",
                Bemessungsspannung = 400.0m,
                Bemessungsfrequenz = 60.0m,
                Einheit = "V"
            };

            // Act
            var result = await _controller.PostSpule(newSpuleDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var spule = Assert.IsType<Spule>(createdAtActionResult.Value);
            Assert.Equal("TEST002", spule.Auftragsnr);
            Assert.Equal(400.0m, spule.Bemessungsspannung);
        }

        [Fact]
        public async Task PostSpule_WithInvalidSpuleTypID_ReturnsBadRequest()
        {
            // Arrange
            var newSpuleDto = new SpuleCreateDto
            {
                SpuleTypID = 999, // Non-existent SpuleTyp
                Auftragsnr = "TEST003",
                AuftragsPosNr = "POS3",
                Bemessungsspannung = 230.0m,
                Bemessungsfrequenz = 50.0m,
                Einheit = "V"
            };

            // Act
            var result = await _controller.PostSpule(newSpuleDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task PutSpule_WithValidData_ReturnsNoContent()
        {
            // Arrange
            _context.ChangeTracker.Clear(); // Clear tracked entities
            
            var updatedSpule = new Spule
            {
                ID = 1,
                SpuleTypID = 1,
                Auftragsnr = "TEST001-UPDATED",
                AuftragsPosNr = "POS1-UPD",
                Bemessungsspannung = 400.0m,
                Bemessungsfrequenz = 60.0m,
                Einheit = "V",
                Notiz = "Updated"
            };

            // Act
            var result = await _controller.PutSpule(1, updatedSpule);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify update
            _context.ChangeTracker.Clear(); // Clear again before querying
            var spule = await _context.Spule.FindAsync(1);
            Assert.Equal("TEST001-UPDATED", spule.Auftragsnr);
        }

        [Fact]
        public async Task PutSpule_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var updatedSpule = new Spule
            {
                ID = 2, // Different from URL parameter
                SpuleTypID = 1,
                Auftragsnr = "TEST001-UPDATED",
                AuftragsPosNr = "POS1",
                Bemessungsspannung = 230.0m,
                Bemessungsfrequenz = 50.0m,
                Einheit = "V"
            };

            // Act
            var result = await _controller.PutSpule(1, updatedSpule);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task DeleteSpule_WithValidId_ReturnsNoContent()
        {
            // Act
            var result = await _controller.DeleteSpule(1);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify deletion
            var spule = await _context.Spule.FindAsync(1);
            Assert.Null(spule);
        }

        [Fact]
        public async Task DeleteSpule_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteSpule(999);

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
