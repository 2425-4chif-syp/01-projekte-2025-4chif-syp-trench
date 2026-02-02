using TrenchAPI.Persistence.DTO;

namespace TrenchAPI.Tests.DTO
{
    public class DtoTests
    {
        [Fact]
        public void MesseinstellungCreateDto_CanSetAndGetProperties()
        {
            // Arrange & Act
            var dto = new MesseinstellungCreateDto
            {
                Name = "Test",
                SpuleID = 1,
                SondenTypID = 2,
                SondenProSchenkel = 3
            };

            // Assert
            Assert.Equal("Test", dto.Name);
            Assert.Equal(1, dto.SpuleID);
            Assert.Equal(2, dto.SondenTypID);
            Assert.Equal(3, dto.SondenProSchenkel);
        }

        [Fact]
        public void MesseinstellungUpdateDto_CanSetAndGetProperties()
        {
            // Arrange & Act
            var dto = new MesseinstellungUpdateDto
            {
                ID = 1,
                Name = "Updated",
                SpuleID = 2,
                SondenTypID = 3,
                SondenProSchenkel = 4
            };

            // Assert
            Assert.Equal(1, dto.ID);
            Assert.Equal("Updated", dto.Name);
            Assert.Equal(2, dto.SpuleID);
            Assert.Equal(3, dto.SondenTypID);
            Assert.Equal(4, dto.SondenProSchenkel);
        }

        [Fact]
        public void MessungStartDto_CanSetAndGetProperties()
        {
            // Arrange & Act
            var dto = new MessungStartDto
            {
                MesseinstellungID = 1,
                Name = "Test Messung",
                Tauchkernstellung = 1.5m,
                Pruefspannung = 220.0m,
                Notiz = "Test note"
            };

            // Assert
            Assert.Equal(1, dto.MesseinstellungID);
            Assert.Equal("Test Messung", dto.Name);
            Assert.Equal(1.5m, dto.Tauchkernstellung);
            Assert.Equal(220.0m, dto.Pruefspannung);
            Assert.Equal("Test note", dto.Notiz);
        }

        [Fact]
        public void MessungCreateDto_CanSetAndGetProperties()
        {
            // Arrange
            var startTime = DateTime.UtcNow.AddHours(-1);
            var endTime = DateTime.UtcNow;

            // Act
            var dto = new MessungCreateDto
            {
                MesseinstellungID = 1,
                Anfangszeitpunkt = startTime,
                Endzeitpunkt = endTime,
                Name = "Test",
                Tauchkernstellung = 1.5m,
                Pruefspannung = 220.0m,
                Notiz = "Note"
            };

            // Assert
            Assert.Equal(1, dto.MesseinstellungID);
            Assert.Equal(startTime, dto.Anfangszeitpunkt);
            Assert.Equal(endTime, dto.Endzeitpunkt);
            Assert.Equal("Test", dto.Name);
            Assert.Equal(1.5m, dto.Tauchkernstellung);
            Assert.Equal(220.0m, dto.Pruefspannung);
            Assert.Equal("Note", dto.Notiz);
        }

        [Fact]
        public void MesswertCreateDto_CanSetAndGetProperties()
        {
            // Arrange
            var timestamp = DateTime.UtcNow;

            // Act
            var dto = new MesswertCreateDto
            {
                MessungID = 1,
                SondenPositionID = 2,
                Wert = 42.5m,
                Zeitpunkt = timestamp
            };

            // Assert
            Assert.Equal(1, dto.MessungID);
            Assert.Equal(2, dto.SondenPositionID);
            Assert.Equal(42.5m, dto.Wert);
            Assert.Equal(timestamp, dto.Zeitpunkt);
        }

        [Fact]
        public void SondeCreateDto_CanSetAndGetProperties()
        {
            // Arrange & Act
            var dto = new SondeCreateDto
            {
                SondenTypID = 1,
                Name = "Test Sonde",
                Kalibrierungsfaktor = 1.5m
            };

            // Assert
            Assert.Equal(1, dto.SondenTypID);
            Assert.Equal("Test Sonde", dto.Name);
            Assert.Equal(1.5m, dto.Kalibrierungsfaktor);
        }

