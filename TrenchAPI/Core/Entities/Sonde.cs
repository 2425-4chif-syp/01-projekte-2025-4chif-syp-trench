using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    [Table("sonde")]
    public class Sonde : EntityObject
    {
        [Required]
        [Column("sondentyp_id", TypeName = "integer")]
        public int sondentyp_id { get; set; }

        [ForeignKey(nameof(sondentyp_id))]
        public virtual SondenTyp? SondenTyp { get; set; }

        [Column("name", TypeName = "varchar")]
        public string name { get; set; } = "";

        [Column("kalibrierungsfaktor", TypeName = "decimal")]
        public decimal kalibrierungsfaktor { get; set; }
    }
}
