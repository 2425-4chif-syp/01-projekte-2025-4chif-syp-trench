using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Models
{
    public class Gesamtmessung
    {
        [Key]
        [Column(TypeName = "int")]
        public int GesamtmessungID { get; set; }

        [ForeignKey(nameof(SpuleID))]
        public Spule? Spule { get; set; }

        public int SpuleID { get; set; }

        [Required]
        [Column(TypeName = "decimal(8,3)")]
        public decimal GesamtVektor { get; set; }

        [Required]
        [Column(TypeName = "timestamp")]
        public DateTime Zeit { get; set; }
    }
}
