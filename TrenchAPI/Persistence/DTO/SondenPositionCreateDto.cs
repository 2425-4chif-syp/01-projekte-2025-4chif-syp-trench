using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class SondenPositionCreateDto : EntityObject
    {
        public int MesseinstellungID { get; set; }
        public int? SondeID { get; set; }
        public int Schenkel { get; set; }
        public int Position { get; set; }
    }
}
