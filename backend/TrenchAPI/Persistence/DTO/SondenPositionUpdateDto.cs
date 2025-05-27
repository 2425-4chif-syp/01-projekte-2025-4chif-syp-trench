namespace TrenchAPI.Persistence.DTO 
{ 
    public class SondenPositionUpdateDto 
    { 
        public int ID { get; set; } 
        public int SondeID { get; set; } 
        public int MesseinstellungID { get; set; } 
        public int Position { get; set; } 
        public int Schenkel { get; set; } 
    } 
}