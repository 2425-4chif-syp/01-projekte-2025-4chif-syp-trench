using TrenchAPI.Persistence;
using Microsoft.Extensions.Configuration;

namespace ConsoleFillDb
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Löschen und migrieren der Datenbank, Import der Daten aus den CSV-Dateien.....");

            try
            {
                // Test database connection first
                Console.WriteLine("Testing database connection...");
                await TestConnection.TestDatabaseConnectionAsync();
                Console.WriteLine();

                using (UnitOfWork unitOfWork = new UnitOfWork())
                {
                    Console.WriteLine("Spulentypen, Spulen, Sondentypen, Sonden, Messeinstellungen, Sondenpositionieren, Messungen und Messwerte werden eingelesen");
                    
                    await unitOfWork.FillDbAsync();
                    
                    int cntSpuleTypen = await unitOfWork.SpuleTypRepository.GetCountAsync();
                    int cntSpulen = await unitOfWork.SpuleRepository.GetCountAsync();
                    int cntSondenTypen = await unitOfWork.SondenTypRepository.GetCountAsync();
                    int cntSonden = await unitOfWork.SondeRepository.GetCountAsync();
                    int cntMesseinstellungen = await unitOfWork.MesseinstellungRepository.GetCountAsync();
                    int cntSondenPositionen = await unitOfWork.SondenPositionRepository.GetCountAsync();
                    int cntMessungen = await unitOfWork.MessungRepository.GetCountAsync();
                    int cntMesswerte = await unitOfWork.MesswertRepository.GetCountAsync();
                    
                    Console.WriteLine($"{cntSpuleTypen} Spulentypen eingelesen!");
                    Console.WriteLine($"{cntSpulen} Spulen eingelesen!");
                    Console.WriteLine($"{cntSondenTypen} Sondentypen eingelesen!");
                    Console.WriteLine($"{cntSonden} Sonden eingelesen!");
                    Console.WriteLine($"{cntMesseinstellungen} Messeinstellungen eingelesen!");
                    Console.WriteLine($"{cntSondenPositionen} Sondenpositionieren eingelesen!");
                    Console.WriteLine($"{cntMessungen} Messungen eingelesen!");
                    Console.WriteLine($"{cntMesswerte} Messwerte eingelesen!");
                    
                    Console.WriteLine("\nDaten erfolgreich importiert!");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Fehler beim Import: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }

            Console.Write("Beenden mit Eingabetaste ...");
            Console.ReadLine();
        }
    }
}