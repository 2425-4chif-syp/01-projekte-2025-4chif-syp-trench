using ConsoleDB.Interface;

public class Worker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public Worker(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using (var scope = _serviceProvider.CreateScope()) 
        {
            var service = scope.ServiceProvider.GetRequiredService<IAnlageService>();
        }
    }
}