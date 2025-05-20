using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Messstatus
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int MesseinstellungID { get; set; }

        [ForeignKey(nameof(MesseinstellungID))]
        public virtual Messeinstellung Messeinstellung { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime Startzeitpunkt { get; set; }

        [Column(TypeName = "varchar")]
        public string Notiz { get; set; } = "";

        [Column(TypeName = "boolean")]
        public bool IsActive { get; set; }
    }
} 