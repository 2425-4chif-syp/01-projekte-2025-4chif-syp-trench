using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TrenchAPI.Migrations
{
    /// <inheritdoc />
    public partial class FirstMigration : Migration
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Spule");
        }
    }
}
