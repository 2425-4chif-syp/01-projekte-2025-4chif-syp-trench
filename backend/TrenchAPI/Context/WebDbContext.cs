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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Spule>().ToTable("Spule");
            modelBuilder.Entity<SpuleTyp>().ToTable("SpuleTyp");
            modelBuilder.Entity<Messeinstellung>().ToTable("Messeinstellung");

            modelBuilder.Entity<Messeinstellung>()
                .HasOne(m => m.Spule)
                .WithMany()
                .HasForeignKey(m => m.SpuleId);
        }
    }
}
