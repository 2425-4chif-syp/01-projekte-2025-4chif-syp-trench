using TrenchAPI.Core.Entities;

namespace TrenchAPI.Core.Contracts
{
    public interface IMesseinstellungRepository : IGenericRepository<Messeinstellung>
    {
    }

    public interface IMessungRepository : IGenericRepository<Messung>
    {
    }

    public interface IMesswertRepository : IGenericRepository<Messwert>
    {
    }

    public interface ISondeRepository : IGenericRepository<Sonde>
    {
    }

    public interface ISondenPositionRepository : IGenericRepository<SondenPosition>
    {
    }

    public interface ISondenTypRepository : IGenericRepository<SondenTyp>
    {
    }

    public interface ISpuleRepository : IGenericRepository<Spule>
    {
    }

    public interface ISpuleTypRepository : IGenericRepository<SpuleTyp>
    {
    }
}