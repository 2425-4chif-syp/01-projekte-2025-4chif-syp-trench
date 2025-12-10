using System;
using System.Collections.Generic;

namespace TrenchAPI.Persistence.DTO
{
    public class CompleteMessungDto
    {
        public int messeinstellung_id { get; set; }
        public DateTime anfangszeitpunkt { get; set; }
        public DateTime endzeitpunkt { get; set; }
        public string notiz { get; set; } = "";
        public List<MesssondeDto> Messsonden { get; set; } = new List<MesssondeDto>();
    }

    public class MesssondeDto
    {
        public int schenkel { get; set; }
        public int position { get; set; }
        public List<double> Messwerte { get; set; } = new List<double>();
        public double Durchschnittswert { get; set; }
    }
} 