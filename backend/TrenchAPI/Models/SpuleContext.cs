using Microsoft.EntityFrameworkCore;

namespace TrenchAPI.Models
{
    public class SpuleContext : DbContext
    {
        public SpuleContext(DbContextOptions<SpuleContext> options) : base(options)
        {

        }

        public DbSet<Spule> Spule { get; set; }
    }
}
