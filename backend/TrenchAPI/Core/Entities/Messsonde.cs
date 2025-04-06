using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TrenchAPI.Core.Entities
{
    public class Messsonde : EntityObject
    {
        [Required]
        public int MessungID { get; set; }
        
        [ForeignKey("MessungID")]
        [JsonIgnore]
        public virtual Messung Messung { get; set; }
        
        [Required]
        public int Schenkel { get; set; }
        
        [Required]
        public int Position { get; set; }
        
        [Required]
        [Column(TypeName = "jsonb")]
        public string Messwerte { get; set; }
        
        [Required]
        public double Durchschnittswert { get; set; }
    }
}
