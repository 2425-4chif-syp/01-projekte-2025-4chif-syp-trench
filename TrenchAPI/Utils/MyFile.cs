using System;
using System.IO;
using System.Text;

namespace TrenchAPI.Utils
{
    public static class MyFile
    {
        /// <summary>
        /// Sucht die Datei mit dem Namen ausgehend vom Arbeitsverzeichnis der Anwendung
        /// bis zum Wurzelverzeichnis des Laufwerks und gibt den vollen Pfad zurück.
        /// Einsetzbar, um Dateien für Unittests zugreifbar zu machen (jeder Run des Tests erzeugt neues Verzeichnis)
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public static string? GetFullNameInApplicationTree(string fileName)
        {
            if (string.IsNullOrEmpty(fileName)) return null;
            string path = Environment.CurrentDirectory;
            // string path = AppDomain.CurrentDomain.BaseDirectory;
            
            // First check in current directory and subdirectories
            var filesInCurrentDir = Directory.GetFiles(path, fileName, SearchOption.AllDirectories);
            if (filesInCurrentDir.Length > 0)
            {
                return filesInCurrentDir[0];
            }
            
            // Then search up the directory tree
            while (path != Directory.GetDirectoryRoot(path))
            {
                var files = Directory.GetFiles(path, fileName, SearchOption.TopDirectoryOnly);
                if (files.Length > 0)
                {
                    return files[0];
                }
                path = Directory.GetParent(path)!.FullName;
            }
            
            return null;
        }

        public static string? GetFullFolderNameInApplicationTree(string folderName)
        {
            if (string.IsNullOrEmpty(folderName)) return null;
            string path = Environment.CurrentDirectory;
            // string path = AppDomain.CurrentDomain.BaseDirectory;
            while (path != Directory.GetDirectoryRoot(path) &&
                Directory.GetDirectories(path, folderName).Length == 0)
            {
                path = Directory.GetParent(path)!.FullName;
            }
            if (Directory.GetDirectories(path, folderName).Length > 0) // Verzeichnis existiert
            {
                string fullName = Path.Combine(path, folderName);
                return fullName;
            }
            return null;
        }

        /// <summary>
        /// Liest eine csv-Datei, die im Pfad liegt in ein zweidimensionales
        /// String-Array ein.
        /// </summary>
        /// <param name="fileName">Dateiname für Datei, die im Pfad der Anwendung/Test liegt</param>
        /// <param name="overreadTitleLine">enthält die csv-Datei eine zu überlesende Titelzeile</param>
        /// <returns>Zweidimensionales Stringarray zur Weiterbearbeitung</returns>
        public static string[][] ReadStringMatrixFromCsv(string fileName, bool overreadTitleLine)
        {
            string? fullFileName = GetFullNameInApplicationTree(fileName); // csv-Datei liegt im Projektverzeichnis
            if (fullFileName == null)
            {
                // Try looking in data subdirectory
                string? dataFolderPath = GetFullFolderNameInApplicationTree("data");
                if (dataFolderPath != null)
                {
                    string dataFilePath = Path.Combine(dataFolderPath, fileName);
                    if (File.Exists(dataFilePath))
                    {
                        fullFileName = dataFilePath;
                    }
                }
            }
            
            if (fullFileName == null)
            {
                throw new FileNotFoundException("File " + fileName + " not found in applicationpath or data folder");
            }
            string[] lines = File.ReadAllLines(fullFileName, Encoding.UTF8);
            
            return ConvertCsvLinesToArray2Dim(lines, overreadTitleLine); 
        }

        private static string[][] ConvertCsvLinesToArray2Dim(string[] lines, bool overreadTitleLine)
        {
            int startLine = 0; // soll die Titelzeile überlesen werden startet der Zeilenzähler bei 1
            int subtractIndex = 0; // und eine Zeile ist zu überlesen
           
            int lineCount = lines.Length;
            if (overreadTitleLine)
            {
                lineCount--;
                startLine = 1;
                subtractIndex = 1;
            }
            string[][] elements = new String[lineCount][];
            for (int line = startLine; line < lines.Length; line++)
            {
                elements[line - subtractIndex] = lines[line].Split(','); // Changed from ';' to ',' for your CSV format
            }
            return elements;
        }
    }
}