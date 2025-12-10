using System.IO;
using System.Globalization;
using System.IO.Compression;
using System.Text;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;

namespace TrenchAPI.WebAPI.Services;

public class DataPackageService
{
    private static readonly IReadOnlyList<string> RequiredCsvFiles = new[]
    {
        "spuletyp.csv",
        "spule.csv",
        "sondentyp.csv",
        "sonde.csv",
        "messeinstellung.csv",
        "sondenposition.csv",
        "messung.csv",
        "messwert.csv"
    };

    private readonly WebDbContext _context;

    public DataPackageService(WebDbContext context)
    {
        _context = context;
    }

    public async Task ImportAsync(string archivePath, string archiveExtension, CancellationToken cancellationToken = default)
    {
        var normalizedExtension = archiveExtension.ToLowerInvariant();
        var csvContents = normalizedExtension switch
        {
            ".zip" => ExtractCsvFromZip(archivePath),
            ".xlsx" => ExtractCsvFromExcel(archivePath),
            ".7z" => throw new InvalidOperationException("Import von 7z-Dateien wird aktuell nicht unterstützt. Bitte ein ZIP-Archiv hochladen."),
            _ => throw new InvalidOperationException($"Das Format '{archiveExtension}' wird nicht unterstützt.")
        };

        EnsureRequiredFiles(csvContents.Keys);

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            await ClearExistingDataAsync(cancellationToken);

            await ImportSpuleTypenAsync(csvContents["spuletyp.csv"], cancellationToken);
            await ImportSpulenAsync(csvContents["spule.csv"], cancellationToken);
            await ImportSondenTypenAsync(csvContents["sondentyp.csv"], cancellationToken);
            await ImportSondenAsync(csvContents["sonde.csv"], cancellationToken);
            await ImportMesseinstellungenAsync(csvContents["messeinstellung.csv"], cancellationToken);
            await ImportSondenPositionenAsync(csvContents["sondenposition.csv"], cancellationToken);
            await ImportMessungenAsync(csvContents["messung.csv"], cancellationToken);
            await ImportMesswerteAsync(csvContents["messwert.csv"], cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);
            
            // Synchronisiere alle Sequenzen nach dem Import, um Duplikatfehler zu vermeiden
            await SynchronizeSequencesAsync(cancellationToken);
            
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
        finally
        {
            _context.ChangeTracker.Clear();
        }
    }

    public async Task<byte[]> ExportAsync(string format, CancellationToken cancellationToken = default)
    {
        var csvFiles = new Dictionary<string, string>
        {
            ["spuletyp.csv"] = await BuildSpuleTypCsvAsync(cancellationToken),
            ["spule.csv"] = await BuildSpuleCsvAsync(cancellationToken),
            ["sondentyp.csv"] = await BuildSondenTypCsvAsync(cancellationToken),
            ["sonde.csv"] = await BuildSondeCsvAsync(cancellationToken),
            ["messeinstellung.csv"] = await BuildMesseinstellungCsvAsync(cancellationToken),
            ["sondenposition.csv"] = await BuildSondenPositionCsvAsync(cancellationToken),
            ["messung.csv"] = await BuildMessungCsvAsync(cancellationToken),
            ["messwert.csv"] = await BuildMesswertCsvAsync(cancellationToken)
        };

        var normalizedFormat = format.ToLowerInvariant();
        return normalizedFormat switch
        {
            "zip" => BuildZipArchive(csvFiles),
            "excel" => await BuildExcelFileAsync(cancellationToken),
            "7z" => throw new InvalidOperationException("Export im 7z-Format wird aktuell nicht unterstützt. Bitte ZIP verwenden."),
            _ => throw new InvalidOperationException($"Das Exportformat '{format}' wird nicht unterstützt.")
        };
    }

