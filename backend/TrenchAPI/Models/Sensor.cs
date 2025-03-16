using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Models
{
    public class Sensor
    {
        [Required]
        [Key]
        public int SensorID { get; set; }

        [Required]
        [ForeignKey(nameof(SensorTypID))]
        public SensorTyp? SensorTyp { get; set; }

        public int SensorTypID { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal Durchmesser { get; set; }

        [Column(TypeName = "int")]
        public int Schenkel { get; set; }

        [Column(TypeName = "int")]
        public int Position { get; set; }
    }
}
