using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence
{
    public class WebDbContext : DbContext
    {
        public WebDbContext(DbContextOptions<WebDbContext> options) : base(options)
        {
        }

        public DbSet<Messeinstellung> Messeinstellung { get; set; }
        public DbSet<Messung> Messung { get; set; }
        public DbSet<Messwert> Messwert { get; set; }

        public DbSet<Sonde> Sonde { get; set; }
        public DbSet<SondenPosition> SondenPosition { get; set; }
        public DbSet<SondenTyp> SondenTyp { get; set; }

        public DbSet<Spule> Spule { get; set; }
        public DbSet<SpuleTyp> SpuleTyp { get; set; }

        public void onModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Spule>()
                .Ignore(s => s.SpuleTyp);
        }
    }
}
