using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Models;

namespace TrenchAPI.Persistence.DTO
{
    public class SensorCreateDto
    {
        public int SensorID { get; set; }
        public int SensorTypID { get; set; }
        public decimal Durchmesser { get; set; }
        public int Schenkel { get; set; }
        public int Position { get; set; }
    }
}
