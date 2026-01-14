using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Controllers;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;

namespace TrenchAPI.Tests.Controllers
{
    public class SondenTypControllerTests : IDisposable
    {
        private readonly WebDbContext _context;
        private readonly SondenTypController _controller;

        public SondenTypControllerTests()
        {
            var options = new DbContextOptionsBuilder<WebDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new WebDbContext(options);
            _controller = new SondenTypController(_context);

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
                Notiz = "Test Note"
            };

            _context.SondenTyp.Add(sondenTyp);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetSondenTypen_ReturnsAllSondenTypen()
        {
            // Act
            var result = await _controller.GetSondenTyp();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<SondenTyp>>>(result);
            var sondenTypen = Assert.IsAssignableFrom<IEnumerable<SondenTyp>>(actionResult.Value);
            Assert.Single(sondenTypen);
        }

        [Fact]
        public async Task GetSondenTyp_WithValidId_ReturnsSondenTyp()
        {
            // Act
            var result = await _controller.GetSondenTyp(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<SondenTyp>>(result);
            var sondenTyp = Assert.IsType<SondenTyp>(actionResult.Value);
            Assert.Equal(1, sondenTyp.ID);
            Assert.Equal("Test SondenTyp", sondenTyp.Name);
        }

        [Fact]
        public async Task GetSondenTyp_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetSondenTyp(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task PostSondenTyp_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var newSondenTyp = new SondenTyp
            {
                Name = "New SondenTyp",
                Breite = 12.0m,
                Hoehe = 6.0m,
                Windungszahl = 120,
                Alpha = 1.8m,
                Notiz = "New Note"
            };

            // Act
            var result = await _controller.PostSondenTyp(newSondenTyp);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var sondenTyp = Assert.IsType<SondenTyp>(createdAtActionResult.Value);
            Assert.Equal("New SondenTyp", sondenTyp.Name);
            Assert.Equal(2, await _context.SondenTyp.CountAsync());
        }

        [Fact]
        public async Task PutSondenTyp_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var updatedSondenTyp = new SondenTyp
            {
                ID = 1,
                Name = "Updated SondenTyp",
                Breite = 15.0m,
                Hoehe = 7.0m,
                Windungszahl = 150,
                Alpha = 2.0m,
                Notiz = "Updated Note"
            };

            // Act
            var result = await _controller.PutSondenTyp(1, updatedSondenTyp);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the update
            var updated = await _context.SondenTyp.FindAsync(1);
            Assert.Equal("Updated SondenTyp", updated?.Name);
        }

        [Fact]
        public async Task PutSondenTyp_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var updatedSondenTyp = new SondenTyp
            {
                ID = 2,
                Name = "Test"
            };

            // Act
            var result = await _controller.PutSondenTyp(1, updatedSondenTyp);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task DeleteSondenTyp_WithValidId_ReturnsNoContent()
        {
            // Act
            var result = await _controller.DeleteSondenTyp(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await _context.SondenTyp.CountAsync());
        }

        [Fact]
        public async Task DeleteSondenTyp_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteSondenTyp(999);

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
