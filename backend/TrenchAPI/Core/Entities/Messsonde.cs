using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Messsonde : EntityObject
    {
        [ForeignKey(nameof(MessungID))]
        public Messung? Messung { get; set; }
        public int MessungID { get; set; }

        [Column(TypeName = "int")]
        public int Schenkel { get; set; }

        [Column(TypeName = "VARCHAR(250)")]
        public string Notiz { get; set; } = "";
    }
}