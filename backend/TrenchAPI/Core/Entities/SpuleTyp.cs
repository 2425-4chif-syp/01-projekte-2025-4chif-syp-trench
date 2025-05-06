using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class SpuleTyp : EntityObject
    {
        [Column(TypeName = "text")]
        public string Name { get; set; } = "";

        [Column(TypeName = "int")]
        public int Schenkelzahl { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal Bandbreite { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal Schichthoehe { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal Durchmesser { get; set; }

        [Column(TypeName = "int")]
        public int Toleranzbereich { get; set; }

        [Column(TypeName = "text")]
        public string Notiz { get; set; } = "";
    }
}
