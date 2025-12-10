using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    [Table("messung")]
    public class Messung : EntityObject
    {
        [Required]
        [Column("messeinstellung_id", TypeName = "integer")]
        public int messeinstellung_id { get; set; }

        [ForeignKey(nameof(messeinstellung_id))]
        public virtual Messeinstellung? Messeinstellung { get; set; }

        [Column("anfangszeitpunkt", TypeName = "timestamp")]
        public DateTime anfangszeitpunkt { get; set; }

        [Column("endzeitpunkt", TypeName = "timestamp")]
        public DateTime endzeitpunkt { get; set; }

        [Column("name", TypeName = "varchar")]
        public string name { get; set; } = "";

        [Column("tauchkernstellung", TypeName = "decimal")]
        public decimal tauchkernstellung { get; set; }

        [Column("pruefspannung", TypeName = "decimal")]
        public decimal pruefspannung { get; set; }

        [Column("notiz", TypeName = "varchar")]
        public string notiz { get; set; } = "";
    }
}
