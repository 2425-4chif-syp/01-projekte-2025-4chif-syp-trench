using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Models
{
    public class Spule
    {
        [Required]
        [Key]
        public int SpuleId { get; set; }

<<<<<<< Updated upstream
        [ForeignKey(nameof(SpuleTypID))]
        public SpuleTyp? SpuleTyp { get; set; }
=======
        [Required]
        [ForeignKey(nameof(SpuleTypId))]
        public SpuleTyp? SpuleTyp { get; set; }
        public int SpuleTypId { get; set; }
>>>>>>> Stashed changes

        public int SpuleTypID { get; set; }
        
        [Column(TypeName = "decimal(8,3)")]
        public decimal Ur { get; set; }

        [Column(TypeName = "int")]
        public int Einheit { get; set; }

        [Column(TypeName = "int")]
        public int Auftragsnummer { get; set; }

        [Column(TypeName = "int")]
        public int AuftragsPosNr { get; set; }

        [Column(TypeName = "decimal(8,5)")]
        public decimal omega { get; set; }
    }
}
