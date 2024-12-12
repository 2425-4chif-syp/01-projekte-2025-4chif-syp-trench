using backend.DBContext;
using backend.Entities;
using ConsoleDB.Interface;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AnlageService : IAnlageService
    {
        private readonly AppDbContext _context;

        public AnlageService(AppDbContext context)
        {
            _context = context;
        }

        // Methode, um einen bestimmten AnlageTyp anhand der Typ_Id zu erhalten
        public async Task<AnlageTyp> GetAnlageById(int id)
        {
            return await _context.AnlageTyp.FirstOrDefaultAsync(a => a.Typ_Id == id);
        }
    }
}