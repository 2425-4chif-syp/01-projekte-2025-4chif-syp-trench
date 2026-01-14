using Microsoft.EntityFrameworkCore;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;

namespace TrenchAPI.Tests.Repositories
{
    public class UnitOfWorkTests : IDisposable
    {
        private readonly WebDbContext _context;
        private readonly UnitOfWork _unitOfWork;

        public UnitOfWorkTests()
        {
            var options = new DbContextOptionsBuilder<WebDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new WebDbContext(options);
            _unitOfWork = new UnitOfWork(_context);
        }

        [Fact]
        public void UnitOfWork_InitializesAllRepositories()
        {
            // Assert
            Assert.NotNull(_unitOfWork.MesseinstellungRepository);
            Assert.NotNull(_unitOfWork.MessungRepository);
            Assert.NotNull(_unitOfWork.MesswertRepository);
            Assert.NotNull(_unitOfWork.SondeRepository);
            Assert.NotNull(_unitOfWork.SondenPositionRepository);
            Assert.NotNull(_unitOfWork.SondenTypRepository);
            Assert.NotNull(_unitOfWork.SpuleRepository);
            Assert.NotNull(_unitOfWork.SpuleTypRepository);
        }

        [Fact]
        public async Task SaveChangesAsync_SavesChangesToDatabase()
        {
            // Arrange
            var sondenTyp = new SondenTyp
            {
                Name = "Test SondenTyp",
                Breite = 10.0m,
                Hoehe = 5.0m,
                Windungszahl = 100,
                Alpha = 1.5m,
                Notiz = ""
            };

            await _unitOfWork.SondenTypRepository.AddAsync(sondenTyp);

            // Act
            var result = await _unitOfWork.SaveChangesAsync();

            // Assert
            Assert.True(result > 0);
            var savedEntity = await _unitOfWork.SondenTypRepository.GetByIdAsync(sondenTyp.ID);
            Assert.NotNull(savedEntity);
            Assert.Equal("Test SondenTyp", savedEntity.Name);
        }

        [Fact]
        public async Task SaveChangesAsync_WithMultipleChanges_SavesAll()
        {
            // Arrange
            var sondenTyp1 = new SondenTyp
            {
                Name = "SondenTyp 1",
                Breite = 10.0m,
                Hoehe = 5.0m,
                Windungszahl = 100,
                Alpha = 1.5m,
                Notiz = ""
            };

            var sondenTyp2 = new SondenTyp
            {
                Name = "SondenTyp 2",
                Breite = 12.0m,
                Hoehe = 6.0m,
                Windungszahl = 120,
                Alpha = 1.8m,
                Notiz = ""
            };

            await _unitOfWork.SondenTypRepository.AddAsync(sondenTyp1);
            await _unitOfWork.SondenTypRepository.AddAsync(sondenTyp2);

            // Act
            var result = await _unitOfWork.SaveChangesAsync();

            // Assert
            Assert.True(result > 0);
            var allEntities = await _unitOfWork.SondenTypRepository.GetAllAsync();
            Assert.Equal(2, allEntities.Count());
        }

