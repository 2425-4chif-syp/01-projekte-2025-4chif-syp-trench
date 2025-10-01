using Microsoft.AspNetCore.Mvc;
using TrenchAPI.Utils;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpPost("hash")]
    public IActionResult HashPassword([FromBody] string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return BadRequest("Passwort darf nicht leer sein.");

        PasswordHasher.HashPassword(password);
        return Ok("Passwort erfolgreich gehasht.");
    }

[HttpPost("verify")]
public IActionResult VerifyPassword([FromBody] string password)
{
    try
    {
        if (string.IsNullOrWhiteSpace(password))
            return BadRequest("Passwort darf nicht leer sein.");

        string hashedPassword = "$2a$12$8d4c/cTn58Tl3QpamfPWBO1MDl7IoHYPl78K6zPUVdckbJutIMhmy"; 

        bool isValid = PasswordHasher.VerifyPassword(password, hashedPassword);

        if (isValid)
            return Ok(new { isValid = true });
        else
            return Unauthorized(new { isValid = false });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Fehler: {ex.Message}");
        return StatusCode(500, "Interner Serverfehler");
    }
}

}
public class PasswordVerifyRequest
{
    public string Password { get; set; }
    public string HashedPassword { get; set; }
}
