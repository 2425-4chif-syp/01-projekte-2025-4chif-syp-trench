using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class MesswertCreateDto : EntityObject
    {
        public int MessungID { get; set; }
        public int SondenPositionID { get; set; }
        public decimal Wert { get; set; }
        public DateTime Zeitpunkt { get; set; }
    }
}