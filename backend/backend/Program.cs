using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);

// Startup-Klasse verwenden
var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);

var app = builder.Build();
startup.Configure(app);

app.Run();
