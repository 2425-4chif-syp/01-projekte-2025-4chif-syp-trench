using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Core.Entities
{
    public class Messung : EntityObject
    {
        [Required]
        public int MesseinstellungID { get; set; }
        
        [ForeignKey("MesseinstellungID")]
        public virtual Messeinstellung Messeinstellung { get; set; }
        
        [Required]
        public DateTime Anfangszeitpunkt { get; set; }
        
        [Required]
        public DateTime Endzeitpunkt { get; set; }
        
        public string Notiz { get; set; }
        
        public virtual ICollection<Messsonde> Messsonden { get; set; }
    }
}