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

            await SaveChangesAsync();
            
            // Reset sequences to continue from the highest ID
            await ResetSequencesAsync();
        }
        
        private async Task ResetSequencesAsync()
        {
            Console.WriteLine("Resetting sequences...");
            
            // Reset all sequences to continue from the highest ID in each table
            await _dbContext.Database.ExecuteSqlRawAsync(@"
                SELECT setval(pg_get_serial_sequence('""SpuleTyp""', 'ID'), COALESCE(MAX(""ID""), 0) + 1, false) FROM ""SpuleTyp"";
                SELECT setval(pg_get_serial_sequence('""Spule""', 'ID'), COALESCE(MAX(""ID""), 0) + 1, false) FROM ""Spule"";
                SELECT setval(pg_get_serial_sequence('""SondenTyp""', 'ID'), COALESCE(MAX(""ID""), 0) + 1, false) FROM ""SondenTyp"";
                SELECT setval(pg_get_serial_sequence('""Sonde""', 'ID'), COALESCE(MAX(""ID""), 0) + 1, false) FROM ""Sonde"";
                SELECT setval(pg_get_serial_sequence('""Messeinstellung""', 'ID'), COALESCE(MAX(""ID""), 0) + 1, false) FROM ""Messeinstellung"";
                SELECT setval(pg_get_serial_sequence('""SondenPosition""', 'ID'), COALESCE(MAX(""ID""), 0) + 1, false) FROM ""SondenPosition"";
                SELECT setval(pg_get_serial_sequence('""Messung""', 'ID'), COALESCE(MAX(""ID""), 0) + 1, false) FROM ""Messung"";
                SELECT setval(pg_get_serial_sequence('""Messwert""', 'ID'), COALESCE(MAX(""ID""), 0) + 1, false) FROM ""Messwert"";
            ");
            
            Console.WriteLine("Sequences reset successfully!");
        }

        private async Task ImportSpuleTypenAsync()
        {
            Console.WriteLine("Importing SpuleTypen...");
            string[][] csvData = MyFile.ReadStringMatrixFromCsv("spuletyp.csv", true);
            
            List<SpuleTyp> spuleTypen = csvData.Select(line => new SpuleTyp
            {
                ID = Convert.ToInt32(line[0]),
                Name = line[1],
                Schenkelzahl = Convert.ToInt32(line[2]),
                Bandbreite = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture),
                Schichthoehe = Convert.ToDecimal(line[4], CultureInfo.InvariantCulture),
                Durchmesser = Convert.ToDecimal(line[5], CultureInfo.InvariantCulture),
                Toleranzbereich = Convert.ToInt32(line[6]),
                Notiz = line[7]
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
                SpuleTypID = Convert.ToInt32(line[1]),
                Auftragsnr = line[2],
                AuftragsPosNr = Convert.ToInt32(line[3]),
                Bemessungsspannung = Convert.ToDecimal(line[4], CultureInfo.InvariantCulture),
                Bemessungsfrequenz = Convert.ToDecimal(line[5], CultureInfo.InvariantCulture),
                Einheit = Convert.ToInt32(line[6]),
                Notiz = line[7]
            }).ToList();

            await SpuleRepository.AddRangeAsync(spulen.ToArray());
        }

        private async Task ImportSondenTypenAsync()
        {
            Console.WriteLine("Importing SondenTypen...");
            string[][] csvData = MyFile.ReadStringMatrixFromCsv("sondentyp.csv", true);
            
            List<SondenTyp> sondenTypen = csvData.Select(line => new SondenTyp
            {
                ID = Convert.ToInt32(line[0]),
                Name = line[1],
                Breite = Convert.ToDecimal(line[2], CultureInfo.InvariantCulture),
                Hoehe = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture),
                Windungszahl = Convert.ToInt32(line[4]),
                Notiz = line.Length > 5 ? line[5] : ""
            }).ToList();

            await SondenTypRepository.AddRangeAsync(sondenTypen.ToArray());
        }

        private async Task ImportSondenAsync()
        {
            Console.WriteLine("Importing Sonden...");
            string[][] csvData = MyFile.ReadStringMatrixFromCsv("sonde.csv", true);
            
            List<Sonde> sonden = csvData.Select(line => new Sonde
            {
                ID = Convert.ToInt32(line[0]),
                SondenTypID = Convert.ToInt32(line[1]),
                Name = line[2],
                Kalibrierungsfaktor = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture)
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
                SpuleID = Convert.ToInt32(line[1]),
                SondenTypID = Convert.ToInt32(line[2]),
                Name = line[3],
                SondenProSchenkel = Convert.ToInt32(line[4])
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
                SondeID = string.IsNullOrEmpty(line[1]) ? null : Convert.ToInt32(line[1]),
                MesseinstellungID = Convert.ToInt32(line[2]),
                Schenkel = Convert.ToInt32(line[3]),
                Position = Convert.ToInt32(line[4])
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
                MesseinstellungID = Convert.ToInt32(line[1]),
                Anfangszeitpunkt = DateTime.Parse(line[2], null, DateTimeStyles.RoundtripKind),
                Endzeitpunkt = DateTime.Parse(line[3], null, DateTimeStyles.RoundtripKind),
                Name = line[4],
                Tauchkernstellung = Convert.ToDecimal(line[5], CultureInfo.InvariantCulture),
                Pruefspannung = Convert.ToDecimal(line[6], CultureInfo.InvariantCulture),
                Notiz = line[7]
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
                MessungID = Convert.ToInt32(line[1]),
                SondenPositionID = Convert.ToInt32(line[2]),
                Wert = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture),
                Zeitpunkt = DateTime.Parse(line[4], null, DateTimeStyles.RoundtripKind)
            }).ToList();

            await MesswertRepository.AddRangeAsync(messwerte.ToArray());
        }
    }
}