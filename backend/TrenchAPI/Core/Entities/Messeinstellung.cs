using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Messeinstellung : EntityObject
    {
        [Required]
        public int SpuleID { get; set; }

        [ForeignKey(nameof(SpuleID))]
        public virtual Spule Spule { get; set; }

        [Required]
        public int SondenTypID { get; set; }

        [ForeignKey(nameof(SondenTypID))]
        public virtual SondenTyp SondenTyp { get; set; }

        [Column(TypeName = "varchar")]
        public string Name { get; set; } = "";

        [Column(TypeName = "int")]
        public int SondenProSchenkel { get; set; }
    }
}
