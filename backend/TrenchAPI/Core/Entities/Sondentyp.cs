using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class SondenTyp : EntityObject
    {
        [Column(TypeName = "varchar")]
        public string Name { get; set; } = "";

        [Column(TypeName = "decimal(8,3)")]
        public decimal Breite { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal Hoehe { get; set; }

        [Column(TypeName = "int")]
        public int Windungszahl { get; set; }

        [Column(TypeName = "varchar")]
        public string Notiz { get; set; } = "";
    }
}
