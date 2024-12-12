using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.DBContext
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSets für Tabellen definieren
        public DbSet<AnlageTyp> AnlageTyp { get; set; }
    }
}
