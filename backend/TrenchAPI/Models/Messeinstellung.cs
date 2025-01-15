
namespace TrenchAPI.Models
{
    public class Messeinstellung
    {
        [Key]
        public int MesssondendatenID { get; set; }

        [ForeignKey(nameof(SpuleID))]
        public Spule? Spule { get; set; }

        public int SpuleID { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal bemessungsSpannung { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal bemessungsFrequenz { get; set; }

        [Column(TypeName = "int")]
        public int sondenProSchenkel { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal messStärke { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime zeitstempel { get; set; }
    }
}
