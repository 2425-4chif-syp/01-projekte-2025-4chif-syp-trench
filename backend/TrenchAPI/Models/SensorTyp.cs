using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Models
{
    public class SensorTyp
    {
        [Required]
        [Key]
        public int SensorTypID { get; set; }

        [Column(TypeName = "int")]
        public int Wicklungszahl { get; set; }

        [Column(TypeName = "decimal(8,1)")]
        public decimal Breite { get; set; }

        [Column(TypeName = "decimal(8,1)")]
        public decimal Hoehe { get; set; }
    }
}
