using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class MesseinstellungCreateDto : EntityObject
    {
        public int SpuleID { get; set; }
        public int MesssondenTypID { get; set; }
        public int Sonden_pro_schenkel { get; set; }
        public decimal Bemessungsspannung { get; set; }
        public decimal Bemessungsfrequenz { get; set; }
        public decimal Pruefspannung { get; set; }
        public string Notiz { get; set; } = "";
    }
}
