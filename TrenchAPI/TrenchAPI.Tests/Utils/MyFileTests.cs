using System;
using System.IO;
using TrenchAPI.Utils;
using Xunit;

namespace TrenchAPI.Tests.Utils
{
    public class MyFileTests
    {
        [Fact]
        public void GetFullNameInApplicationTree_WithExistingFile_ReturnsFullPath()
        {
            // Arrange
            string fileName = "test-data.csv";
            
            // Act
            string? result = MyFile.GetFullNameInApplicationTree(fileName);
            
            // Assert
            Assert.NotNull(result);
            Assert.Contains(fileName, result);
            Assert.True(File.Exists(result));
        }

        [Fact]
        public void GetFullNameInApplicationTree_WithNonExistingFile_ReturnsNull()
        {
            // Arrange
            string fileName = "non-existing-file-12345.csv";
            
            // Act
            string? result = MyFile.GetFullNameInApplicationTree(fileName);
            
            // Assert
            Assert.Null(result);
        }

        [Fact]
        public void GetFullNameInApplicationTree_WithNullFileName_ReturnsNull()
        {
            // Arrange
            string? fileName = null;
            
            // Act
            string? result = MyFile.GetFullNameInApplicationTree(fileName!);
            
            // Assert
            Assert.Null(result);
        }

        [Fact]
        public void GetFullNameInApplicationTree_WithEmptyFileName_ReturnsNull()
        {
            // Arrange
            string fileName = "";
            
            // Act
            string? result = MyFile.GetFullNameInApplicationTree(fileName);
            
            // Assert
            Assert.Null(result);
        }

        [Fact]
        public void GetFullFolderNameInApplicationTree_WithExistingFolder_ReturnsFullPath()
        {
            // Arrange - "Utils" folder should exist in the test directory
            string folderName = "Utils";
            
            // Act
            string? result = MyFile.GetFullFolderNameInApplicationTree(folderName);
            
            // Assert
            Assert.NotNull(result);
            Assert.Contains(folderName, result);
            Assert.True(Directory.Exists(result));
        }

        [Fact]
        public void GetFullFolderNameInApplicationTree_WithNonExistingFolder_ReturnsNull()
        {
            // Arrange
            string folderName = "NonExistingFolder12345";
            
            // Act
            string? result = MyFile.GetFullFolderNameInApplicationTree(folderName);
            
            // Assert
            Assert.Null(result);
        }

        [Fact]
        public void GetFullFolderNameInApplicationTree_WithNullFolderName_ReturnsNull()
        {
            // Arrange
            string? folderName = null;
            
            // Act
            string? result = MyFile.GetFullFolderNameInApplicationTree(folderName!);
            
            // Assert
            Assert.Null(result);
        }

        [Fact]
        public void GetFullFolderNameInApplicationTree_WithEmptyFolderName_ReturnsNull()
        {
            // Arrange
            string folderName = "";
            
            // Act
            string? result = MyFile.GetFullFolderNameInApplicationTree(folderName);
            
            // Assert
            Assert.Null(result);
        }

        [Fact]
        public void ReadStringMatrixFromCsv_WithTitleLine_ReadsCorrectly()
        {
            // Arrange
            string fileName = "test-data.csv";
            
            // Act
            string[][] result = MyFile.ReadStringMatrixFromCsv(fileName, overreadTitleLine: true);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Length); // Should have 3 data rows (excluding title)
            Assert.Equal(3, result[0].Length); // Should have 3 columns
            Assert.Equal("John", result[0][0]);
            Assert.Equal("25", result[0][1]);
            Assert.Equal("New York", result[0][2]);
            Assert.Equal("Jane", result[1][0]);
            Assert.Equal("Bob", result[2][0]);
        }

        [Fact]
        public void ReadStringMatrixFromCsv_WithoutTitleLine_ReadsCorrectly()
        {
            // Arrange
            string fileName = "no-header.csv";
            
            // Act
            string[][] result = MyFile.ReadStringMatrixFromCsv(fileName, overreadTitleLine: false);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Length); // Should have all 3 rows including header
            Assert.Equal(3, result[0].Length); // Should have 3 columns
            Assert.Equal("Data1", result[0][0]);
            Assert.Equal("Data2", result[0][1]);
            Assert.Equal("Value1", result[1][0]);
        }

        [Fact]
        public void ReadStringMatrixFromCsv_WithNonExistingFile_ThrowsFileNotFoundException()
        {
            // Arrange
            string fileName = "non-existing-file-98765.csv";
            
            // Act & Assert
            var exception = Assert.Throws<FileNotFoundException>(() =>
                MyFile.ReadStringMatrixFromCsv(fileName, overreadTitleLine: false));
            
            Assert.Contains(fileName, exception.Message);
        }

        [Fact]
        public void ReadStringMatrixFromCsv_WithFileInDataFolder_ReadsCorrectly()
        {
            // Arrange - First, create a test file in the data folder if it exists
            string? dataFolderPath = MyFile.GetFullFolderNameInApplicationTree("data");
            
            if (dataFolderPath != null)
            {
                // Create a test file in the data folder
                string testFileName = "data-folder-test.csv";
                string testFilePath = Path.Combine(dataFolderPath, testFileName);
                
                try
                {
                    File.WriteAllText(testFilePath, "Col1,Col2\nVal1,Val2\n");
                    
                    // Act
                    string[][] result = MyFile.ReadStringMatrixFromCsv(testFileName, overreadTitleLine: true);
                    
                    // Assert
                    Assert.NotNull(result);
                    Assert.Single(result); // Should have 1 data row
                    Assert.Equal("Val1", result[0][0]);
                }
                finally
                {
                    // Cleanup
                    if (File.Exists(testFilePath))
                    {
                        File.Delete(testFilePath);
                    }
                }
            }
            else
            {
                // If data folder doesn't exist, test with a file in current tree
                string fileName = "test-data.csv";
                string[][] result = MyFile.ReadStringMatrixFromCsv(fileName, overreadTitleLine: true);
                Assert.NotNull(result);
            }
        }
    }
}
