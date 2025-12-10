using Microsoft.EntityFrameworkCore;
using TrenchAPI.Core.Contracts;

namespace TrenchAPI.Persistence
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class, IEntityObject
    {
        protected readonly WebDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public GenericRepository(WebDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<T[]> GetAllAsync()
        {
            return await _dbSet.ToArrayAsync();
        }

        public async Task<int> GetCountAsync()
        {
            return await _dbSet.CountAsync();
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public async Task AddRangeAsync(T[] entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        public void Update(T entity)
        {
            _dbSet.Update(entity);
        }

        public void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }
    }
}