using TrenchAPI.Core.Contracts;

namespace TrenchAPI.Core.Contracts
{
    public interface IGenericRepository<T> where T : class, IEntityObject
    {
        Task<T?> GetByIdAsync(int id);
        Task<T[]> GetAllAsync();
        Task<int> GetCountAsync();
        Task AddAsync(T entity);
        Task AddRangeAsync(T[] entities);
        void Update(T entity);
        void Delete(T entity);
    }
}