using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Messwert : EntityObject
    {
        [ForeignKey(nameof(MesssondeID))]
        public Messsonde? Messsonde { get; set; }
        public int MesssondeID { get; set; }

        [Column(TypeName = "decimal(8,2)")]
        public int Wert { get; set; }

        [Column(TypeName = "timestamp")]
        public DateTime Zeitpunkt { get; set; }
    }
}