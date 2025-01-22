using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TrenchAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Spule");

            migrationBuilder.DropTable(
                name: "SpuleTyp");
        }
    }
}
