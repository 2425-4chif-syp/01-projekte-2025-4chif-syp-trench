using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using backend.DBContext;
using backend.Services;
using Microsoft.Extensions.Configuration;
using ConsoleDB.Interface;

var builder = Host.CreateDefaultBuilder(args);

builder.ConfigureServices((context, services) =>
{
    // Datenbank-Konfiguration
    services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(context.Configuration.GetConnectionString("DefaultConnection")));

    // Deine Service-Logik
    services.AddScoped<IAnlageService, AnlageService>();

    // Andere Services wie z.B. BackgroundWorker
    services.AddHostedService<Worker>();  
});

var app = builder.Build();

app.Run();

