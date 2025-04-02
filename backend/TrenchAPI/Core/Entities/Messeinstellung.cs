using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Messeinstellung : EntityObject
    {
        [ForeignKey(nameof(SpuleID))]
        public Spule? Spule { get; set; }

        public int SpuleID { get; set; }

        [ForeignKey(nameof(MesssondenTypID))]
        public MesssondenTyp? MesssondenTyp { get; set; }

        public int MesssondenTypID { get; set; }

        [Column(TypeName = "int")]
        public int Sonden_pro_schenkel {  get; set; }

        public decimal Bemessungsspannung { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal Bemessungsfrequenz { get; set; }

        public decimal Pruefspannung { get; set; }

        public string Notiz { get; set; } = "";
    }
}