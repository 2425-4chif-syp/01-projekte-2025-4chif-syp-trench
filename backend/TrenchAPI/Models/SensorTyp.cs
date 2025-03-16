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
    }
}
