using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Models
{
    public class SpuleTyp
    {
        [Key]
        public int SpuleTypID { get; set; }
        
        [Column(TypeName = "VARCHAR(100)")]
        public string TK_Name { get; set; } = "";

        [Column(TypeName = "int")]
        public int Schenkel { get; set; }

        [Column(TypeName = "int")]
        public int BB { get; set; }

        [Column(TypeName = "int")]
        public int SH { get; set; }

        [Column(TypeName = "int")]
        public int dm { get; set; }
    }
}
