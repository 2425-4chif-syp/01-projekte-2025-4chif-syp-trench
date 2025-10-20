using TrenchAPI.Core.Contracts;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence
{
    public class MesseinstellungRepository : GenericRepository<Messeinstellung>, IMesseinstellungRepository
    {
        public MesseinstellungRepository(WebDbContext context) : base(context)
        {
        }
    }

    public class MessungRepository : GenericRepository<Messung>, IMessungRepository
    {
        public MessungRepository(WebDbContext context) : base(context)
        {
        }
    }

    public class MesswertRepository : GenericRepository<Messwert>, IMesswertRepository
    {
        public MesswertRepository(WebDbContext context) : base(context)
        {
        }
    }

    public class SondeRepository : GenericRepository<Sonde>, ISondeRepository
    {
        public SondeRepository(WebDbContext context) : base(context)
        {
        }
    }

    public class SondenPositionRepository : GenericRepository<SondenPosition>, ISondenPositionRepository
    {
        public SondenPositionRepository(WebDbContext context) : base(context)
        {
        }
    }

    public class SondenTypRepository : GenericRepository<SondenTyp>, ISondenTypRepository
    {
        public SondenTypRepository(WebDbContext context) : base(context)
        {
        }
    }

    public class SpuleRepository : GenericRepository<Spule>, ISpuleRepository
    {
        public SpuleRepository(WebDbContext context) : base(context)
        {
        }
    }

    public class SpuleTypRepository : GenericRepository<SpuleTyp>, ISpuleTypRepository
    {
        public SpuleTypRepository(WebDbContext context) : base(context)
        {
        }
    }
}