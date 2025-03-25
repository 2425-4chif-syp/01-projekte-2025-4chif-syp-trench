using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class SpuleCreateDto
    {
        public int SpuleID { get; set; }
        public int SpuleTypID { get; set; }
        public decimal Ur { get; set; }
        public int Einheit { get; set; }
        public int Auftragsnummer { get; set; }
        public int AuftragsPosNr { get; set; }
        public decimal Omega { get; set; }
    }
}
