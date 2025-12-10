using TrenchAPI.Core.Contracts;
using TrenchAPI.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TrenchAPI.Utils;
using System.Globalization;

namespace TrenchAPI.Persistence
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly WebDbContext _dbContext;

        public UnitOfWork()
        {
            _dbContext = new WebDbContext();
            MesseinstellungRepository = new MesseinstellungRepository(_dbContext);
            MessungRepository = new MessungRepository(_dbContext);
            MesswertRepository = new MesswertRepository(_dbContext);
            SondeRepository = new SondeRepository(_dbContext);
            SondenPositionRepository = new SondenPositionRepository(_dbContext);
            SondenTypRepository = new SondenTypRepository(_dbContext);
            SpuleRepository = new SpuleRepository(_dbContext);
            SpuleTypRepository = new SpuleTypRepository(_dbContext);
        }

        public UnitOfWork(WebDbContext context)
        {
            _dbContext = context;
            MesseinstellungRepository = new MesseinstellungRepository(_dbContext);
            MessungRepository = new MessungRepository(_dbContext);
            MesswertRepository = new MesswertRepository(_dbContext);
            SondeRepository = new SondeRepository(_dbContext);
            SondenPositionRepository = new SondenPositionRepository(_dbContext);
            SondenTypRepository = new SondenTypRepository(_dbContext);
            SpuleRepository = new SpuleRepository(_dbContext);
            SpuleTypRepository = new SpuleTypRepository(_dbContext);
        }

        public IMesseinstellungRepository MesseinstellungRepository { get; }
        public IMessungRepository MessungRepository { get; }
        public IMesswertRepository MesswertRepository { get; }
        public ISondeRepository SondeRepository { get; }
        public ISondenPositionRepository SondenPositionRepository { get; }
        public ISondenTypRepository SondenTypRepository { get; }
        public ISpuleRepository SpuleRepository { get; }
        public ISpuleTypRepository SpuleTypRepository { get; }

        public async Task<int> SaveChangesAsync()
        {
            var entities = _dbContext!.ChangeTracker.Entries()
                .Where(entity => entity.State == EntityState.Added
                                 || entity.State == EntityState.Modified)
                .Select(e => e.Entity)
                .ToArray();  // Geänderte Entities ermitteln

            // Allfällige Validierungen der geänderten Entities durchführen
            foreach (var entity in entities)
            {
                ValidateEntity(entity);
            }
            return await _dbContext.SaveChangesAsync();
        }

        private void ValidateEntity(object entity)
        {
            // Add entity validation logic here if needed
        }

        public async Task DeleteDatabaseAsync() => await _dbContext!.Database.EnsureDeletedAsync();
        public async Task MigrateDatabaseAsync() => await _dbContext!.Database.MigrateAsync();
        public async Task CreateDatabaseAsync() => await _dbContext!.Database.EnsureCreatedAsync();

        public async ValueTask DisposeAsync()
        {
            await DisposeAsync(true);
            GC.SuppressFinalize(this);
        }

        protected virtual async ValueTask DisposeAsync(bool disposing)
        {
            if (disposing)
            {
                await _dbContext.DisposeAsync();
            }
        }

        public void Dispose()
        {
            _dbContext.Dispose();
        }

        public async Task FillDbAsync()
        {
            Console.WriteLine("DEBUG: FillDbAsync started - VERSION 2.0");
            
            // Instead of deleting the database, drop all tables and recreate them
            Console.WriteLine("Dropping all tables...");
            await _dbContext.Database.ExecuteSqlRawAsync(@"
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                    END LOOP;
                END $$;
            ");

            Console.WriteLine("Creating tables...");
            await this.CreateDatabaseAsync(); // Use EnsureCreated instead of Migrate

            // Import data from CSV files in the correct order (considering dependencies)
            await ImportSpuleTypenAsync();
            await ImportSpulenAsync();
            await ImportSondenTypenAsync();
            await ImportSondenAsync();
            await ImportMesseinstellungenAsync();
            await ImportSondenPositionenAsync();
            await ImportMessungenAsync();
            await ImportMesswerteAsync();

            Console.WriteLine("Saving changes to database...");
            await SaveChangesAsync();
            Console.WriteLine("Changes saved successfully!");

            // Reset all sequences to the max ID + 1 to prevent duplicate key errors  
            Console.WriteLine();
            Console.WriteLine("===========================================");
            Console.WriteLine("RESETTING POSTGRES SEQUENCES...");
            Console.WriteLine("===========================================");
            
            try
            {
                await ResetSequencesAsync();
                Console.WriteLine("===========================================");
                Console.WriteLine("SEQUENCES RESET COMPLETE!");
                Console.WriteLine("===========================================");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR resetting sequences: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }
        }

        private async Task ImportSpuleTypenAsync()
        {
            Console.WriteLine("Importing SpuleTypen...");
            string[][] csvData = MyFile.ReadStringMatrixFromCsv("spuletyp.csv", true);
            
            List<SpuleTyp> spuleTypen = csvData.Select(line => new SpuleTyp
            {
                ID = Convert.ToInt32(line[0]),
                name = line[1],
                schenkelzahl = Convert.ToInt32(line[2]),
                bandbreite = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture),
                schichthoehe = Convert.ToDecimal(line[4], CultureInfo.InvariantCulture),
                durchmesser = Convert.ToDecimal(line[5], CultureInfo.InvariantCulture),
                toleranzbereich = Convert.ToDecimal(line[6], CultureInfo.InvariantCulture),
                notiz = line[7]
            }).ToList();

            await SpuleTypRepository.AddRangeAsync(spuleTypen.ToArray());
        }

        private async Task ImportSpulenAsync()
        {
            Console.WriteLine("Importing Spulen...");
            string[][] csvData = MyFile.ReadStringMatrixFromCsv("spule.csv", true);
            
            List<Spule> spulen = csvData.Select(line => new Spule
            {
                ID = Convert.ToInt32(line[0]),
                spuletyp_id = Convert.ToInt32(line[1]),
                auftragsnr = line[2],
                auftragsposnr = Convert.ToInt32(line[3]),
                bemessungsspannung = Convert.ToDecimal(line[4], CultureInfo.InvariantCulture),
                bemessungsfrequenz = Convert.ToDecimal(line[5], CultureInfo.InvariantCulture),
                einheit = line[6],
                notiz = line.Length > 7 ? line[7] : string.Empty
            }).ToList();

            await SpuleRepository.AddRangeAsync(spulen.ToArray());
        }

        private async Task ImportSondenTypenAsync()
        {
            Console.WriteLine("Importing SondenTypen...");
            string[][] csvData = MyFile.ReadStringMatrixFromCsv("sondentyp.csv", true);
            
            Console.WriteLine($"Total rows read: {csvData.Length}");
            for (int i = 0; i < csvData.Length; i++)
            {
                Console.WriteLine($"Row {i}: {csvData[i].Length} columns - [{string.Join(", ", csvData[i])}]");
            }
            
            List<SondenTyp> sondenTypen = new List<SondenTyp>();
            
            foreach (var line in csvData)
            {
                if (line == null || line.Length < 5)
                {
                    Console.WriteLine($"Skipping invalid line with {line?.Length ?? 0} columns");
                    continue;
                }
                
                try
                {
                    var sondenTyp = new SondenTyp
                    {
                        ID = Convert.ToInt32(line[0]),
                        name = line[1],
                        breite = Convert.ToDecimal(line[2], CultureInfo.InvariantCulture),
                        hoehe = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture),
                        windungszahl = Convert.ToInt32(line[4]),
                        alpha = Convert.ToDecimal(line[5], CultureInfo.InvariantCulture),
                        notiz = line.Length > 6 && !string.IsNullOrWhiteSpace(line[6]) ? line[6] : string.Empty
                    };
                    sondenTypen.Add(sondenTyp);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error parsing line: {string.Join(", ", line)}");
                    Console.WriteLine($"Error: {ex.Message}");
                    throw;
                }
            }

            await SondenTypRepository.AddRangeAsync(sondenTypen.ToArray());
        }

        private async Task ImportSondenAsync()
        {
            Console.WriteLine("Importing Sonden...");
            string[][] csvData = MyFile.ReadStringMatrixFromCsv("sonde.csv", true);
            
            List<Sonde> sonden = csvData.Select(line => new Sonde
            {
                ID = Convert.ToInt32(line[0]),
                sondentyp_id = Convert.ToInt32(line[1]),
                name = line[2],
                kalibrierungsfaktor = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture)
            }).ToList();

            await SondeRepository.AddRangeAsync(sonden.ToArray());
        }

        private async Task ImportMesseinstellungenAsync()
        {
            Console.WriteLine("Importing Messeinstellungen...");
            string[][] csvData = MyFile.ReadStringMatrixFromCsv("messeinstellung.csv", true);
            
            List<Messeinstellung> messeinstellungen = csvData.Select(line => new Messeinstellung
            {
                ID = Convert.ToInt32(line[0]),
                spule_id = Convert.ToInt32(line[1]),
                sondentyp_id = Convert.ToInt32(line[2]),
                name = line[3],
                sonden_pro_schenkel = Convert.ToInt32(line[4])
            }).ToList();

            await MesseinstellungRepository.AddRangeAsync(messeinstellungen.ToArray());
        }

        private async Task ImportSondenPositionenAsync()
        {
            Console.WriteLine("Importing SondenPositionen...");
            string[][] csvData = MyFile.ReadStringMatrixFromCsv("sondenposition.csv", true);
            
            List<SondenPosition> sondenPositionen = csvData.Select(line => new SondenPosition
            {
                ID = Convert.ToInt32(line[0]),
                sonde_id = string.IsNullOrEmpty(line[1]) ? 0 : Convert.ToInt32(line[1]),
                messeinstellung_id = Convert.ToInt32(line[2]),
                schenkel = Convert.ToInt32(line[3]),
                position = Convert.ToInt32(line[4])
            }).ToList();

            await SondenPositionRepository.AddRangeAsync(sondenPositionen.ToArray());
        }

        private async Task ImportMessungenAsync()
        {
            Console.WriteLine("Importing Messungen...");
            string[][] csvData = MyFile.ReadStringMatrixFromCsv("messung.csv", true);
            
            List<Messung> messungen = csvData.Select(line => new Messung
            {
                ID = Convert.ToInt32(line[0]),
                messeinstellung_id = Convert.ToInt32(line[1]),
                anfangszeitpunkt = DateTime.Parse(line[2], null, DateTimeStyles.RoundtripKind),
                endzeitpunkt = DateTime.Parse(line[3], null, DateTimeStyles.RoundtripKind),
                name = line[4],
                tauchkernstellung = Convert.ToDecimal(line[5], CultureInfo.InvariantCulture),
                pruefspannung = Convert.ToDecimal(line[6], CultureInfo.InvariantCulture),
                notiz = line[7]
            }).ToList();

            await MessungRepository.AddRangeAsync(messungen.ToArray());
        }

        private async Task ImportMesswerteAsync()
        {
            Console.WriteLine("Importing Messwerte...");
            string[][] csvData = MyFile.ReadStringMatrixFromCsv("messwert.csv", true);
            
            List<Messwert> messwerte = csvData.Select(line => new Messwert
            {
                ID = Convert.ToInt32(line[0]),
                messung_id = Convert.ToInt32(line[1]),
                sondenposition_id = Convert.ToInt32(line[2]),
                wert = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture),
                zeitpunkt = DateTime.Parse(line[4], null, DateTimeStyles.RoundtripKind)
            }).ToList();

            await MesswertRepository.AddRangeAsync(messwerte.ToArray());
        }

        private async Task ResetSequencesAsync()
        {
            // Reset all auto-increment sequences to prevent duplicate key errors
            var tables = new[]
            {
                ("Messung", "ID"),
                ("Messwert", "ID"),
                ("Messeinstellung", "ID"),
                ("SondenPosition", "ID"),
                ("Sonde", "ID"),
                ("SondenTyp", "ID"),
                ("Spule", "ID"),
                ("SpuleTyp", "ID")
            };

            foreach (var (tableName, columnName) in tables)
            {
                try
                {
                    // Use pg_get_serial_sequence to find the sequence and reset it
                    // The 'false' parameter means the next value will be maxId + 1
                    var sql = $"SELECT setval(pg_get_serial_sequence('\"{tableName}\"', '{columnName}'), COALESCE((SELECT MAX(\"{columnName}\") FROM \"{tableName}\"), 0) + 1, false)";
                    
                    await _dbContext.Database.ExecuteSqlRawAsync(sql);
                    Console.WriteLine($"✓ Reset sequence for {tableName}.{columnName}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"✗ Warning: Could not reset sequence for {tableName}: {ex.Message}");
                }
            }
        }
    }
}