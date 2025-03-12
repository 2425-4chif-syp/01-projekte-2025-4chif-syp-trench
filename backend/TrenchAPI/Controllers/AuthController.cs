using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpPost("hash")]
    public IActionResult HashPassword([FromBody] string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return BadRequest("Passwort darf nicht leer sein.");

        string hashedPassword = PasswordHasher.HashPassword(password);
        return Ok(new { hashedPassword });
    }

    [HttpPost("verify")]
    public IActionResult VerifyPassword([FromBody] PasswordVerifyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.HashedPassword))
            return BadRequest("Daten ungültig.");

        bool isValid = PasswordHasher.VerifyPassword(request.Password, request.HashedPassword);
        return Ok(new { isValid });
    }
}

public class PasswordVerifyRequest
{
    public string Password { get; set; }
    public string HashedPassword { get; set; }
}