    private static Dictionary<string, string> ExtractCsvFromZip(string archivePath)
    {
        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        using var archive = ZipFile.OpenRead(archivePath);
        foreach (var entry in archive.Entries)
        {
            if (entry.FullName.EndsWith("/", StringComparison.Ordinal))
            {
                continue;
            }

            var fileName = Path.GetFileName(entry.FullName);
            if (!fileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            using var stream = entry.Open();
            using var reader = new StreamReader(stream, Encoding.UTF8);
            result[fileName] = reader.ReadToEnd();
        }

        return result;
    }

    private static Dictionary<string, string> ExtractCsvFromExcel(string filePath)
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        using var package = new ExcelPackage(new FileInfo(filePath));
        var sheets = package.Workbook.Worksheets;

        // Mapping from expected CSV filename to worksheet name and CSV headers
        var mappings = new Dictionary<string, (string SheetName, string[] Headers)>(StringComparer.OrdinalIgnoreCase)
        {
            ["spuletyp.csv"] = ("SpuleTyp", new[] { "id","name","schenkelzahl","bandbreite","schichthoehe","durchmesser","toleranzbereich","notiz" }),
            ["spule.csv"] = ("Spule", new[] { "id","spulentyp_id","auftragsnr","auftragsposnr","bemessungsspannung","bemessungsfrequenz","einheit","notiz" }),
            ["sondentyp.csv"] = ("SondenTyp", new[] { "id","name","breite","hoehe","windungszahl","alpha","notiz" }),
            ["sonde.csv"] = ("Sonde", new[] { "id","sondentyp_id","name","kalibrierungsfaktor" }),
            ["messeinstellung.csv"] = ("Messeinstellung", new[] { "id","spule_id","sondentyp_id","name","sonden_pro_schenkel" }),
            ["sondenposition.csv"] = ("SondenPosition", new[] { "id","sonde_id","messeinstellung_id","schenkel","position" }),
            ["messung.csv"] = ("Messung", new[] { "id","messeinstellung_id","anfangszeitpunkt","endzeitpunkt","name","tauchkernstellung","pruefspannung","notiz" }),
            ["messwert.csv"] = ("Messwert", new[] { "id","messung_id","sondenposition_id","wert","zeitpunkt" })
        };

        foreach (var kv in mappings)
        {
            var fileName = kv.Key;
            var sheetName = kv.Value.SheetName;
            var headers = kv.Value.Headers;

            var sheet = sheets.FirstOrDefault(ws => ws.Name.Equals(sheetName, StringComparison.OrdinalIgnoreCase));
            if (sheet == null)
            {
                throw new InvalidDataException($"Das Arbeitsblatt '{sheetName}' fehlt in der Excel-Datei.");
            }

            var sb = new StringBuilder();
            // write header (lowercase csv header names expected)
            sb.AppendLine(string.Join(',', headers));

            // Skip if sheet is empty or has no data
            if (sheet.Dimension == null || sheet.Dimension.End.Row < 4)
            {
                result[fileName] = sb.ToString();
                continue;
            }

            // We expect data to start on row 4 (export uses row 1=title, 3=headers, data from 4)
            var startRow = 4;
            for (int r = startRow; r <= sheet.Dimension.End.Row; r++)
            {
                bool allEmpty = true;
                var values = new List<string>();
                for (int c = 1; c <= headers.Length; c++)
                {
                    var cell = sheet.Cells[r, c];
                    var cellValue = cell?.Value;
                    
                    if (cellValue == null || string.IsNullOrWhiteSpace(cell.Text))
                    {
                        values.Add(string.Empty);
                        continue;
                    }

                    allEmpty = false;

                    if (cellValue is DateTime dt)
                    {
                        // Ensure DateTime is UTC for PostgreSQL compatibility
                        var utcDt = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                        values.Add(utcDt.ToString("o", CultureInfo.InvariantCulture));
                    }
                    else if (cellValue is double dbl && IsDateColumn(headers[c - 1]))
                    {
                        // Excel stores dates as double (OLE Automation date)
                        // Convert to DateTime then format as UTC
                        try
                        {
                            var dateTime = DateTime.FromOADate(dbl);
                            var utcDt = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
                            values.Add(utcDt.ToString("o", CultureInfo.InvariantCulture));
                        }
                        catch
                        {
                            values.Add(cell.Text);
                        }
                    }
                    else
                    {
                        // Use the cell's formatted text value
                        values.Add(cell.Text);
                    }
                }

                if (allEmpty)
                {
                    continue;
                }

                // Don't escape twice - values are already formatted
                sb.AppendLine(string.Join(',', values));
            }

            result[fileName] = sb.ToString();
        }

        return result;
    }

    private static bool IsDateColumn(string columnName)
    {
        var lowerName = columnName.ToLowerInvariant();
        return lowerName.Contains("zeitpunkt") || lowerName.Contains("anfangs") || lowerName.Contains("end");
    }

    private static void EnsureRequiredFiles(IEnumerable<string> fileNames)
    {
        var missing = RequiredCsvFiles
            .Where(required => !fileNames.Contains(required, StringComparer.OrdinalIgnoreCase))
            .ToArray();

        if (missing.Length > 0)
        {
            throw new InvalidDataException($"Folgende CSV-Dateien fehlen im Archiv: {string.Join(", ", missing)}");
        }
    }

    private async Task ClearExistingDataAsync(CancellationToken cancellationToken)
    {
        await _context.Messwert.ExecuteDeleteAsync(cancellationToken);
        await _context.Messung.ExecuteDeleteAsync(cancellationToken);
        await _context.SondenPosition.ExecuteDeleteAsync(cancellationToken);
        await _context.Messeinstellung.ExecuteDeleteAsync(cancellationToken);
        await _context.Sonde.ExecuteDeleteAsync(cancellationToken);
        await _context.SondenTyp.ExecuteDeleteAsync(cancellationToken);
        await _context.Spule.ExecuteDeleteAsync(cancellationToken);
        await _context.SpuleTyp.ExecuteDeleteAsync(cancellationToken);
    }

