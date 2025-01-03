﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using TrenchAPI.Models;

#nullable disable

namespace TrenchAPI.Migrations.SpuleTyp
{
    [DbContext(typeof(SpuleTypContext))]
    [Migration("20250103211201_First Migration")]
    partial class FirstMigration
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("TrenchAPI.Models.SpuleTyp", b =>
                {
                    b.Property<int>("SpulenTypId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("SpulenTypId"));

                    b.Property<int>("BB")
                        .HasColumnType("int");

                    b.Property<int>("SH")
                        .HasColumnType("int");

                    b.Property<int>("Schenkel")
                        .HasColumnType("int");

                    b.Property<string>("TK_Name")
                        .IsRequired()
                        .HasColumnType("VARCHAR(100)");

                    b.Property<int>("dm")
                        .HasColumnType("int");

                    b.HasKey("SpulenTypId");

                    b.ToTable("SpuleTyp");
                });
#pragma warning restore 612, 618
        }
    }
}
