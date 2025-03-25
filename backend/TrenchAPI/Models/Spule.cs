using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Models
{
    public class Spule
    {
        [Required]
        [Key]
        public int ID { get; set; }

        [ForeignKey(nameof(SpuleTypID))]
        public SpuleTyp? SpuleTyp { get; set; }

        public int SpuleTypID { get; set; }
        
        [Column(TypeName = "decimal(8,3)")]
        public decimal Ur { get; set; }

        [Column(TypeName = "int")]
        public int Einheit { get; set; }

        [Column(TypeName = "int")]
        public int Auftragsnummer { get; set; }

        [Column(TypeName = "int")]
        public int AuftragsPosNr { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal omega { get; set; }
    }
}

/*
 Table spule {
  id integer [primary key]
  spuletyp_id integer [not null, ref: > spuletyp.id]
  auftragsnr varchar
  auftragsposnr integer
  ur decimal
  einheit integer
  omega decimal
  notiz string
}*/