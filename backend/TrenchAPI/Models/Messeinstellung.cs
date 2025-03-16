using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Models
{
    public class Messeinstellung
    {
        [Key]
        [Column(TypeName = "int")]
        public int MesseinstellungID { get; set; }

        [ForeignKey(nameof(GesamtmessungID))]
        public Gesamtmessung? Gesamtmessung { get; set; }

        public int GesamtmessungID { get; set; }

        [Required]
        [Column(TypeName = "decimal(8,3)")]
        public decimal Bemessungsspannung { get; set; }

        [Required]
        [Column(TypeName = "decimal(8,3)")]
        public decimal Bemessungsfrequenz { get; set; }

        [Required]
        [Column(TypeName = "int")]
        public int Sensoren { get; set; }

        [Required]
        [Column(TypeName = "int")]
        public int Toleranz { get; set; }
    }
}
