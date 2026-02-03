using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Controllers;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;
using TrenchAPI.Persistence.DTO;

namespace TrenchAPI.Tests.Controllers
{
    public class SondeControllerTests : IDisposable
    {
        private readonly WebDbContext _context;
        private readonly SondeController _controller;

        public SondeControllerTests()
        {
            var options = new DbContextOptionsBuilder<WebDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new WebDbContext(options);
            _controller = new SondeController(_context);

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
                SondenTypID = 1,
                SondenTyp = sondenTyp,
                Name = "Test Sonde",
                Kalibrierungsfaktor = 1.5m
            };

            _context.SondenTyp.Add(sondenTyp);
            _context.Sonde.Add(sonde);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetSonde_ReturnsAllSonden()
        {
            // Act
            var result = await _controller.GetSonde();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Sonde>>>(result);
            var sonden = Assert.IsAssignableFrom<IEnumerable<Sonde>>(actionResult.Value);
            Assert.Single(sonden);
        }

        [Fact]
        public async Task GetSonde_WithValidId_ReturnsSonde()
        {
            // Act
            var result = await _controller.GetSonde(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Sonde>>(result);
            var sonde = Assert.IsType<Sonde>(actionResult.Value);
            Assert.Equal(1, sonde.ID);
            Assert.Equal("Test Sonde", sonde.Name);
        }

        [Fact]
        public async Task GetSonde_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetSonde(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task PostSonde_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var newSondeDto = new SondeCreateDto
            {
                SondenTypID = 1,
                Name = "New Sonde",
                Kalibrierungsfaktor = 2.0m
            };

            // Act
            var result = await _controller.PostSonde(newSondeDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var sonde = Assert.IsType<Sonde>(createdAtActionResult.Value);
            Assert.Equal("New Sonde", sonde.Name);
            Assert.Equal(2.0m, sonde.Kalibrierungsfaktor);
        }

        [Fact]
        public async Task PostSonde_WithInvalidSondenTypID_ReturnsBadRequest()
        {
            // Arrange
            var newSondeDto = new SondeCreateDto
            {
                SondenTypID = 999, // Non-existent SondenTyp
                Name = "Invalid Sonde",
                Kalibrierungsfaktor = 1.5m
            };

            // Act
            var result = await _controller.PostSonde(newSondeDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task PutSonde_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var updatedSondeDto = new SondeUpdateDto
            {
                ID = 1,
                SondenTypID = 1,
                Name = "Updated Sonde",
                Kalibrierungsfaktor = 2.5m
            };

            // Act
            var result = await _controller.PutSonde(1, updatedSondeDto);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify update
            var sonde = await _context.Sonde.FindAsync(1);
            Assert.Equal("Updated Sonde", sonde.Name);
            Assert.Equal(2.5m, sonde.Kalibrierungsfaktor);
        }

        [Fact]
        public async Task PutSonde_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var updatedSondeDto = new SondeUpdateDto
            {
                ID = 2, // Different from URL parameter
                SondenTypID = 1,
                Name = "Updated Sonde",
                Kalibrierungsfaktor = 2.0m
            };

            // Act
            var result = await _controller.PutSonde(1, updatedSondeDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task PutSonde_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var updatedSondeDto = new SondeUpdateDto
            {
                ID = 999,
                SondenTypID = 1,
                Name = "Updated Sonde",
                Kalibrierungsfaktor = 2.0m
            };

            // Act
            var result = await _controller.PutSonde(999, updatedSondeDto);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteSonde_WithValidId_ReturnsNoContent()
        {
            // Act
            var result = await _controller.DeleteSonde(1);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify deletion
            var sonde = await _context.Sonde.FindAsync(1);
            Assert.Null(sonde);
        }

        [Fact]
        public async Task DeleteSonde_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteSonde(999);

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
