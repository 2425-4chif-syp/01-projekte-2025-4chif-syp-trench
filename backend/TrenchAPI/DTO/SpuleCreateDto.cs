using TrenchAPI.Models;

namespace TrenchAPI.DTO
{
    public class SpuleCreateDto
    {
        public int SpuleId { get; set; }
        public int SpuleTypId { get; set; }
        public decimal Ur { get; set; }
        public int Einheit { get; set; }
        public int Auftragsnummer { get; set; }
        public int AuftragsPosNr { get; set; }
        public decimal omega { get; set; }
    }
}
