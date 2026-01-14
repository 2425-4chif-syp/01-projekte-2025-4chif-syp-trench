using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Controllers;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;

namespace TrenchAPI.Tests.Controllers
{
    public class SpuleTypControllerTests : IDisposable
    {
        private readonly WebDbContext _context;
        private readonly SpuleTypController _controller;

        public SpuleTypControllerTests()
        {
            var options = new DbContextOptionsBuilder<WebDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new WebDbContext(options);
            _controller = new SpuleTypController(_context);

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
                Notiz = "Test Note"
            };

            _context.SpuleTyp.Add(spuleTyp);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetSpuleTypen_ReturnsAllSpuleTypen()
        {
            // Act
            var result = await _controller.GetSpuleTyp();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<SpuleTyp>>>(result);
            var spuleTypen = Assert.IsAssignableFrom<IEnumerable<SpuleTyp>>(actionResult.Value);
            Assert.Single(spuleTypen);
        }

        [Fact]
        public async Task GetSpuleTyp_WithValidId_ReturnsSpuleTyp()
        {
            // Act
            var result = await _controller.GetSpuleTyp(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<SpuleTyp>>(result);
            var spuleTyp = Assert.IsType<SpuleTyp>(actionResult.Value);
            Assert.Equal(1, spuleTyp.ID);
            Assert.Equal("Test SpuleTyp", spuleTyp.Name);
        }

        [Fact]
        public async Task GetSpuleTyp_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetSpuleTyp(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task PostSpuleTyp_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var newSpuleTyp = new SpuleTyp
            {
                Name = "New SpuleTyp",
                Schenkelzahl = 4,
                Bandbreite = 12.0m,
                Schichthoehe = 6.0m,
                Durchmesser = 2.5m,
                Toleranzbereich = 0.6m,
                Notiz = "New Note"
            };

            // Act
            var result = await _controller.PostSpuleTyp(newSpuleTyp);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var spuleTyp = Assert.IsType<SpuleTyp>(createdAtActionResult.Value);
            Assert.Equal("New SpuleTyp", spuleTyp.Name);
            Assert.Equal(2, await _context.SpuleTyp.CountAsync());
        }

        [Fact]
        public async Task PutSpuleTyp_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var updatedSpuleTyp = new SpuleTyp
            {
                ID = 1,
                Name = "Updated SpuleTyp",
                Schenkelzahl = 5,
                Bandbreite = 15.0m,
                Schichthoehe = 7.0m,
                Durchmesser = 3.0m,
                Toleranzbereich = 0.7m,
                Notiz = "Updated Note"
            };

            // Act
            var result = await _controller.PutSpuleTyp(1, updatedSpuleTyp);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the update
            var updated = await _context.SpuleTyp.FindAsync(1);
            Assert.Equal("Updated SpuleTyp", updated?.Name);
        }

        [Fact]
        public async Task PutSpuleTyp_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var updatedSpuleTyp = new SpuleTyp
            {
                ID = 2,
                Name = "Test"
            };

            // Act
            var result = await _controller.PutSpuleTyp(1, updatedSpuleTyp);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task DeleteSpuleTyp_WithValidId_ReturnsNoContent()
        {
            // Act
            var result = await _controller.DeleteSpuleTyp(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await _context.SpuleTyp.CountAsync());
        }

        [Fact]
        public async Task DeleteSpuleTyp_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteSpuleTyp(999);

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
