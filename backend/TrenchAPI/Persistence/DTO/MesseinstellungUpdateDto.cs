using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class MesseinstellungUpdateDto : EntityObject
    {
        public int SpuleID { get; set; }

        public int SondenTypID { get; set; }

        public int SondenProSchenkel { get; set; }

        public string Name { get; set; } = "";
    }
}