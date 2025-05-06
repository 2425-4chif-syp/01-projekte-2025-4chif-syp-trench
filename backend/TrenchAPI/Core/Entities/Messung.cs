using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Messung : EntityObject
    {
        [Required]
        public int MesseinstellungID { get; set; }

        [ForeignKey(nameof(MesseinstellungID))]
        public virtual Messeinstellung Messeinstellung { get; set; }

        [Column(TypeName = "timestamp")]
        public DateTime Anfangszeitpunkt { get; set; }

        [Column(TypeName = "timestamp")]
        public DateTime Endzeitpunkt { get; set; }

        [Column(TypeName = "varchar")]
        public string Name { get; set; } = "";

        [Column(TypeName = "decimal(8,3)")]
        public decimal Tauchkernstellung { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal Pruefspannung { get; set; }

        [Column(TypeName = "varchar")]
        public string Notiz { get; set; } = "";
    }
}
