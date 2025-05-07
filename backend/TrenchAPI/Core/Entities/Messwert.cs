using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Messwert : EntityObject
    {
        [Required]
        public int MessungID { get; set; }

        [ForeignKey(nameof(MessungID))]
        public virtual Messung Messung { get; set; }

        [Required]
        public int SondenPositionID { get; set; }

        [ForeignKey(nameof(SondenPositionID))]
        public virtual SondenPosition SondenPosition { get; set; }

        [Column(TypeName = "decimal")]
        public decimal Wert { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime Zeitpunkt { get; set; }
    }
}
