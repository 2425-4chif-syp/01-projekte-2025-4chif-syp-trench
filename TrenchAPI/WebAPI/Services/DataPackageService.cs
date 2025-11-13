using System.IO;
using System.Globalization;
using System.IO.Compression;
using System.Text;
using Microsoft.EntityFrameworkCore;
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
            Toleranzbereich = Convert.ToInt32(line[6], CultureInfo.InvariantCulture),
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
            Einheit = Convert.ToInt32(line[6], CultureInfo.InvariantCulture),
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
            Notiz = line.Length > 5 ? line[5] : string.Empty
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
                .Append(entity.Einheit.ToString(CultureInfo.InvariantCulture)).Append(',')
                .AppendLine(EscapeCsvField(entity.Notiz));
        }

        return builder.ToString();
    }

    private async Task<string> BuildSondenTypCsvAsync(CancellationToken cancellationToken)
    {
        var entities = await _context.SondenTyp.AsNoTracking().OrderBy(e => e.ID).ToListAsync(cancellationToken);
        var builder = new StringBuilder();
        builder.AppendLine("id,name,breite,hoehe,windungszahl,notiz");

        foreach (var entity in entities)
        {
            builder
                .Append(entity.ID).Append(',')
                .Append(EscapeCsvField(entity.Name)).Append(',')
                .Append(entity.Breite.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Hoehe.ToString(CultureInfo.InvariantCulture)).Append(',')
                .Append(entity.Windungszahl.ToString(CultureInfo.InvariantCulture)).Append(',')
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
                var entry = archive.CreateEntry($"data/{fileName}", CompressionLevel.Optimal);
                using var entryStream = entry.Open();
                using var writer = new StreamWriter(entryStream, Encoding.UTF8);
                writer.Write(content);
            }
        }

        return memoryStream.ToArray();
    }

    private static byte[] BuildSevenZipArchive(Dictionary<string, string> csvFiles) =>
        throw new InvalidOperationException("Export im 7z-Format wird aktuell nicht unterstützt. Bitte ZIP verwenden.");
}

