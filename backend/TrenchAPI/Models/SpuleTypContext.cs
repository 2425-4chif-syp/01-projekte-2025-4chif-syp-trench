using Microsoft.EntityFrameworkCore;

namespace TrenchAPI.Models
{
    public class SpuleTypContext : DbContext
    {
        public SpuleTypContext(DbContextOptions<SpuleTypContext> options) : base(options)
        {

        }

        public DbSet<SpuleTyp> SpuleTyp { get; set; }
    }
}
