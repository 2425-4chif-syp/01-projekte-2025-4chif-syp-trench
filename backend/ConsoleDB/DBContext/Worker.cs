using ConsoleDB.Interface;
using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Threading.Tasks;

namespace backend.Services
{
    public class Worker : BackgroundService
    {
        private readonly IAnlageService _anlageService;

        public Worker(IAnlageService anlageService)
        {
            _anlageService = anlageService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var anlage = await _anlageService.GetAnlageById(1);
            Console.WriteLine($"Anlage gefunden: {anlage.Typ_Id}");
        }
    }
}
