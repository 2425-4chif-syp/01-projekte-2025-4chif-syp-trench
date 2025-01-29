using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TrenchAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Spule",
                columns: table => new
                {
                    SpuleID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SpuleTypId = table.Column<int>(type: "integer", nullable: false),
                    Ur = table.Column<decimal>(type: "numeric(8,3)", nullable: false),
                    Einheit = table.Column<int>(type: "int", nullable: false),
                    Auftragsnummer = table.Column<int>(type: "int", nullable: false),
                    AuftragsPosNr = table.Column<int>(type: "int", nullable: false),
                    omega = table.Column<decimal>(type: "numeric(8,5)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Spule", x => x.SpuleID);
                });

            migrationBuilder.CreateTable(
                name: "SpuleTyp",
                columns: table => new
                {
                    SpuleTypId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TK_Name = table.Column<string>(type: "VARCHAR(100)", nullable: false),
                    Schenkel = table.Column<int>(type: "int", nullable: false),
                    BB = table.Column<int>(type: "int", nullable: false),
                    SH = table.Column<int>(type: "int", nullable: false),
                    dm = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpuleTyp", x => x.SpuleTypId);
                });

            migrationBuilder.CreateTable(
                name: "Messeinstellung",
                columns: table => new
                {
                    MesseinstellungId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SpuleId = table.Column<int>(type: "integer", nullable: false),
                    bemessungsSpannung = table.Column<decimal>(type: "numeric(8,3)", nullable: false),
                    bemessungsFrequenz = table.Column<decimal>(type: "numeric(8,3)", nullable: false),
                    sondenProSchenkel = table.Column<int>(type: "int", nullable: false),
                    messStärke = table.Column<decimal>(type: "numeric(8,3)", nullable: false),
                    zeitstempel = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messeinstellung", x => x.MesseinstellungId);
                    table.ForeignKey(
                        name: "FK_Messeinstellung_Spule_SpuleId",
                        column: x => x.SpuleId,
                        principalTable: "Spule",
                        principalColumn: "SpuleID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Messeinstellung_SpuleId",
                table: "Messeinstellung",
                column: "SpuleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Messeinstellung");

            migrationBuilder.DropTable(
                name: "SpuleTyp");

            migrationBuilder.DropTable(
                name: "Spule");
        }
    }
}
