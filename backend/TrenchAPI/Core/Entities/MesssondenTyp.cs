using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class MesssondenTyp : EntityObject
    {
        [Column(TypeName = "int")]
        public int Wicklungszahl { get; set; }

        [Column(TypeName = "decimal(8,1)")]
        public decimal Breite { get; set; }

        [Column(TypeName = "decimal(8,1)")]
        public decimal Hoehe { get; set; }

        [Column(TypeName = "VARCHAR(250)")]
        public string Notiz { get; set; } = "";
    }
}
