using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    [Table("sondentyp")]
    public class SondenTyp : EntityObject
    {
        [Column("name", TypeName = "varchar")]
        public string name { get; set; } = "";

        [Column("breite", TypeName = "decimal")]
        public decimal breite { get; set; }

        [Column("hoehe", TypeName = "decimal")]
        public decimal hoehe { get; set; }

        [Column("windungszahl", TypeName = "integer")]
        public int windungszahl { get; set; }

        [Column("alpha", TypeName = "decimal")]
        public decimal alpha { get; set; }

        [Column("notiz", TypeName = "varchar")]
        public string notiz { get; set; } = "";
    }
}
