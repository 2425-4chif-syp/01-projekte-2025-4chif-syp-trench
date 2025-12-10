using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class MesswertCreateDto : EntityObject
    {
        public int messung_id { get; set; }
        public int sondenposition_id { get; set; }
        public decimal wert { get; set; }
        public DateTime zeitpunkt { get; set; }
    }
}