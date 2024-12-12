using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Entities
{
    public class AnlageTyp
    {
        [Key]
        public int Typ_Id { get; set; }
        public double SchenkelZahl { get; set; } 
        public double BandBreite { get; set; }
        public double SchichtHöhe { get; set; }
        public double Toleranz { get; set; }
    }
}
