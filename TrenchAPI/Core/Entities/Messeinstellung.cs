using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    [Table("messeinstellung")]
    public class Messeinstellung : EntityObject
    {
        [Required]
        [Column("spule_id", TypeName = "integer")]
        public int spule_id { get; set; }

        [ForeignKey(nameof(spule_id))]
        public virtual Spule? Spule { get; set; }

        [Required]
        [Column("sondentyp_id", TypeName = "integer")]
        public int sondentyp_id { get; set; }

        [ForeignKey(nameof(sondentyp_id))]
        public virtual SondenTyp? SondenTyp { get; set; }

        [Column("name", TypeName = "varchar")]
        public string name { get; set; } = "";

        [Column("sonden_pro_schenkel", TypeName = "integer")]
        public int sonden_pro_schenkel { get; set; }
    }
}
