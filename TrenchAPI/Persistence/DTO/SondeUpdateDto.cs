using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class SondeUpdateDto
{
    public int ID { get; set; }

    public int SondenTypID { get; set; }

    public string Name { get; set; } = "";

    public decimal Kalibrierungsfaktor { get; set; }
}
}