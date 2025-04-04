using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Messung : EntityObject
    {
        [ForeignKey(nameof(MesseinstellungID))]
        public Messeinstellung? Messeinstellung { get; set; }
        public int MesseinstellungID { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime Anfangszeitpunkt { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime Endzeitpunkt { get; set; }

        [Column(TypeName = "VARCHAR(250)")]
        public string Notiz { get; set; } = "";
    }
}