using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class MesseinstellungCreateDto : EntityObject
    {
        public string name { get; set; } = string.Empty; 
        public int spule_id { get; set; }
        public int sondentyp_id { get; set; }
        public int sonden_pro_schenkel { get; set; }
    }
}