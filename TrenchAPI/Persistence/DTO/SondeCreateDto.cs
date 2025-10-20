using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class SondeCreateDto : EntityObject
    {
        public int SondenTypID { get; set; }
        public string Name { get; set; } = "";
        public decimal Kalibrierungsfaktor { get; set; }
    }
}
