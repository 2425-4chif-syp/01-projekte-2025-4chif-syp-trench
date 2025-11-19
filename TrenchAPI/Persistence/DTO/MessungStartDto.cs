namespace TrenchAPI.Persistence.DTO
{
    public class MessungStartDto
    {
        public int MesseinstellungID { get; set; }
        public string? Name { get; set; }
        public decimal Tauchkernstellung { get; set; }
        public decimal Pruefspannung { get; set; }
        public string? Notiz { get; set; }
    }
}
