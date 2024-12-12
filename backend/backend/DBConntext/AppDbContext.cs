using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.DBConntext
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSets für Tabellen hinzufügen:
      /*public DbSet<SpulenTyp> SpulenTyp { get; set; }
        public DbSet<Spule> Spule { get; set; }
        public DbSet<Messeinstellung> Messeinstellung { get; set; }
        public DbSet<Sensordaten> Sensordaten { get; set; }
        public DbSet<Sensortyp> Sensortyp { get; set; }*/
    }
}
