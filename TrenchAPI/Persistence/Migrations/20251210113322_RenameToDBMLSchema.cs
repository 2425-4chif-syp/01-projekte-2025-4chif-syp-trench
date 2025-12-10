using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RenameToDBMLSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "sondentyp",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "varchar", nullable: false),
                    breite = table.Column<decimal>(type: "decimal", nullable: false),
                    hoehe = table.Column<decimal>(type: "decimal", nullable: false),
                    windungszahl = table.Column<int>(type: "integer", nullable: false),
                    alpha = table.Column<decimal>(type: "decimal", nullable: false),
                    notiz = table.Column<string>(type: "varchar", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sondentyp", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "spulentyp",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "varchar", nullable: false),
                    schenkelzahl = table.Column<int>(type: "integer", nullable: false),
                    bandbreite = table.Column<decimal>(type: "decimal", nullable: false),
                    schichthoehe = table.Column<decimal>(type: "decimal", nullable: false),
                    durchmesser = table.Column<decimal>(type: "decimal", nullable: false),
                    toleranzbereich = table.Column<decimal>(type: "decimal", nullable: false),
                    notiz = table.Column<string>(type: "varchar", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_spulentyp", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "sonde",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    sondentyp_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "varchar", nullable: false),
                    kalibrierungsfaktor = table.Column<decimal>(type: "decimal", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sonde", x => x.ID);
                    table.ForeignKey(
                        name: "FK_sonde_sondentyp_sondentyp_id",
                        column: x => x.sondentyp_id,
                        principalTable: "sondentyp",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "spule",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    spuletyp_id = table.Column<int>(type: "integer", nullable: false),
                    auftragsnr = table.Column<string>(type: "varchar", nullable: false),
                    auftragsposnr = table.Column<int>(type: "integer", nullable: false),
                    bemessungsspannung = table.Column<decimal>(type: "decimal", nullable: false),
                    bemessungsfrequenz = table.Column<decimal>(type: "decimal", nullable: false),
                    einheit = table.Column<string>(type: "varchar", nullable: false),
                    notiz = table.Column<string>(type: "varchar", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_spule", x => x.ID);
                    table.ForeignKey(
                        name: "FK_spule_spulentyp_spuletyp_id",
                        column: x => x.spuletyp_id,
                        principalTable: "spulentyp",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "messeinstellung",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    spule_id = table.Column<int>(type: "integer", nullable: false),
                    sondentyp_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "varchar", nullable: false),
                    sonden_pro_schenkel = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_messeinstellung", x => x.ID);
                    table.ForeignKey(
                        name: "FK_messeinstellung_sondentyp_sondentyp_id",
                        column: x => x.sondentyp_id,
                        principalTable: "sondentyp",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_messeinstellung_spule_spule_id",
                        column: x => x.spule_id,
                        principalTable: "spule",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "messung",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    messeinstellung_id = table.Column<int>(type: "integer", nullable: false),
                    anfangszeitpunkt = table.Column<DateTime>(type: "timestamp", nullable: false),
                    endzeitpunkt = table.Column<DateTime>(type: "timestamp", nullable: false),
                    name = table.Column<string>(type: "varchar", nullable: false),
                    tauchkernstellung = table.Column<decimal>(type: "decimal", nullable: false),
                    pruefspannung = table.Column<decimal>(type: "decimal", nullable: false),
                    notiz = table.Column<string>(type: "varchar", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_messung", x => x.ID);
                    table.ForeignKey(
                        name: "FK_messung_messeinstellung_messeinstellung_id",
                        column: x => x.messeinstellung_id,
                        principalTable: "messeinstellung",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sondenposition",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    sonde_id = table.Column<int>(type: "integer", nullable: false),
                    messeinstellung_id = table.Column<int>(type: "integer", nullable: false),
                    schenkel = table.Column<int>(type: "integer", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sondenposition", x => x.ID);
                    table.ForeignKey(
                        name: "FK_sondenposition_messeinstellung_messeinstellung_id",
                        column: x => x.messeinstellung_id,
                        principalTable: "messeinstellung",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_sondenposition_sonde_sonde_id",
                        column: x => x.sonde_id,
                        principalTable: "sonde",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "messwert",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    messung_id = table.Column<int>(type: "integer", nullable: false),
                    sondenposition_id = table.Column<int>(type: "integer", nullable: false),
                    wert = table.Column<decimal>(type: "decimal", nullable: false),
                    zeitpunkt = table.Column<DateTime>(type: "timestamp", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_messwert", x => x.ID);
                    table.ForeignKey(
                        name: "FK_messwert_messung_messung_id",
                        column: x => x.messung_id,
                        principalTable: "messung",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_messwert_sondenposition_sondenposition_id",
                        column: x => x.sondenposition_id,
                        principalTable: "sondenposition",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_messeinstellung_sondentyp_id",
                table: "messeinstellung",
                column: "sondentyp_id");

            migrationBuilder.CreateIndex(
                name: "IX_messeinstellung_spule_id",
                table: "messeinstellung",
                column: "spule_id");

            migrationBuilder.CreateIndex(
                name: "IX_messung_messeinstellung_id",
                table: "messung",
                column: "messeinstellung_id");

            migrationBuilder.CreateIndex(
                name: "IX_messwert_messung_id",
                table: "messwert",
                column: "messung_id");

            migrationBuilder.CreateIndex(
                name: "IX_messwert_sondenposition_id",
                table: "messwert",
                column: "sondenposition_id");

            migrationBuilder.CreateIndex(
                name: "IX_sonde_sondentyp_id",
                table: "sonde",
                column: "sondentyp_id");

            migrationBuilder.CreateIndex(
                name: "IX_sondenposition_messeinstellung_id",
                table: "sondenposition",
                column: "messeinstellung_id");

            migrationBuilder.CreateIndex(
                name: "IX_sondenposition_sonde_id",
                table: "sondenposition",
                column: "sonde_id");

            migrationBuilder.CreateIndex(
                name: "IX_spule_spuletyp_id",
                table: "spule",
                column: "spuletyp_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "messwert");

            migrationBuilder.DropTable(
                name: "messung");

            migrationBuilder.DropTable(
                name: "sondenposition");

            migrationBuilder.DropTable(
                name: "messeinstellung");

            migrationBuilder.DropTable(
                name: "sonde");

            migrationBuilder.DropTable(
                name: "spule");

            migrationBuilder.DropTable(
                name: "sondentyp");

            migrationBuilder.DropTable(
                name: "spulentyp");
        }
    }
}
