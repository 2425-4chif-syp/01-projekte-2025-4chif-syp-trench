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

        [Required]
        [Column(TypeName = "int")]
        public int Sonden_pro_schenkel {  get; set; }

        [Required]
        [Column(TypeName = "decimal(8,3)")]
        public decimal Bemessungsspannung { get; set; }

        [Required]
        [Column(TypeName = "decimal(8,3)")]
        public decimal Bemessungsfrequenz { get; set; }

        [Column(TypeName = "VARCHAR(250)")]
        public string Notiz { get; set; } = "";
    }
}