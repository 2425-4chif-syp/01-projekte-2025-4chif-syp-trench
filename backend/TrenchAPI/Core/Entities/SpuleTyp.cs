using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class SpuleTyp : EntityObject
    {
        [Column(TypeName = "VARCHAR(100)")]
        public string Name { get; set; } = "";

        [Column(TypeName = "int")]
        public int Schenkel { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public int Bandbreite { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public int Schichthoehe { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public int Durchmesser { get; set; }

        [Column(TypeName = "VARCHAR(250)")]
        public string Notiz { get; set; } = "";
    }
}