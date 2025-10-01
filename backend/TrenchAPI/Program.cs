using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using TrenchAPI.Persistence;

namespace TrenchAPI
{
    class Program
    {
        static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Port
            builder.WebHost.UseUrls("http://0.0.0.0:5127");

            // Services hinzufügen
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "TrenchAPI", Version = "v3" });

                c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
                {
                    Description = "API Key needed to access endpoints. Use: KEY: your-secret-key",
                    In = ParameterLocation.Header,
                    Name = "KEY",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "ApiKeyScheme"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement {
                    {
                        new OpenApiSecurityScheme {
                            Reference = new OpenApiReference {
                                Type = ReferenceType.SecurityScheme,
                                Id = "ApiKey"
                            }
                        },
                        new List<string>()
                    }
                });
            });

            builder.Services.AddDbContext<WebDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DevConnection")));

            var app = builder.Build();

            // Automatische Migration hinzufügen
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try 
                {
                    var context = services.GetRequiredService<WebDbContext>();
                    
                    Console.WriteLine("Initialisiere Datenbank...");
                    
                    // Check if there are any pending migrations
                    var pendingMigrations = context.Database.GetPendingMigrations().ToList();
                    var appliedMigrations = context.Database.GetAppliedMigrations().ToList();
                    
                    Console.WriteLine($"Pending migrations: {pendingMigrations.Count}");
                    Console.WriteLine($"Applied migrations: {appliedMigrations.Count}");
                    
                    if (pendingMigrations.Any() || appliedMigrations.Any())
                    {
                        // Use migrations if they exist
                        Console.WriteLine("Führe Migrationen aus...");
                        context.Database.Migrate();
                        Console.WriteLine("Migrationen wurden erfolgreich ausgeführt!");
                    }
                    else
                    {
                        // Use EnsureCreated only if no migrations exist
                        Console.WriteLine("Keine Migrationen gefunden, erstelle Datenbank mit EnsureCreated...");
                        context.Database.EnsureCreated();
                        Console.WriteLine("Datenbank wurde mit EnsureCreated erstellt!");
                    }
                    
                    // Überprüfe, welche Tabellen erstellt wurden
                    var tables = context.Model.GetEntityTypes()
                                      .Select(t => t.GetTableName())
                                      .ToList();
                    
                    Console.WriteLine("Vorhandene Tabellen:");
                    foreach(var table in tables)
                    {
                        Console.WriteLine($"- {table}");
                    }
                    
                    // SQL Debug Ausgabe
                    Console.WriteLine("\nSQL Debug - Alle Tabellen in der Datenbank:");
                    context.Database.ExecuteSqlRaw(@"
                        DO
                        $$
                        DECLARE
                            _table record;
                        BEGIN
                            FOR _table IN 
                                SELECT schemaname, tablename 
                                FROM pg_tables 
                                WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
                            LOOP
                                RAISE NOTICE 'Schema: %, Table: %', _table.schemaname, _table.tablename;
                            END LOOP;
                        END
                        $$;");
                    
                    Console.WriteLine("Datenbank-Initialisierung abgeschlossen!");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Ein Fehler ist bei der Datenbank-Aktualisierung aufgetreten: {ex.Message}");
                    Console.WriteLine($"StackTrace: {ex.StackTrace}");
                }
            }

            // Middleware konfigurieren
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors(options =>
            options.WithOrigins("http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader());

            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}
