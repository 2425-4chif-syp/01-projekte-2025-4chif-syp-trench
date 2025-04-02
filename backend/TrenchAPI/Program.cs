using Microsoft.EntityFrameworkCore;
using TrenchAPI.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Port
builder.WebHost.UseUrls("http://0.0.0.0:5127");

// Services hinzufügen
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<WebDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DevConnection")));

var app = builder.Build();

// Automatische Migration hinzufügen
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var context = services.GetRequiredService<WebDbContext>();
        
        if (app.Environment.IsDevelopment())
        {
            // Statt die Datenbank zu löschen, löschen wir nur die Tabellen
            //context.Database.ExecuteSqlRaw("DROP TABLE IF EXISTS \"Messeinstellung\" CASCADE");
            //context.Database.ExecuteSqlRaw("DROP TABLE IF EXISTS \"Spule\" CASCADE");
            //context.Database.ExecuteSqlRaw("DROP TABLE IF EXISTS \"SpuleTyp\" CASCADE");
            
            Console.WriteLine("Erstelle Datenbank neu...");
            context.Database.EnsureCreated();
            
            // Überprüfe, welche Tabellen erstellt wurden
            var tables = context.Model.GetEntityTypes()
                              .Select(t => t.GetTableName())
                              .ToList();
            
            Console.WriteLine("Erstellte Tabellen:");
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
            
            Console.WriteLine("Tabellen wurden erfolgreich neu erstellt!");
        }
        else
        {
            context.Database.Migrate();
            Console.WriteLine("Migrationen wurden ausgeführt!");
        }
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
