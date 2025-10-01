using Npgsql;
using System;
using System.Threading.Tasks;

namespace ConsoleFillDb
{
    public class TestConnection
    {
        public static async Task TestDatabaseConnectionAsync()
        {
            var connectionString = "Host=localhost; Port=5432; Database=postgres; Username=postgres; Password=TRENCH123;";
            
            try
            {
                using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync();
                Console.WriteLine("✓ Database connection successful!");
                
                using var command = new NpgsqlCommand("SELECT version()", connection);
                var result = await command.ExecuteScalarAsync();
                Console.WriteLine($"PostgreSQL Version: {result}");
                
                // Test if we can create a simple table
                using var createCommand = new NpgsqlCommand(@"
                    CREATE TABLE IF NOT EXISTS test_table (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100)
                    )", connection);
                await createCommand.ExecuteNonQueryAsync();
                Console.WriteLine("✓ Table creation test successful!");
                
                // Clean up test table
                using var dropCommand = new NpgsqlCommand("DROP TABLE IF EXISTS test_table", connection);
                await dropCommand.ExecuteNonQueryAsync();
                Console.WriteLine("✓ Table cleanup successful!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Database connection failed: {ex.Message}");
                throw;
            }
        }
    }
}