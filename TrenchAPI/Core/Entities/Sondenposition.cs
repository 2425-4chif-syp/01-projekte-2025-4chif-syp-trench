using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    [Table("sondenposition")]
    public class SondenPosition : EntityObject
    {
        [Required]
        [Column("sonde_id", TypeName = "integer")]
        public int sonde_id { get; set; }

        [ForeignKey(nameof(sonde_id))]
        public virtual Sonde? Sonde { get; set; }

        [Required]
        [Column("messeinstellung_id", TypeName = "integer")]
        public int messeinstellung_id { get; set; }

        [ForeignKey(nameof(messeinstellung_id))]
        public virtual Messeinstellung? Messeinstellung { get; set; }

        [Column("schenkel", TypeName = "integer")]
        public int schenkel { get; set; }

        [Column("position", TypeName = "integer")]
        public int position { get; set; }
    }
}
