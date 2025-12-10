using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    [Table("spule")]
    public class Spule : EntityObject
    {
        [ForeignKey(nameof(spuletyp_id))]
        public SpuleTyp? SpuleTyp { get; set; }

        [Column("spuletyp_id", TypeName = "integer")]
        public int spuletyp_id { get; set; }

        [Column("auftragsnr", TypeName = "varchar")]
        public string auftragsnr { get; set; } = "";

        [Column("auftragsposnr", TypeName = "integer")]
        public int auftragsposnr { get; set; }

        [Column("bemessungsspannung", TypeName = "decimal")]
        public decimal bemessungsspannung { get; set; }

        [Column("bemessungsfrequenz", TypeName = "decimal")]
        public decimal bemessungsfrequenz { get; set; }

        [Column("einheit", TypeName = "varchar")]
        public string einheit { get; set; } = "";

        [Column("notiz", TypeName = "varchar")]
        public string notiz { get; set; } = "";
    }
}
