namespace TrenchAPI.Core.Contracts
{
    public interface IUnitOfWork : IAsyncDisposable, IDisposable
    {
        IMesseinstellungRepository MesseinstellungRepository { get; }
        IMessungRepository MessungRepository { get; }
        IMesswertRepository MesswertRepository { get; }
        ISondeRepository SondeRepository { get; }
        ISondenPositionRepository SondenPositionRepository { get; }
        ISondenTypRepository SondenTypRepository { get; }
        ISpuleRepository SpuleRepository { get; }
        ISpuleTypRepository SpuleTypRepository { get; }

        Task<int> SaveChangesAsync();
        Task CreateDatabaseAsync();
        Task FillDbAsync();
    }
}