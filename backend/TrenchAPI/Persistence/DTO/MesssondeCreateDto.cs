using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class MesssondeCreateDto : EntityObject
    {
        public int MessungID { get; set; }
        public int Schenkel { get; set; }
        public string Notiz { get; set; } = "";
    }
}