        [Fact]
        public async Task MesseinstellungRepository_CanAddAndRetrieve()
        {
            // Arrange
            var spuleTyp = new SpuleTyp
            {
                Name = "Test SpuleTyp",
                Schenkelzahl = 3,
                Bandbreite = 10.0m,
                Schichthoehe = 5.0m,
                Durchmesser = 2.0m,
                Toleranzbereich = 0.5m,
                Notiz = ""
            };
            await _unitOfWork.SpuleTypRepository.AddAsync(spuleTyp);
            await _unitOfWork.SaveChangesAsync();

            var spule = new Spule
            {
                Auftragsnr = "TEST001",
                AuftragsPosNr = "POS1",
                SpuleTypID = spuleTyp.ID,
                Bemessungsspannung = 220.0m,
                Bemessungsfrequenz = 50.0m,
                Einheit = "Hz",
                Notiz = ""
            };
            await _unitOfWork.SpuleRepository.AddAsync(spule);
            await _unitOfWork.SaveChangesAsync();

            var sondenTyp = new SondenTyp
            {
                Name = "Test SondenTyp",
                Breite = 10.0m,
                Hoehe = 5.0m,
                Windungszahl = 100,
                Alpha = 1.5m,
                Notiz = ""
            };
            await _unitOfWork.SondenTypRepository.AddAsync(sondenTyp);
            await _unitOfWork.SaveChangesAsync();

            var messeinstellung = new Messeinstellung
            {
                Name = "Test Messeinstellung",
                SpuleID = spule.ID,
                SondenTypID = sondenTyp.ID,
                SondenProSchenkel = 3
            };

            // Act
            await _unitOfWork.MesseinstellungRepository.AddAsync(messeinstellung);
            var result = await _unitOfWork.SaveChangesAsync();

            // Assert
            Assert.True(result > 0);
            var savedEntity = await _unitOfWork.MesseinstellungRepository.GetByIdAsync(messeinstellung.ID);
            Assert.NotNull(savedEntity);
            Assert.Equal("Test Messeinstellung", savedEntity.Name);
        }

        [Fact]
        public async Task MessungRepository_CanAddAndRetrieve()
        {
            // Arrange - Setup dependencies
            var spuleTyp = new SpuleTyp
            {
                Name = "Test SpuleTyp",
                Schenkelzahl = 3,
                Bandbreite = 10.0m,
                Schichthoehe = 5.0m,
                Durchmesser = 2.0m,
                Toleranzbereich = 0.5m,
                Notiz = ""
            };
            await _unitOfWork.SpuleTypRepository.AddAsync(spuleTyp);
            await _unitOfWork.SaveChangesAsync();

            var spule = new Spule
            {
                Auftragsnr = "TEST001",
                AuftragsPosNr = "POS1",
                SpuleTypID = spuleTyp.ID,
                Bemessungsspannung = 220.0m,
                Bemessungsfrequenz = 50.0m,
                Einheit = "Hz",
                Notiz = ""
            };
            await _unitOfWork.SpuleRepository.AddAsync(spule);
            await _unitOfWork.SaveChangesAsync();

            var sondenTyp = new SondenTyp
            {
                Name = "Test SondenTyp",
                Breite = 10.0m,
                Hoehe = 5.0m,
                Windungszahl = 100,
                Alpha = 1.5m,
                Notiz = ""
            };
            await _unitOfWork.SondenTypRepository.AddAsync(sondenTyp);
            await _unitOfWork.SaveChangesAsync();

            var messeinstellung = new Messeinstellung
            {
                Name = "Test Messeinstellung",
                SpuleID = spule.ID,
                SondenTypID = sondenTyp.ID,
                SondenProSchenkel = 3
            };
            await _unitOfWork.MesseinstellungRepository.AddAsync(messeinstellung);
            await _unitOfWork.SaveChangesAsync();

            var messung = new Messung
            {
                MesseinstellungID = messeinstellung.ID,
                Anfangszeitpunkt = DateTime.UtcNow.AddHours(-1),
                Endzeitpunkt = DateTime.UtcNow,
                Name = "Test Messung",
                Tauchkernstellung = 1.0m,
                Pruefspannung = 220.0m,
                Notiz = "Test note"
            };

            // Act
            await _unitOfWork.MessungRepository.AddAsync(messung);
            var result = await _unitOfWork.SaveChangesAsync();

            // Assert
            Assert.True(result > 0);
            var savedEntity = await _unitOfWork.MessungRepository.GetByIdAsync(messung.ID);
            Assert.NotNull(savedEntity);
            Assert.Equal("Test Messung", savedEntity.Name);
        }

        [Fact]
        public async Task CreateDatabaseAsync_CreatesDatabase()
        {
            // Act
            await _unitOfWork.CreateDatabaseAsync();

            // Assert - Just verify no exception is thrown
            Assert.True(true);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
            _unitOfWork.Dispose();
        }
    }
}