    private async Task ImportSpuleTypenAsync(string csvContent, CancellationToken cancellationToken)
    {
        var rows = ParseCsv(csvContent, skipHeader: true);
        var entities = rows.Select(line => new SpuleTyp
        {
            ID = Convert.ToInt32(line[0], CultureInfo.InvariantCulture),
            Name = line[1],
            Schenkelzahl = Convert.ToInt32(line[2], CultureInfo.InvariantCulture),
            Bandbreite = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture),
            Schichthoehe = Convert.ToDecimal(line[4], CultureInfo.InvariantCulture),
            Durchmesser = Convert.ToDecimal(line[5], CultureInfo.InvariantCulture),
            Toleranzbereich = Convert.ToDecimal(line[6], CultureInfo.InvariantCulture),
            Notiz = line.Length > 7 ? line[7] : string.Empty
        }).ToList();

        await _context.SpuleTyp.AddRangeAsync(entities, cancellationToken);
    }

    private async Task ImportSpulenAsync(string csvContent, CancellationToken cancellationToken)
    {
        var rows = ParseCsv(csvContent, skipHeader: true);
        var entities = rows.Select(line => new Spule
        {
            ID = Convert.ToInt32(line[0], CultureInfo.InvariantCulture),
            SpuleTypID = Convert.ToInt32(line[1], CultureInfo.InvariantCulture),
            Auftragsnr = line[2],
            AuftragsPosNr = line[3],
            Bemessungsspannung = Convert.ToDecimal(line[4], CultureInfo.InvariantCulture),
            Bemessungsfrequenz = Convert.ToDecimal(line[5], CultureInfo.InvariantCulture),
            Einheit = line[6],
            Notiz = line.Length > 7 ? line[7] : string.Empty
        }).ToList();

        await _context.Spule.AddRangeAsync(entities, cancellationToken);
    }

    private async Task ImportSondenTypenAsync(string csvContent, CancellationToken cancellationToken)
    {
        var rows = ParseCsv(csvContent, skipHeader: true);
        var entities = rows.Select(line => new SondenTyp
        {
            ID = Convert.ToInt32(line[0], CultureInfo.InvariantCulture),
            Name = line[1],
            Breite = Convert.ToDecimal(line[2], CultureInfo.InvariantCulture),
            Hoehe = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture),
            Windungszahl = Convert.ToInt32(line[4], CultureInfo.InvariantCulture),
            Alpha = Convert.ToDecimal(line[5], CultureInfo.InvariantCulture),
            Notiz = line.Length > 6 ? line[6] : string.Empty
        }).ToList();

        await _context.SondenTyp.AddRangeAsync(entities, cancellationToken);
    }

    private async Task ImportSondenAsync(string csvContent, CancellationToken cancellationToken)
    {
        var rows = ParseCsv(csvContent, skipHeader: true);
        var entities = rows.Select(line => new Sonde
        {
            ID = Convert.ToInt32(line[0], CultureInfo.InvariantCulture),
            SondenTypID = Convert.ToInt32(line[1], CultureInfo.InvariantCulture),
            Name = line[2],
            Kalibrierungsfaktor = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture)
        }).ToList();

        await _context.Sonde.AddRangeAsync(entities, cancellationToken);
    }

    private async Task ImportMesseinstellungenAsync(string csvContent, CancellationToken cancellationToken)
    {
        var rows = ParseCsv(csvContent, skipHeader: true);
        var entities = rows.Select(line => new Messeinstellung
        {
            ID = Convert.ToInt32(line[0], CultureInfo.InvariantCulture),
            SpuleID = Convert.ToInt32(line[1], CultureInfo.InvariantCulture),
            SondenTypID = Convert.ToInt32(line[2], CultureInfo.InvariantCulture),
            Name = line[3],
            SondenProSchenkel = Convert.ToInt32(line[4], CultureInfo.InvariantCulture)
        }).ToList();

        await _context.Messeinstellung.AddRangeAsync(entities, cancellationToken);
    }

    private async Task ImportSondenPositionenAsync(string csvContent, CancellationToken cancellationToken)
    {
        var rows = ParseCsv(csvContent, skipHeader: true);
        var entities = rows.Select(line => new SondenPosition
        {
            ID = Convert.ToInt32(line[0], CultureInfo.InvariantCulture),
            SondeID = string.IsNullOrWhiteSpace(line[1]) ? null : Convert.ToInt32(line[1], CultureInfo.InvariantCulture),
            MesseinstellungID = Convert.ToInt32(line[2], CultureInfo.InvariantCulture),
            Schenkel = Convert.ToInt32(line[3], CultureInfo.InvariantCulture),
            Position = Convert.ToInt32(line[4], CultureInfo.InvariantCulture)
        }).ToList();

        await _context.SondenPosition.AddRangeAsync(entities, cancellationToken);
    }

    private async Task ImportMessungenAsync(string csvContent, CancellationToken cancellationToken)
    {
        var rows = ParseCsv(csvContent, skipHeader: true);
        var entities = rows.Select(line => new Messung
        {
            ID = Convert.ToInt32(line[0], CultureInfo.InvariantCulture),
            MesseinstellungID = Convert.ToInt32(line[1], CultureInfo.InvariantCulture),
            Anfangszeitpunkt = DateTime.Parse(line[2], CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind),
            Endzeitpunkt = DateTime.Parse(line[3], CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind),
            Name = line[4],
            Tauchkernstellung = Convert.ToDecimal(line[5], CultureInfo.InvariantCulture),
            Pruefspannung = Convert.ToDecimal(line[6], CultureInfo.InvariantCulture),
            Notiz = line.Length > 7 ? line[7] : string.Empty
        }).ToList();

        await _context.Messung.AddRangeAsync(entities, cancellationToken);
    }

    private async Task ImportMesswerteAsync(string csvContent, CancellationToken cancellationToken)
    {
        var rows = ParseCsv(csvContent, skipHeader: true);
        var entities = rows.Select(line => new Messwert
        {
            ID = Convert.ToInt32(line[0], CultureInfo.InvariantCulture),
            MessungID = Convert.ToInt32(line[1], CultureInfo.InvariantCulture),
            SondenPositionID = Convert.ToInt32(line[2], CultureInfo.InvariantCulture),
            Wert = Convert.ToDecimal(line[3], CultureInfo.InvariantCulture),
            Zeitpunkt = DateTime.Parse(line[4], CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind)
        }).ToList();

        await _context.Messwert.AddRangeAsync(entities, cancellationToken);
    }

    private async Task<string> BuildSpuleTypCsvAsync(CancellationToken cancellationToken)
    {
        var entities = await _context.SpuleTyp.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        var builder = new StringBuilder();
        builder.AppendLine("id,name,schenkelzahl,bandbreite,schichthoehe,durchmesser,toleranzbereich,notiz");

        foreach (var entity in entities)
        {
            builder
                .Append(entity.ID).Append(',')
                .Append(EscapeCsvField(entity.Name)).Append(',')
                .Append(entity.Schenkelzahl.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Bandbreite.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Schichthoehe.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Durchmesser.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Toleranzbereich.ToString(CultureInfo.InvariantCulture)).Append(',')
                .AppendLine(EscapeCsvField(entity.Notiz));
        }

        return builder.ToString();
    }

    private async Task<string> BuildSpuleCsvAsync(CancellationToken cancellationToken)
    {
        var entities = await _context.Spule.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        var builder = new StringBuilder();
        builder.AppendLine("id,spulentyp_id,auftragsnr,auftragsposnr,bemessungsspannung,bemessungsfrequenz,einheit,notiz");

        foreach (var entity in entities)
        {
            builder
                .Append(entity.ID).Append(',')
                .Append(entity.SpuleTypID).Append(',')
                .Append(EscapeCsvField(entity.Auftragsnr)).Append(',')
                .Append(EscapeCsvField(entity.AuftragsPosNr)).Append(',')
                .Append(entity.Bemessungsspannung.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Bemessungsfrequenz.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(EscapeCsvField(entity.Einheit)).Append(',')
                .AppendLine(EscapeCsvField(entity.Notiz));
        }

        return builder.ToString();
    }

    private async Task<string> BuildSondenTypCsvAsync(CancellationToken cancellationToken)
    {
        var entities = await _context.SondenTyp.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        var builder = new StringBuilder();
        builder.AppendLine("id,name,breite,hoehe,windungszahl,alpha,notiz");

        foreach (var entity in entities)
        {
            builder
                .Append(entity.ID).Append(',')
                .Append(EscapeCsvField(entity.Name)).Append(',')
                .Append(entity.Breite.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Hoehe.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Windungszahl.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Alpha.ToString(CultureInfo.InvariantCulture)).Append(',')
                .AppendLine(EscapeCsvField(entity.Notiz));
        }

        return builder.ToString();
    }

    private async Task<string> BuildSondeCsvAsync(CancellationToken cancellationToken)
    {
        var entities = await _context.Sonde.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        var builder = new StringBuilder();
        builder.AppendLine("id,sondentyp_id,name,kalibrierungsfaktor");

        foreach (var entity in entities)
        {
            builder
                .Append(entity.ID).Append(',')
                .Append(entity.SondenTypID).Append(',')
                .Append(EscapeCsvField(entity.Name)).Append(',')
                .AppendLine(entity.Kalibrierungsfaktor.ToString(CultureInfo.InvariantCulture));
        }

        return builder.ToString();
    }

    private async Task<string> BuildMesseinstellungCsvAsync(CancellationToken cancellationToken)
    {
        var entities = await _context.Messeinstellung.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        var builder = new StringBuilder();
        builder.AppendLine("id,spule_id,sondentyp_id,name,sonden_pro_schenkel");

        foreach (var entity in entities)
        {
            builder
                .Append(entity.ID).Append(',')
                .Append(entity.SpuleID).Append(',')
                .Append(entity.SondenTypID).Append(',')
                .Append(EscapeCsvField(entity.Name)).Append(',')
                .AppendLine(entity.SondenProSchenkel.ToString(CultureInfo.InvariantCulture));
        }

        return builder.ToString();
    }

    private async Task<string> BuildSondenPositionCsvAsync(CancellationToken cancellationToken)
    {
        var entities = await _context.SondenPosition.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        var builder = new StringBuilder();
        builder.AppendLine("id,sonde_id,messeinstellung_id,schenkel,position");

        foreach (var entity in entities)
        {
            builder
                .Append(entity.ID).Append(',')
                .Append(entity.SondeID?.ToString(CultureInfo.InvariantCulture) ?? string.Empty).Append(',')
                .Append(entity.MesseinstellungID).Append(',')
                .Append(entity.Schenkel.ToString(CultureInfo.InvariantCulture)).Append(',')
                .AppendLine(entity.Position.ToString(CultureInfo.InvariantCulture));
        }

        return builder.ToString();
    }

    private async Task<string> BuildMessungCsvAsync(CancellationToken cancellationToken)
    {
        var entities = await _context.Messung.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        var builder = new StringBuilder();
        builder.AppendLine("id,messeinstellung_id,anfangszeitpunkt,endzeitpunkt,name,tauchkernstellung,pruefspannung,notiz");

        foreach (var entity in entities)
        {
            builder
                .Append(entity.ID).Append(',')
                .Append(entity.MesseinstellungID).Append(',')
                .Append(entity.Anfangszeitpunkt.ToString("o", CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Endzeitpunkt.ToString("o", CultureInfo.InvariantCulture)).Append(',')
                .Append(EscapeCsvField(entity.Name)).Append(',')
                .Append(entity.Tauchkernstellung.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Pruefspannung.ToString(CultureInfo.InvariantCulture)).Append(',')
                .AppendLine(EscapeCsvField(entity.Notiz));
        }

        return builder.ToString();
    }

    private async Task<string> BuildMesswertCsvAsync(CancellationToken cancellationToken)
    {
        var entities = await _context.Messwert.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        var builder = new StringBuilder();
        builder.AppendLine("id,messung_id,sondenposition_id,wert,zeitpunkt");

        foreach (var entity in entities)
        {
            builder
                .Append(entity.ID).Append(',')
                .Append(entity.MessungID).Append(',')
                .Append(entity.SondenPositionID).Append(',')
                .Append(entity.Wert.ToString(CultureInfo.InvariantCulture)).Append(',')
                .AppendLine(entity.Zeitpunkt.ToString("o", CultureInfo.InvariantCulture));
        }

        return builder.ToString();
    }

    private static string[][] ParseCsv(string csvContent, bool skipHeader)
    {
        var rows = new List<string[]>();
        using var reader = new StringReader(csvContent);
        string? line;
        var isFirstLine = true;

        while ((line = reader.ReadLine()) is not null)
        {
            if (isFirstLine && skipHeader)
            {
                isFirstLine = false;
                continue;
            }

            isFirstLine = false;

            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            rows.Add(SplitCsvLine(line));
        }

        return rows.ToArray();
    }

    private static string[] SplitCsvLine(string line)
    {
        // The CSV files use simple comma-separated values without quoting.
        return line.Split(',');
    }

    private static string EscapeCsvField(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        var needsQuotes = value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r');
        if (value.Contains('"'))
        {
            value = value.Replace("\"", "\"\"");
        }

        return needsQuotes ? $"\"{value}\"" : value;
    }

    private static byte[] BuildZipArchive(Dictionary<string, string> csvFiles)
    {
        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true, Encoding.UTF8))
        {
            foreach (var (fileName, content) in csvFiles)
            {
                var entry = archive.CreateEntry($"data/{fileName}", System.IO.Compression.CompressionLevel.Optimal);
                using var entryStream = entry.Open();
                using var writer = new StreamWriter(entryStream, Encoding.UTF8);
                writer.Write(content);
            }
        }

        return memoryStream.ToArray();
    }

    private static byte[] BuildSevenZipArchive(Dictionary<string, string> csvFiles) =>
        throw new InvalidOperationException("Export im 7z-Format wird aktuell nicht unterstützt. Bitte ZIP verwenden.");

    private async Task<byte[]> BuildExcelFileAsync(CancellationToken cancellationToken)
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        
        using var package = new ExcelPackage();
        
        // Erstelle Sheets für jede Entität
        await CreateSpuleTypSheetAsync(package, cancellationToken);
        await CreateSpuleSheetAsync(package, cancellationToken);
        await CreateSondenTypSheetAsync(package, cancellationToken);
        await CreateSondeSheetAsync(package, cancellationToken);
        await CreateMesseinstellungSheetAsync(package, cancellationToken);
        await CreateSondenPositionSheetAsync(package, cancellationToken);
        await CreateMessungSheetAsync(package, cancellationToken);
        await CreateMesswertSheetAsync(package, cancellationToken);
        
        return package.GetAsByteArray();
    }

    private async Task CreateSpuleTypSheetAsync(ExcelPackage package, CancellationToken cancellationToken)
    {
        var worksheet = package.Workbook.Worksheets.Add("SpuleTyp");
        var entities = await _context.SpuleTyp.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        
        // Titel
        worksheet.Cells[1, 1].Value = "SpuleTyp";
        worksheet.Cells[1, 1, 1, 8].Merge = true;
        worksheet.Cells[1, 1].Style.Font.Size = 16;
        worksheet.Cells[1, 1].Style.Font.Bold = true;
        worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        
        // Überschriften
        worksheet.Cells[3, 1].Value = "ID";
        worksheet.Cells[3, 2].Value = "Name";
        worksheet.Cells[3, 3].Value = "Schenkelzahl";
        worksheet.Cells[3, 4].Value = "Bandbreite";
        worksheet.Cells[3, 5].Value = "Schichthöhe";
        worksheet.Cells[3, 6].Value = "Durchmesser";
        worksheet.Cells[3, 7].Value = "Toleranzbereich";
        worksheet.Cells[3, 8].Value = "Notiz";
        
        // Formatierung der Überschriften
        var headerRange = worksheet.Cells[3, 1, 3, 8];
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
        headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
        headerRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
        
        // Daten
        int row = 4;
        foreach (var entity in entities)
        {
            worksheet.Cells[row, 1].Value = entity.ID;
            worksheet.Cells[row, 2].Value = entity.Name;
            worksheet.Cells[row, 3].Value = entity.Schenkelzahl;
            worksheet.Cells[row, 4].Value = entity.Bandbreite;
            worksheet.Cells[row, 5].Value = entity.Schichthoehe;
            worksheet.Cells[row, 6].Value = entity.Durchmesser;
            worksheet.Cells[row, 7].Value = entity.Toleranzbereich;
            worksheet.Cells[row, 8].Value = entity.Notiz;
            row++;
        }
        
        // Spaltenbreite anpassen
        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
    }

    private async Task CreateSpuleSheetAsync(ExcelPackage package, CancellationToken cancellationToken)
    {
        var worksheet = package.Workbook.Worksheets.Add("Spule");
        var entities = await _context.Spule.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        
        worksheet.Cells[1, 1].Value = "Spule";
        worksheet.Cells[1, 1, 1, 8].Merge = true;
        worksheet.Cells[1, 1].Style.Font.Size = 16;
        worksheet.Cells[1, 1].Style.Font.Bold = true;
        worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        
        worksheet.Cells[3, 1].Value = "ID";
        worksheet.Cells[3, 2].Value = "SpuleTypID";
        worksheet.Cells[3, 3].Value = "Auftragsnr";
        worksheet.Cells[3, 4].Value = "AuftragsPosNr";
        worksheet.Cells[3, 5].Value = "Bemessungsspannung";
        worksheet.Cells[3, 6].Value = "Bemessungsfrequenz";
        worksheet.Cells[3, 7].Value = "Einheit";
        worksheet.Cells[3, 8].Value = "Notiz";
        
        var headerRange = worksheet.Cells[3, 1, 3, 8];
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
        headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
        headerRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
        
        int row = 4;
        foreach (var entity in entities)
        {
            worksheet.Cells[row, 1].Value = entity.ID;
            worksheet.Cells[row, 2].Value = entity.SpuleTypID;
            worksheet.Cells[row, 3].Value = entity.Auftragsnr;
            worksheet.Cells[row, 4].Value = entity.AuftragsPosNr;
            worksheet.Cells[row, 5].Value = entity.Bemessungsspannung;
            worksheet.Cells[row, 6].Value = entity.Bemessungsfrequenz;
            worksheet.Cells[row, 7].Value = entity.Einheit;
            worksheet.Cells[row, 8].Value = entity.Notiz;
            row++;
        }
        
        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
    }

    private async Task CreateSondenTypSheetAsync(ExcelPackage package, CancellationToken cancellationToken)
    {
        var worksheet = package.Workbook.Worksheets.Add("SondenTyp");
        var entities = await _context.SondenTyp.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        
        worksheet.Cells[1, 1].Value = "SondenTyp";
        worksheet.Cells[1, 1, 1, 7].Merge = true;
        worksheet.Cells[1, 1].Style.Font.Size = 16;
        worksheet.Cells[1, 1].Style.Font.Bold = true;
        worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        
        worksheet.Cells[3, 1].Value = "ID";
        worksheet.Cells[3, 2].Value = "Name";
        worksheet.Cells[3, 3].Value = "Breite";
        worksheet.Cells[3, 4].Value = "Höhe";
        worksheet.Cells[3, 5].Value = "Windungszahl";
        worksheet.Cells[3, 6].Value = "Alpha";
        worksheet.Cells[3, 7].Value = "Notiz";
        
        var headerRange = worksheet.Cells[3, 1, 3, 7];
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
        headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
        headerRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
        
        int row = 4;
        foreach (var entity in entities)
        {
            worksheet.Cells[row, 1].Value = entity.ID;
            worksheet.Cells[row, 2].Value = entity.Name;
            worksheet.Cells[row, 3].Value = entity.Breite;
            worksheet.Cells[row, 4].Value = entity.Hoehe;
            worksheet.Cells[row, 5].Value = entity.Windungszahl;
            worksheet.Cells[row, 6].Value = entity.Alpha;
            worksheet.Cells[row, 7].Value = entity.Notiz;
            row++;
        }
        
        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
    }

    private async Task CreateSondeSheetAsync(ExcelPackage package, CancellationToken cancellationToken)
    {
        var worksheet = package.Workbook.Worksheets.Add("Sonde");
        var entities = await _context.Sonde.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        
        worksheet.Cells[1, 1].Value = "Sonde";
        worksheet.Cells[1, 1, 1, 4].Merge = true;
        worksheet.Cells[1, 1].Style.Font.Size = 16;
        worksheet.Cells[1, 1].Style.Font.Bold = true;
        worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        
        worksheet.Cells[3, 1].Value = "ID";
        worksheet.Cells[3, 2].Value = "SondenTypID";
        worksheet.Cells[3, 3].Value = "Name";
        worksheet.Cells[3, 4].Value = "Kalibrierungsfaktor";
        
        var headerRange = worksheet.Cells[3, 1, 3, 4];
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
        headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
        headerRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
        
        int row = 4;
        foreach (var entity in entities)
        {
            worksheet.Cells[row, 1].Value = entity.ID;
            worksheet.Cells[row, 2].Value = entity.SondenTypID;
            worksheet.Cells[row, 3].Value = entity.Name;
            worksheet.Cells[row, 4].Value = entity.Kalibrierungsfaktor;
            row++;
        }
        
        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
    }

    private async Task CreateMesseinstellungSheetAsync(ExcelPackage package, CancellationToken cancellationToken)
    {
        var worksheet = package.Workbook.Worksheets.Add("Messeinstellung");
        var entities = await _context.Messeinstellung.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        
        worksheet.Cells[1, 1].Value = "Messeinstellung";
        worksheet.Cells[1, 1, 1, 5].Merge = true;
        worksheet.Cells[1, 1].Style.Font.Size = 16;
        worksheet.Cells[1, 1].Style.Font.Bold = true;
        worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        
        worksheet.Cells[3, 1].Value = "ID";
        worksheet.Cells[3, 2].Value = "SpuleID";
        worksheet.Cells[3, 3].Value = "SondenTypID";
        worksheet.Cells[3, 4].Value = "Name";
        worksheet.Cells[3, 5].Value = "SondenProSchenkel";
        
        var headerRange = worksheet.Cells[3, 1, 3, 5];
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
        headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
        headerRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
        
        int row = 4;
        foreach (var entity in entities)
        {
            worksheet.Cells[row, 1].Value = entity.ID;
            worksheet.Cells[row, 2].Value = entity.SpuleID;
            worksheet.Cells[row, 3].Value = entity.SondenTypID;
            worksheet.Cells[row, 4].Value = entity.Name;
            worksheet.Cells[row, 5].Value = entity.SondenProSchenkel;
            row++;
        }
        
        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
    }

    private async Task CreateSondenPositionSheetAsync(ExcelPackage package, CancellationToken cancellationToken)
    {
        var worksheet = package.Workbook.Worksheets.Add("SondenPosition");
        var entities = await _context.SondenPosition.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        
        worksheet.Cells[1, 1].Value = "SondenPosition";
        worksheet.Cells[1, 1, 1, 5].Merge = true;
        worksheet.Cells[1, 1].Style.Font.Size = 16;
        worksheet.Cells[1, 1].Style.Font.Bold = true;
        worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        
        worksheet.Cells[3, 1].Value = "ID";
        worksheet.Cells[3, 2].Value = "SondeID";
        worksheet.Cells[3, 3].Value = "MesseinstellungID";
        worksheet.Cells[3, 4].Value = "Schenkel";
        worksheet.Cells[3, 5].Value = "Position";
        
        var headerRange = worksheet.Cells[3, 1, 3, 5];
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
        headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
        headerRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
        
        int row = 4;
        foreach (var entity in entities)
        {
            worksheet.Cells[row, 1].Value = entity.ID;
            worksheet.Cells[row, 2].Value = entity.SondeID?.ToString(CultureInfo.InvariantCulture) ?? string.Empty;
            worksheet.Cells[row, 3].Value = entity.MesseinstellungID;
            worksheet.Cells[row, 4].Value = entity.Schenkel;
            worksheet.Cells[row, 5].Value = entity.Position;
            row++;
        }
        
        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
    }

    private async Task CreateMessungSheetAsync(ExcelPackage package, CancellationToken cancellationToken)
    {
        var worksheet = package.Workbook.Worksheets.Add("Messung");
        var entities = await _context.Messung.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        
        worksheet.Cells[1, 1].Value = "Messung";
        worksheet.Cells[1, 1, 1, 8].Merge = true;
        worksheet.Cells[1, 1].Style.Font.Size = 16;
        worksheet.Cells[1, 1].Style.Font.Bold = true;
        worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        
        worksheet.Cells[3, 1].Value = "ID";
        worksheet.Cells[3, 2].Value = "MesseinstellungID";
        worksheet.Cells[3, 3].Value = "Anfangszeitpunkt";
        worksheet.Cells[3, 4].Value = "Endzeitpunkt";
        worksheet.Cells[3, 5].Value = "Name";
        worksheet.Cells[3, 6].Value = "Tauchkernstellung";
        worksheet.Cells[3, 7].Value = "Prüfspannung";
        worksheet.Cells[3, 8].Value = "Notiz";
        
        var headerRange = worksheet.Cells[3, 1, 3, 8];
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
        headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
        headerRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
        
        int row = 4;
        foreach (var entity in entities)
        {
            worksheet.Cells[row, 1].Value = entity.ID;
            worksheet.Cells[row, 2].Value = entity.MesseinstellungID;
            worksheet.Cells[row, 3].Value = entity.Anfangszeitpunkt;
            worksheet.Cells[row, 3].Style.Numberformat.Format = "yyyy-MM-dd HH:mm:ss";
            worksheet.Cells[row, 4].Value = entity.Endzeitpunkt;
            worksheet.Cells[row, 4].Style.Numberformat.Format = "yyyy-MM-dd HH:mm:ss";
            worksheet.Cells[row, 5].Value = entity.Name;
            worksheet.Cells[row, 6].Value = entity.Tauchkernstellung;
            worksheet.Cells[row, 7].Value = entity.Pruefspannung;
            worksheet.Cells[row, 8].Value = entity.Notiz;
            row++;
        }
        
        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
    }

    private async Task CreateMesswertSheetAsync(ExcelPackage package, CancellationToken cancellationToken)
    {
        var worksheet = package.Workbook.Worksheets.Add("Messwert");
        var entities = await _context.Messwert.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        
        worksheet.Cells[1, 1].Value = "Messwert";
        worksheet.Cells[1, 1, 1, 5].Merge = true;
        worksheet.Cells[1, 1].Style.Font.Size = 16;
        worksheet.Cells[1, 1].Style.Font.Bold = true;
        worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        
        worksheet.Cells[3, 1].Value = "ID";
        worksheet.Cells[3, 2].Value = "MessungID";
        worksheet.Cells[3, 3].Value = "SondenPositionID";
        worksheet.Cells[3, 4].Value = "Wert";
        worksheet.Cells[3, 5].Value = "Zeitpunkt";
        
        var headerRange = worksheet.Cells[3, 1, 3, 5];
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
        headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
        headerRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
        
        int row = 4;
        foreach (var entity in entities)
        {
            worksheet.Cells[row, 1].Value = entity.ID;
            worksheet.Cells[row, 2].Value = entity.MessungID;
            worksheet.Cells[row, 3].Value = entity.SondenPositionID;
            worksheet.Cells[row, 4].Value = entity.Wert;
            worksheet.Cells[row, 5].Value = entity.Zeitpunkt;
            worksheet.Cells[row, 5].Style.Numberformat.Format = "yyyy-MM-dd HH:mm:ss";
            row++;
        }
        
        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
    }

    private async Task SynchronizeSequencesAsync(CancellationToken cancellationToken = default)
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
                var sql = $@"SELECT setval(
                    pg_get_serial_sequence('""{tableName}""', '{columnName}'), 
                    COALESCE((SELECT MAX(""{columnName}"") FROM ""{tableName}""), 0) + 1, 
                    false)";
                
                await _context.Database.ExecuteSqlRawAsync(sql, cancellationToken);
            }
            catch
            {
                // Ignore errors for sequences that don't exist or can't be reset
                // This is not critical for the import process
            }
        }
    }
}

