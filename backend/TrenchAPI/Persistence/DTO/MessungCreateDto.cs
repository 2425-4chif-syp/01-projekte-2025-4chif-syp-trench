﻿using System.ComponentModel.DataAnnotations.Schema;
using TrenchAPI.Core.Entities;

namespace TrenchAPI.Persistence.DTO
{
    public class MessungCreateDto : EntityObject
    {
        public int MesseinstellungID { get; set; }
        public DateTime Anfangszeitpunkt { get; set; }
        public DateTime Endzeitpunkt { get; set; }
        public string Notiz { get; set; } = "";
    }
}
