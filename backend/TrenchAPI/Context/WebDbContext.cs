using Microsoft.EntityFrameworkCore;
using TrenchAPI.Models;

namespace TrenchAPI.Context
{
    public class WebDbContext : DbContext
    {
        public WebDbContext(DbContextOptions<WebDbContext> options) : base(options)
        {
        }

        public DbSet<Spule> Spule { get; set; }
        public DbSet<SpuleTyp> SpuleTyp { get; set; }
        public DbSet<Messeinstellung> Messeinstellung { get; set; }
        public DbSet<Sensormessung> Sensormessung { get; set; }
        public DbSet<Gesamtmessung> Gesamtmessung { get; set; }
        public DbSet<Sensor> Sensor { get; set; }

        public void onModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Spule>()
                .Ignore(s => s.SpuleTyp);
        }
    }
}
