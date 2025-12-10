using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TrenchAPI.WebAPI.Services;

namespace TrenchAPI.Controllers;

[Route("api/data-package")]
[ApiController]
public class DataPackageController : ControllerBase
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".zip",
        ".7z",
        ".xlsx"
    };

    private readonly DataPackageService _dataPackageService;

    public DataPackageController(DataPackageService dataPackageService)
    {
        _dataPackageService = dataPackageService;
    }

    [HttpPost("upload")]
    [ApiKeyAuth]
    [Consumes("multipart/form-data")]
    [RequestFormLimits(MultipartBodyLengthLimit = 200 * 1024 * 1024)]
    public async Task<IActionResult> UploadAsync([FromForm] IFormFile dataPackage, CancellationToken cancellationToken)
    {
        if (dataPackage == null || dataPackage.Length == 0)
        {
            return BadRequest("Es wurde keine Datei hochgeladen.");
        }

        var extension = Path.GetExtension(dataPackage.FileName);
        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            return BadRequest("Nur ZIP- oder Excel-Dateien werden unterstützt.");
        }

        var tempFilePath = Path.Combine(Path.GetTempPath(), $"trench-upload-{Guid.NewGuid()}{extension}");

        try
        {
            await using (var stream = System.IO.File.Create(tempFilePath))
            {
                await dataPackage.CopyToAsync(stream, cancellationToken);
            }

            await _dataPackageService.ImportAsync(tempFilePath, extension, cancellationToken);
            return Ok(new { message = "Datenpaket wurde erfolgreich importiert." });
        }
        catch (InvalidDataException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"Import fehlgeschlagen: {ex.Message}");
        }
        finally
        {
            if (System.IO.File.Exists(tempFilePath))
            {
                System.IO.File.Delete(tempFilePath);
            }
        }
    }

    [HttpGet("download")]
    public async Task<IActionResult> DownloadAsync([FromQuery] string format = "zip", CancellationToken cancellationToken = default)
    {
        try
        {
            var archiveBytes = await _dataPackageService.ExportAsync(format, cancellationToken);
            var normalizedFormat = format.ToLowerInvariant();
            
            var (contentType, fileExtension) = normalizedFormat switch
            {
                "excel" => ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"),
                "7z" => ("application/x-7z-compressed", "7z"),
                _ => ("application/zip", "zip")
            };

            var fileName = $"trench-data-{DateTime.UtcNow:yyyyMMddHHmmss}.{fileExtension}";
            return File(archiveBytes, contentType, fileName);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"Export fehlgeschlagen: {ex.Message}");
        }
    }
}

