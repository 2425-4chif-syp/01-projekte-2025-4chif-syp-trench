using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigrate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SondenTyp",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "varchar", nullable: false),
                    Breite = table.Column<decimal>(type: "decimal", nullable: false),
                    Hoehe = table.Column<decimal>(type: "decimal", nullable: false),
                    Windungszahl = table.Column<int>(type: "int", nullable: false),
                    Alpha = table.Column<decimal>(type: "decimal", nullable: false),
                    Notiz = table.Column<string>(type: "varchar", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SondenTyp", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "SpuleTyp",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Schenkelzahl = table.Column<int>(type: "int", nullable: false),
                    Bandbreite = table.Column<decimal>(type: "decimal", nullable: false),
                    Schichthoehe = table.Column<decimal>(type: "decimal", nullable: false),
                    Durchmesser = table.Column<decimal>(type: "decimal", nullable: false),
                    Toleranzbereich = table.Column<decimal>(type: "decimal", nullable: false),
                    Notiz = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpuleTyp", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Sonde",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SondenTypID = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "varchar", nullable: false),
                    Kalibrierungsfaktor = table.Column<decimal>(type: "decimal", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sonde", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Sonde_SondenTyp_SondenTypID",
                        column: x => x.SondenTypID,
                        principalTable: "SondenTyp",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Spule",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SpuleTypID = table.Column<int>(type: "integer", nullable: false),
                    Auftragsnr = table.Column<string>(type: "varchar", nullable: false),
                    AuftragsPosNr = table.Column<string>(type: "varchar", nullable: false),
                    Bemessungsspannung = table.Column<decimal>(type: "decimal", nullable: false),
                    Bemessungsfrequenz = table.Column<decimal>(type: "decimal", nullable: false),
                    Einheit = table.Column<string>(type: "varchar", nullable: false),
                    Notiz = table.Column<string>(type: "varchar", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Spule", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Spule_SpuleTyp_SpuleTypID",
                        column: x => x.SpuleTypID,
                        principalTable: "SpuleTyp",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Messeinstellung",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SpuleID = table.Column<int>(type: "integer", nullable: false),
                    SondenTypID = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "varchar", nullable: false),
                    SondenProSchenkel = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messeinstellung", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Messeinstellung_SondenTyp_SondenTypID",
                        column: x => x.SondenTypID,
                        principalTable: "SondenTyp",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Messeinstellung_Spule_SpuleID",
                        column: x => x.SpuleID,
                        principalTable: "Spule",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Messung",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MesseinstellungID = table.Column<int>(type: "integer", nullable: false),
                    Anfangszeitpunkt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Endzeitpunkt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "varchar", nullable: false),
                    Tauchkernstellung = table.Column<decimal>(type: "decimal", nullable: false),
                    Pruefspannung = table.Column<decimal>(type: "decimal", nullable: false),
                    Notiz = table.Column<string>(type: "varchar", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messung", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Messung_Messeinstellung_MesseinstellungID",
                        column: x => x.MesseinstellungID,
                        principalTable: "Messeinstellung",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SondenPosition",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MesseinstellungID = table.Column<int>(type: "integer", nullable: false),
                    SondeID = table.Column<int>(type: "integer", nullable: true),
                    Schenkel = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SondenPosition", x => x.ID);
                    table.ForeignKey(
                        name: "FK_SondenPosition_Messeinstellung_MesseinstellungID",
                        column: x => x.MesseinstellungID,
                        principalTable: "Messeinstellung",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SondenPosition_Sonde_SondeID",
                        column: x => x.SondeID,
                        principalTable: "Sonde",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Messwert",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MessungID = table.Column<int>(type: "integer", nullable: false),
                    SondenPositionID = table.Column<int>(type: "integer", nullable: false),
                    Wert = table.Column<decimal>(type: "decimal", nullable: false),
                    Zeitpunkt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messwert", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Messwert_Messung_MessungID",
                        column: x => x.MessungID,
                        principalTable: "Messung",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Messwert_SondenPosition_SondenPositionID",
                        column: x => x.SondenPositionID,
                        principalTable: "SondenPosition",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Messeinstellung_SondenTypID",
                table: "Messeinstellung",
                column: "SondenTypID");

            migrationBuilder.CreateIndex(
                name: "IX_Messeinstellung_SpuleID",
                table: "Messeinstellung",
                column: "SpuleID");

            migrationBuilder.CreateIndex(
                name: "IX_Messung_MesseinstellungID",
                table: "Messung",
                column: "MesseinstellungID");

            migrationBuilder.CreateIndex(
                name: "IX_Messwert_MessungID",
                table: "Messwert",
                column: "MessungID");

            migrationBuilder.CreateIndex(
                name: "IX_Messwert_SondenPositionID",
                table: "Messwert",
                column: "SondenPositionID");

            migrationBuilder.CreateIndex(
                name: "IX_Sonde_SondenTypID",
                table: "Sonde",
                column: "SondenTypID");

            migrationBuilder.CreateIndex(
                name: "IX_SondenPosition_MesseinstellungID",
                table: "SondenPosition",
                column: "MesseinstellungID");

            migrationBuilder.CreateIndex(
                name: "IX_SondenPosition_SondeID",
                table: "SondenPosition",
                column: "SondeID");

            migrationBuilder.CreateIndex(
                name: "IX_Spule_SpuleTypID",
                table: "Spule",
                column: "SpuleTypID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Messwert");

            migrationBuilder.DropTable(
                name: "Messung");

            migrationBuilder.DropTable(
                name: "SondenPosition");

            migrationBuilder.DropTable(
                name: "Messeinstellung");

            migrationBuilder.DropTable(
                name: "Sonde");

            migrationBuilder.DropTable(
                name: "Spule");

            migrationBuilder.DropTable(
                name: "SondenTyp");

            migrationBuilder.DropTable(
                name: "SpuleTyp");
        }
    }
}
