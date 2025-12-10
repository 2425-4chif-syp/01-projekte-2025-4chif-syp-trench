using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    [Table("messwert")]
    public class Messwert : EntityObject
    {
        [Required]
        [Column("messung_id", TypeName = "integer")]
        public int messung_id { get; set; }
        
        [ForeignKey(nameof(messung_id))]
        public virtual Messung? Messung { get; set; }
        
        [Required]
        [Column("sondenposition_id", TypeName = "integer")]
        public int sondenposition_id { get; set; }
        
        [ForeignKey(nameof(sondenposition_id))]
        public virtual SondenPosition? SondenPosition { get; set; }
        
        [Column("wert", TypeName = "decimal")]
        public decimal wert { get; set; }
        
        [Column("zeitpunkt", TypeName = "timestamp")]
        public DateTime zeitpunkt { get; set; }
    }
}
