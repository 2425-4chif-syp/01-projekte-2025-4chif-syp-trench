using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class SondeCreateDto : EntityObject
    {
        public int sondentyp_id { get; set; }
        public string name { get; set; } = "";
        public decimal kalibrierungsfaktor { get; set; }
    }
}
