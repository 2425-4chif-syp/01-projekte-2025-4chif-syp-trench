﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrenchAPI.Models
{
    public class Spule
    {
    [Key]
    public int SpuleID { get; set; }

    [Column(TypeName = "int")]
    public int SpulenTypId { get; set; }

    [ForeignKey(nameof(SpulenTypId))]
    public SpuleTyp? SpulenTyp { get; set; } 

    [Column(TypeName = "decimal(8,3)")]
    public decimal Ur { get; set; }

    [Column(TypeName = "int")]
    public int Einheit { get; set; }

    [Column(TypeName = "int")]
    public int Auftragsnummer { get; set; }

    [Column(TypeName = "int")]
    public int AuftragsPosNr { get; set; }

    [Column(TypeName = "decimal(8,5)")]
    public decimal omega { get; set; }
    }
}
