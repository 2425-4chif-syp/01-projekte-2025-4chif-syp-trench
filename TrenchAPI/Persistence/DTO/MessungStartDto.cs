namespace TrenchAPI.Persistence.DTO
{
    public class MessungStartDto
    {
        public int messeinstellung_id { get; set; }
        public string? name { get; set; }
        public decimal tauchkernstellung { get; set; }
        public decimal pruefspannung { get; set; }
        public string? notiz { get; set; }
    }
}
