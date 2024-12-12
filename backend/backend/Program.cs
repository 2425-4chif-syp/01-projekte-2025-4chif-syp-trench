using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using backend.DBContext;
using backend.Services;
using ConsoleDB.Interface;
using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args); 

// Registriere die Services (Controller, Datenbank, Worker)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAnlageService, AnlageService>();

// Registrierung des Workers für Hintergrundprozesse
builder.Services.AddHostedService<Worker>();

// Registriere die Controllers für die API
builder.Services.AddControllers(); 

var app = builder.Build();

// Middleware für Routing und Endpoints
app.UseRouting();  

app.MapControllers();  

app.Run();
