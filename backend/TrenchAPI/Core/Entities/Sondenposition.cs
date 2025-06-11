using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class SondenPosition : EntityObject
    {
        [Required]
        public int MesseinstellungID { get; set; }

        [ForeignKey(nameof(MesseinstellungID))]
        public virtual Messeinstellung Messeinstellung { get; set; }

        //[Required]
        public int? SondeID { get; set; }

        [ForeignKey(nameof(SondeID))]
        public virtual Sonde? Sonde { get; set; }

        [Column(TypeName = "int")]
        public int Schenkel { get; set; }

        [Column(TypeName = "int")]
        public int Position { get; set; }
    }
}
