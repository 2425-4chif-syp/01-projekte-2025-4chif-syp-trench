using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json;
using System.Text.Json.Serialization;
using TrenchAPI.Persistence;
using TrenchAPI.WebAPI.Services;
using TrenchAPI.WebAPI.Swagger;

namespace TrenchAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Port
            builder.WebHost.UseUrls("http://0.0.0.0:5127");

            // Services hinzufügen
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.WriteIndented = true;
                    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                });
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
                c.OperationFilter<FileUploadOperationFilter>();
            });

            // Register DbContext only if not in test mode (test mode will override this)
            if (!builder.Environment.IsEnvironment("Test"))
            {
                builder.Services.AddDbContext<WebDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DevConnection")));
            }

            builder.Services.AddScoped<DataPackageService>();
            
            // Register MQTT Measurement Service as Singleton
            builder.Services.AddSingleton<MqttMeasurementService>();
            builder.Services.AddHostedService(provider => provider.GetRequiredService<MqttMeasurementService>());

            var app = builder.Build();

            // Automatische Migration hinzufügen
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try 
                {
                    var context = services.GetRequiredService<WebDbContext>();
                    
                    Console.WriteLine("Initialisiere Datenbank...");
                    
                    // Retry-Mechanismus: Warte auf Datenbank-Verfügbarkeit
                    int maxRetries = 10;
                    int retryDelaySeconds = 3;
                    bool dbReady = false;
                    
                    for (int attempt = 1; attempt <= maxRetries; attempt++)
                    {
                        try
                        {
                            Console.WriteLine($"Versuche Datenbankverbindung (Versuch {attempt}/{maxRetries})...");
                            dbReady = context.Database.CanConnect();
                            if (dbReady)
                            {
                                Console.WriteLine("Datenbankverbindung erfolgreich!");
                                break;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Datenbank noch nicht bereit: {ex.Message}");
                            if (attempt < maxRetries)
                            {
                                Console.WriteLine($"Warte {retryDelaySeconds} Sekunden vor dem nächsten Versuch...");
                                Thread.Sleep(retryDelaySeconds * 1000);
                            }
                        }
                    }
                    
                    if (!dbReady)
                    {
                        throw new Exception("Datenbank konnte nach mehreren Versuchen nicht erreicht werden!");
                    }
                    
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

// Make the implicit Program class accessible for testing
public partial class Program { }
