/*using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence
{
    public class WebDbContext : DbContext
    {
        private readonly IConfiguration? _configuration;

        public WebDbContext()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            _configuration = builder.Build();
        }

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

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                if (_configuration != null)
                {
                    optionsBuilder.UseNpgsql(_configuration.GetConnectionString("DefaultConnection") ?? 
                                           _configuration.GetConnectionString("DevConnection"));
                }
                else
                {
                    optionsBuilder.UseNpgsql("Host=localhost;Database=TrenchData;Username=postgres;Password=postgres");
                }
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure relationships and any special mappings here
            modelBuilder.Entity<Messeinstellung>()
                .HasOne(m => m.Spule)
                .WithMany()
                .HasForeignKey(m => m.SpuleID);

            modelBuilder.Entity<Messeinstellung>()
                .HasOne(m => m.SondenTyp)
                .WithMany()
                .HasForeignKey(m => m.SondenTypID);

            modelBuilder.Entity<Messung>()
                .HasOne(m => m.Messeinstellung)
                .WithMany()
                .HasForeignKey(m => m.MesseinstellungID);

            modelBuilder.Entity<Messwert>()
                .HasOne(m => m.Messung)
                .WithMany()
                .HasForeignKey(m => m.MessungID);

            modelBuilder.Entity<Messwert>()
                .HasOne(m => m.SondenPosition)
                .WithMany()
                .HasForeignKey(m => m.SondenPositionID);

            modelBuilder.Entity<Sonde>()
                .HasOne(s => s.SondenTyp)
                .WithMany()
                .HasForeignKey(s => s.SondenTypID);

            modelBuilder.Entity<SondenPosition>()
                .HasOne(sp => sp.Messeinstellung)
                .WithMany()
                .HasForeignKey(sp => sp.MesseinstellungID);

            modelBuilder.Entity<SondenPosition>()
                .HasOne(sp => sp.Sonde)
                .WithMany()
                .HasForeignKey(sp => sp.SondeID);

            modelBuilder.Entity<Spule>()
                .HasOne(s => s.SpuleTyp)
                .WithMany()
                .HasForeignKey(s => s.SpuleTypID);
        }
    }
}*/