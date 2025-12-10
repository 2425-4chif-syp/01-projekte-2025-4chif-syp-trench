using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    [Table("spulentyp")]
    public class SpuleTyp : EntityObject
    {
        [Column("name", TypeName = "varchar")]
        public string name { get; set; } = "";

        [Column("schenkelzahl", TypeName = "integer")]
        public int schenkelzahl { get; set; }

        [Column("bandbreite", TypeName = "decimal")]
        public decimal bandbreite { get; set; }

        [Column("schichthoehe", TypeName = "decimal")]
        public decimal schichthoehe { get; set; }

        [Column("durchmesser", TypeName = "decimal")]
        public decimal durchmesser { get; set; }

        [Column("toleranzbereich", TypeName = "decimal")]
        public decimal toleranzbereich { get; set; }

        [Column("notiz", TypeName = "varchar")]
        public string notiz { get; set; } = "";
    }
}
