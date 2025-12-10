using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class MessungCreateDto : EntityObject
    {
        public int messeinstellung_id { get; set; }
        public DateTime anfangszeitpunkt { get; set; }
        public DateTime endzeitpunkt { get; set; }
        public string name { get; set; } = "";
        public decimal tauchkernstellung { get; set; }
        public decimal pruefspannung { get; set; }
        public string notiz { get; set; } = "";
    }
}