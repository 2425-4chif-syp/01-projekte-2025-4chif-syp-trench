using System;
using System.Collections.Generic;

namespace TrenchAPI.Persistence.DTO
{
    public class CompleteMessungDto
    {
        public int MesseinstellungID { get; set; }
        public DateTime Anfangszeitpunkt { get; set; }
        public DateTime Endzeitpunkt { get; set; }
        public string Notiz { get; set; } = "";
        public List<MesssondeDto> Messsonden { get; set; } = new List<MesssondeDto>();
    }

    public class MesssondeDto
    {
        public int Schenkel { get; set; }
        public int Position { get; set; }
        public List<double> Messwerte { get; set; } = new List<double>();
        public double Durchschnittswert { get; set; }
    }
} 