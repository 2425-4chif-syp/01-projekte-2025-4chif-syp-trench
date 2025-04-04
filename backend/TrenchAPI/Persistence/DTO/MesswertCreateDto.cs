using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class MesswertCreateDto : EntityObject
    {
        public int MesssondeID { get; set; }

        public int Wert { get; set; }

        public DateTime Zeitpunkt { get; set; }
    }
}
