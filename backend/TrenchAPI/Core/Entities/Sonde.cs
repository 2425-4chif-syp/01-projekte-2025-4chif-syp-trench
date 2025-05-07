using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Sonde : EntityObject
    {
        [Required]
        public int SondenTypID { get; set; }

        [ForeignKey(nameof(SondenTypID))]
        public virtual SondenTyp SondenTyp { get; set; }

        [Column(TypeName = "varchar")]
        public string Name { get; set; } = "";

        [Column(TypeName = "decimal")]
        public decimal Kalibrierungsfaktor { get; set; }
    }
}
