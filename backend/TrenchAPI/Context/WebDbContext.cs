﻿using Microsoft.EntityFrameworkCore;
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
    }
}
