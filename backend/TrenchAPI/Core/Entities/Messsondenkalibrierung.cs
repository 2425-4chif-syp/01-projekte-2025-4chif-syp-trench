using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Messsondenkalibrierung : EntityObject
    {
        [ForeignKey(nameof(MesseinstellungID))]
        public Messeinstellung? Messeinstellung { get; set; }
        public int MesseinstellungID { get; set; }

        [Column(TypeName = "int")]
        public int Schenkel { get; set; }

        [Column(TypeName = "int")]
        public int Position { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal Kalibrierungsfaktor { get; set; }
    }
}