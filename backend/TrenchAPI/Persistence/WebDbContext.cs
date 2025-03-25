using Microsoft.EntityFrameworkCore;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence
{
    public class WebDbContext : DbContext
    {
        public WebDbContext(DbContextOptions<WebDbContext> options) : base(options)
        {
        }

        public DbSet<Spule> Spule { get; set; }
        public DbSet<SpuleTyp> SpuleTyp { get; set; }
        public DbSet<Messeinstellung> Messeinstellung { get; set; }
        public DbSet<MesssondenTyp> MesssondenTyp { get; set; }

        public void onModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Spule>()
                .Ignore(s => s.SpuleTyp);
        }
    }
}
