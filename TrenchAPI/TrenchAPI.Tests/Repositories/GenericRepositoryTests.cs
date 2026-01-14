using Microsoft.EntityFrameworkCore;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;

namespace TrenchAPI.Tests.Repositories
{
    public class GenericRepositoryTests : IDisposable
    {
        private readonly WebDbContext _context;
        private readonly GenericRepository<SondenTyp> _repository;

        public GenericRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<WebDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new WebDbContext(options);
            _repository = new GenericRepository<SondenTyp>(_context);

            SeedDatabase();
        }

        private void SeedDatabase()
        {
            var sondenTyp1 = new SondenTyp
            {
                ID = 1,
                Name = "SondenTyp 1",
                Breite = 10.0m,
                Hoehe = 5.0m,
                Windungszahl = 100,
                Alpha = 1.5m,
                Notiz = ""
            };

            var sondenTyp2 = new SondenTyp
            {
                ID = 2,
                Name = "SondenTyp 2",
                Breite = 12.0m,
                Hoehe = 6.0m,
                Windungszahl = 120,
                Alpha = 1.8m,
                Notiz = ""
            };

            _context.SondenTyp.Add(sondenTyp1);
            _context.SondenTyp.Add(sondenTyp2);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllEntities()
        {
            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetByIdAsync_WithValidId_ReturnsEntity()
        {
            // Act
            var result = await _repository.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.ID);
            Assert.Equal("SondenTyp 1", result.Name);
        }

        [Fact]
        public async Task GetByIdAsync_WithInvalidId_ReturnsNull()
        {
            // Act
            var result = await _repository.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task AddAsync_AddsEntityToContext()
        {
            // Arrange
            var newSondenTyp = new SondenTyp
            {
                Name = "New SondenTyp",
                Breite = 15.0m,
                Hoehe = 7.0m,
                Windungszahl = 150,
                Alpha = 2.0m,
                Notiz = ""
            };

            // Act
            await _repository.AddAsync(newSondenTyp);
            await _context.SaveChangesAsync();

            // Assert
            var allEntities = await _repository.GetAllAsync();
            Assert.Equal(3, allEntities.Count());
        }

        [Fact]
        public async Task Update_UpdatesEntityInContext()
        {
            // Arrange
            var entity = await _repository.GetByIdAsync(1);
            Assert.NotNull(entity);
            entity.Name = "Updated Name";

            // Act
            _repository.Update(entity);
            await _context.SaveChangesAsync();

            // Assert
            var updatedEntity = await _repository.GetByIdAsync(1);
            Assert.Equal("Updated Name", updatedEntity?.Name);
        }

        [Fact]
        public async Task Delete_RemovesEntityFromContext()
        {
            // Arrange
            var entity = await _repository.GetByIdAsync(1);
            Assert.NotNull(entity);

            // Act
            _repository.Delete(entity);
            await _context.SaveChangesAsync();

            // Assert
            var allEntities = await _repository.GetAllAsync();
            Assert.Single(allEntities);
            var deletedEntity = await _repository.GetByIdAsync(1);
            Assert.Null(deletedEntity);
        }

        [Fact]
        public async Task GetCountAsync_ReturnsCorrectCount()
        {
            // Act
            var count = await _repository.GetCountAsync();

            // Assert
            Assert.Equal(2, count);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
