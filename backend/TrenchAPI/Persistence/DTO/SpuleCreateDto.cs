using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class SpuleCreateDto : EntityObject
    {
        public int SpuleTypID { get; set; }
        public string Auftragsnr { get; set; }
        public int AuftragsPosNr { get; set; }
        public decimal Bemessungsspannung { get; set; }
        public decimal Bemessungsfrequenz { get; set; }
        public int Einheit { get; set; }
    }
}
