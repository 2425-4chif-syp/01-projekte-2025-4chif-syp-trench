using NuGet.Packaging.Signing;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Sensormessung
    {
        [Key]
        [Column(TypeName = "int")]
        public int SensormessungID { get; set; }

        [ForeignKey(nameof(GesamtmessungID))]
        public Gesamtmessung? Gesamtmessung { get; set; }

        public int GesamtmessungID { get; set; }

        [ForeignKey(nameof(SensorId))]
        public Sensor? Sensor { get; set; }

        public int SensorId { get; set; }

        [Required]
        [Column(TypeName = "decimal(8,3)")]
        public decimal Wert { get; set; }

        [Required]
        [Column(TypeName = "timestamp")]
        public DateTime Zeit { get; set; }
    }
}
