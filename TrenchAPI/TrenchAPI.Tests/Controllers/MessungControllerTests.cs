using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Controllers;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;
using TrenchAPI.Persistence.DTO;
using TrenchAPI.WebAPI.Services;
using Moq;

namespace TrenchAPI.Tests.Controllers
{
    public class MessungControllerTests : IDisposable
    {
        private readonly WebDbContext _context;
        private readonly MessungController _controller;
        private readonly Mock<MqttMeasurementService> _mqttServiceMock;

        public MessungControllerTests()
        {
            var options = new DbContextOptionsBuilder<WebDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new WebDbContext(options);
            
            // Create mock logger
            var mockLogger = new Mock<Microsoft.Extensions.Logging.ILogger<MqttMeasurementService>>();
            
            // Create mock service scope factory
            var mockServiceScopeFactory = new Mock<Microsoft.Extensions.DependencyInjection.IServiceScopeFactory>();
            var mockServiceScope = new Mock<Microsoft.Extensions.DependencyInjection.IServiceScope>();
            var mockServiceProvider = new Mock<IServiceProvider>();
            
            // Setup the service provider chain for scope creation
            mockServiceScope.Setup(x => x.ServiceProvider).Returns(mockServiceProvider.Object);
            mockServiceScopeFactory.Setup(x => x.CreateScope()).Returns(mockServiceScope.Object);
            mockServiceProvider.Setup(x => x.GetService(typeof(Microsoft.Extensions.DependencyInjection.IServiceScopeFactory)))
                .Returns(mockServiceScopeFactory.Object);
            mockServiceProvider.Setup(x => x.GetService(typeof(WebDbContext)))
                .Returns(_context);
            
            _mqttServiceMock = new Mock<MqttMeasurementService>(mockServiceProvider.Object, mockLogger.Object);
            _controller = new MessungController(_context, _mqttServiceMock.Object);

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

            var messung = new Messung
            {
                ID = 1,
                MesseinstellungID = 1,
                Messeinstellung = messeinstellung,
                Anfangszeitpunkt = DateTime.UtcNow.AddHours(-1),
                Endzeitpunkt = DateTime.UtcNow,
                Name = "Test Messung",
                Tauchkernstellung = 1.0m,
                Pruefspannung = 220.0m,
                Notiz = ""
            };

            _context.SpuleTyp.Add(spuleTyp);
            _context.Spule.Add(spule);
            _context.SondenTyp.Add(sondenTyp);
            _context.Messeinstellung.Add(messeinstellung);
            _context.Messung.Add(messung);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetMessung_ReturnsAllMessungen()
        {
            // Act
            var result = await _controller.GetMessung();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Messung>>>(result);
            var messungen = Assert.IsAssignableFrom<IEnumerable<Messung>>(actionResult.Value);
            Assert.Single(messungen);
        }

        [Fact]
        public async Task GetMessung_WithValidId_ReturnsMessung()
        {
            // Act
            var result = await _controller.GetMessung(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Messung>>(result);
            var messung = Assert.IsType<Messung>(actionResult.Value);
            Assert.Equal(1, messung.ID);
            Assert.Equal(1, messung.MesseinstellungID);
        }

        [Fact]
        public async Task GetMessung_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetMessung(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetMesswerte_WithValidId_ReturnsMesswerte()
        {
            // Arrange - Add some messwerte
            var sondenPosition = new SondenPosition
            {
                ID = 1,
                MesseinstellungID = 1,
                Schenkel = 1,
                Position = 1
            };
            _context.SondenPosition.Add(sondenPosition);

            var messwert = new Messwert
            {
                ID = 1,
                MessungID = 1,
                SondenPositionID = 1,
                Wert = 42.5m,
                Zeitpunkt = DateTime.UtcNow
            };
            _context.Messwert.Add(messwert);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetMesswerte(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<object>>>(result);
            var messwerte = Assert.IsAssignableFrom<IEnumerable<object>>(actionResult.Value);
            Assert.Single(messwerte);
        }

        [Fact]
        public async Task GetMesswerte_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetMesswerte(999);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Messung nicht gefunden", notFoundResult.Value);
        }

        [Fact]
        public async Task StartMeasuring_WithValidData_ReturnsMessungId()
        {
            // Arrange
            var startDto = new MessungStartDto
            {
                MesseinstellungID = 1,
                Name = "Test Messung",
                Tauchkernstellung = 1.0m,
                Pruefspannung = 220.0m,
                Notiz = ""
            };

            // Act
            var result = await _controller.StartMeasuring(startDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var messungId = Assert.IsType<int>(okResult.Value);
            Assert.True(messungId > 0);
            Assert.Equal(2, await _context.Messung.CountAsync());
        }

        [Fact]
        public async Task StartMeasuring_WithInvalidMesseinstellungId_ReturnsBadRequest()
        {
            // Arrange
            var startDto = new MessungStartDto
            {
                MesseinstellungID = 999,
                Name = "Test Messung",
                Tauchkernstellung = 1.0m,
                Pruefspannung = 220.0m,
                Notiz = ""
            };

            // Act
            var result = await _controller.StartMeasuring(startDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Die angegebene Messeinstellung existiert nicht.", badRequestResult.Value);
        }

        [Fact]
        public async Task PostMessung_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var createDto = new MessungCreateDto
            {
                MesseinstellungID = 1,
                Name = "New Test Messung",
                Anfangszeitpunkt = DateTime.UtcNow.AddHours(-2),
                Endzeitpunkt = DateTime.UtcNow.AddHours(-1),
                Tauchkernstellung = 1.0m,
                Pruefspannung = 220.0m,
                Notiz = ""
            };

            // Act
            var result = await _controller.PostMessung(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var messung = Assert.IsType<Messung>(createdAtActionResult.Value);
            Assert.Equal("New Test Messung", messung.Name);
            Assert.Equal(2, await _context.Messung.CountAsync());
        }

        [Fact]
        public async Task DeleteMessung_WithValidId_ReturnsNoContent()
        {
            // Act
            var result = await _controller.DeleteMessung(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await _context.Messung.CountAsync());
        }

        [Fact]
        public async Task DeleteMessung_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteMessung(999);

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
