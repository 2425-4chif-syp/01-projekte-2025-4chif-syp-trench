namespace TrenchAPI.Persistence.DTO 
{ 
    public class SondenPositionUpdateDto 
    { 
        public int id { get; set; } 
        public int sonde_id { get; set; } 
        public int messeinstellung_id { get; set; } 
        public int position { get; set; } 
        public int schenkel { get; set; } 
    } 
}