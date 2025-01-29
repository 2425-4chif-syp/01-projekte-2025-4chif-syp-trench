using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Models
{
    public class Messeinstellung
    {
        [Key]
        public int MesseinstellungId { get; set; }

        [ForeignKey(nameof(SpuleId))]
        public Spule? Spule { get; set; }

        public int SpuleId { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal bemessungsSpannung { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal bemessungsFrequenz { get; set; }

        [Column(TypeName = "int")]
        public int sondenProSchenkel { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal messStärke { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime zeitstempel { get; set; }
    }
}
