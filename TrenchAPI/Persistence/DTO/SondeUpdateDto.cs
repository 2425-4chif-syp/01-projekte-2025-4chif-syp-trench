using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class SondeUpdateDto
{
    public int id { get; set; }

    public int sondentyp_id { get; set; }

    public string name { get; set; } = "";

    public decimal kalibrierungsfaktor { get; set; }
}
}