using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class SpuleCreateDto : EntityObject
    {
        public int spuletyp_id { get; set; }
        public string auftragsnr { get; set; } = "";
        public int auftragsposnr { get; set; }
        public decimal bemessungsspannung { get; set; }
        public decimal bemessungsfrequenz { get; set; }
        public string einheit { get; set; } = "";
    }
}
