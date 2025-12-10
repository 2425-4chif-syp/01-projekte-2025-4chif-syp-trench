using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class SondenPositionCreateDto : EntityObject
    {
        public int sonde_id { get; set; }
        public int messeinstellung_id { get; set; }
        public int schenkel { get; set; }
        public int position { get; set; }
    }
}
