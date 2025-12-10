using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class MesseinstellungUpdateDto : EntityObject
    {
        public int spule_id { get; set; }

        public int sondentyp_id { get; set; }

        public int sonden_pro_schenkel { get; set; }

        public string name { get; set; } = "";
    }
}