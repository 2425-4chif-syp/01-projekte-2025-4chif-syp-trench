using backend.Entities;

namespace ConsoleDB.Interface
{
    public interface IAnlageService
    {
        Task<AnlageTyp> GetAnlageById(int id);
    }
}
