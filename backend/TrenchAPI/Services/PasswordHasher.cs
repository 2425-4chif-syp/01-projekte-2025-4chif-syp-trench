using BCrypt.Net;

public class PasswordHasher
{
    public static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public static bool VerifyPassword(string password, string hashedPassword)
    {
        return hashedPassword is not null && BCrypt.Net.BCrypt.Verify(password, hashedPassword)
    }
}