        [Fact]
        public void SondeUpdateDto_CanSetAndGetProperties()
        {
            // Arrange & Act
            var dto = new SondeUpdateDto
            {
                ID = 1,
                SondenTypID = 2,
                Name = "Updated Sonde",
                Kalibrierungsfaktor = 2.0m
            };

            // Assert
            Assert.Equal(1, dto.ID);
            Assert.Equal(2, dto.SondenTypID);
            Assert.Equal("Updated Sonde", dto.Name);
            Assert.Equal(2.0m, dto.Kalibrierungsfaktor);
        }

        [Fact]
        public void SondenPositionCreateDto_CanSetAndGetProperties()
        {
            // Arrange & Act
            var dto = new SondenPositionCreateDto
            {
                SondeID = 1,
                MesseinstellungID = 2,
                Schenkel = 3,
                Position = 4
            };

            // Assert
            Assert.Equal(1, dto.SondeID);
            Assert.Equal(2, dto.MesseinstellungID);
            Assert.Equal(3, dto.Schenkel);
            Assert.Equal(4, dto.Position);
        }

        [Fact]
        public void SondenPositionUpdateDto_CanSetAndGetProperties()
        {
            // Arrange & Act
            var dto = new SondenPositionUpdateDto
            {
                ID = 1,
                SondeID = 2,
                MesseinstellungID = 3,
                Schenkel = 4,
                Position = 5
            };

            // Assert
            Assert.Equal(1, dto.ID);
            Assert.Equal(2, dto.SondeID);
            Assert.Equal(3, dto.MesseinstellungID);
            Assert.Equal(4, dto.Schenkel);
            Assert.Equal(5, dto.Position);
        }

        [Fact]
        public void SpuleCreateDto_CanSetAndGetProperties()
        {
            // Arrange & Act
            var dto = new SpuleCreateDto
            {
                SpuleTypID = 1,
                Auftragsnr = "TEST001",
                AuftragsPosNr = "POS1",
                Bemessungsspannung = 220.0m,
                Bemessungsfrequenz = 50.0m,
                Einheit = "Hz"
            };

            // Assert
            Assert.Equal(1, dto.SpuleTypID);
            Assert.Equal("TEST001", dto.Auftragsnr);
            Assert.Equal("POS1", dto.AuftragsPosNr);
            Assert.Equal(220.0m, dto.Bemessungsspannung);
            Assert.Equal(50.0m, dto.Bemessungsfrequenz);
            Assert.Equal("Hz", dto.Einheit);
        }

        [Fact]
        public void LiveMesswertDto_CanSetAndGetProperties()
        {
            // Arrange & Act
            var dto = new LiveMesswertDto
            {
                SondenPositionID = 1,
                Wert = 42.5m
            };

            // Assert
            Assert.Equal(1, dto.SondenPositionID);
            Assert.Equal(42.5m, dto.Wert);
        }

        [Fact]
        public void CompleteMessungDto_CanSetAndGetProperties()
        {
            // Arrange
            var startTime = DateTime.UtcNow.AddHours(-1);
            var endTime = DateTime.UtcNow;

            // Act
            var dto = new CompleteMessungDto
            {
                MesseinstellungID = 1,
                Anfangszeitpunkt = startTime,
                Endzeitpunkt = endTime,
                Notiz = "Test note",
                Messsonden = new List<MesssondeDto>()
            };

            // Assert
            Assert.Equal(1, dto.MesseinstellungID);
            Assert.Equal(startTime, dto.Anfangszeitpunkt);
            Assert.Equal(endTime, dto.Endzeitpunkt);
            Assert.Equal("Test note", dto.Notiz);
            Assert.NotNull(dto.Messsonden);
        }

        [Fact]
        public void MesssondeDto_CanSetAndGetProperties()
        {
            // Arrange & Act
            var dto = new MesssondeDto
            {
                Schenkel = 1,
                Position = 2,
                Messwerte = new List<double> { 1.0, 2.0 },
                Durchschnittswert = 1.5
            };

            // Assert
            Assert.Equal(1, dto.Schenkel);
            Assert.Equal(2, dto.Position);
            Assert.Equal(2, dto.Messwerte.Count);
            Assert.Equal(1.5, dto.Durchschnittswert);
        }
    }
}
