using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Spule : EntityObject
    {
        [ForeignKey(nameof(SpuleTypID))]
        public SpuleTyp? SpuleTyp { get; set; }

        public int SpuleTypID { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal Ur { get; set; }

        [Column(TypeName = "int")]
        public int Einheit { get; set; }

        [Column(TypeName = "int")]
        public int Auftragsnummer { get; set; }

        [Column(TypeName = "int")]
        public int AuftragsPosNr { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal Omega { get; set; }

        [Column(TypeName = "VARCHAR(250)")]
        public string Notiz { get; set; } = "";
    }
}