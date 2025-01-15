using Microsoft.EntityFrameworkCore;
using TrenchAPI.Context;
using TrenchAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// Port
builder.WebHost.UseUrls("http://0.0.0.0:5127");

// Services hinzufügen
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<WebDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DevConnection")));

var app = builder.Build();

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
