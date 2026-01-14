using TrenchAPI.Utils;
using Xunit;

namespace TrenchAPI.Tests.Utils
{
    public class PasswordHasherTests
    {
        [Fact]
        public void HashPassword_WithValidPassword_ReturnsHashedPassword()
        {
            // Arrange
            string password = "TestPassword123!";

            // Act
            string hashedPassword = PasswordHasher.HashPassword(password);

            // Assert
            Assert.NotNull(hashedPassword);
            Assert.NotEmpty(hashedPassword);
            Assert.NotEqual(password, hashedPassword);
        }

        [Fact]
        public void HashPassword_WithSamePassword_ReturnsDifferentHashes()
        {
            // Arrange
            string password = "TestPassword123!";

            // Act
            string hash1 = PasswordHasher.HashPassword(password);
            string hash2 = PasswordHasher.HashPassword(password);

            // Assert - BCrypt generates different hashes for same password due to salt
            Assert.NotEqual(hash1, hash2);
        }

        [Fact]
        public void VerifyPassword_WithCorrectPassword_ReturnsTrue()
        {
            // Arrange
            string password = "TestPassword123!";
            string hashedPassword = PasswordHasher.HashPassword(password);

            // Act
            bool result = PasswordHasher.VerifyPassword(password, hashedPassword);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void VerifyPassword_WithIncorrectPassword_ReturnsFalse()
        {
            // Arrange
            string password = "TestPassword123!";
            string wrongPassword = "WrongPassword456!";
            string hashedPassword = PasswordHasher.HashPassword(password);

            // Act
            bool result = PasswordHasher.VerifyPassword(wrongPassword, hashedPassword);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void VerifyPassword_WithNullHashedPassword_ReturnsFalse()
        {
            // Arrange
            string password = "TestPassword123!";
            string? nullHashedPassword = null;

            // Act
            bool result = PasswordHasher.VerifyPassword(password, nullHashedPassword!);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void VerifyPassword_WithEmptyPassword_WorksCorrectly()
        {
            // Arrange
            string emptyPassword = "";
            string hashedPassword = PasswordHasher.HashPassword(emptyPassword);

            // Act
            bool result = PasswordHasher.VerifyPassword(emptyPassword, hashedPassword);

            // Assert
            Assert.True(result);
        }

        [Theory]
        [InlineData("short")]
        [InlineData("averageLengthPassword123")]
        [InlineData("VeryLongPasswordWithManyCharacters1234567890!@#$%^&*()")]
        public void HashPassword_WithDifferentLengths_WorksCorrectly(string password)
        {
            // Act
            string hashedPassword = PasswordHasher.HashPassword(password);

            // Assert
            Assert.NotNull(hashedPassword);
            bool verified = PasswordHasher.VerifyPassword(password, hashedPassword);
            Assert.True(verified);
        }
    }
}
