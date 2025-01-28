﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using TrenchAPI.Context;

#nullable disable

namespace TrenchAPI.Migrations
{
    [DbContext(typeof(WebDbContext))]
    partial class WebDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("TrenchAPI.Models.Spule", b =>
                {
                    b.Property<int>("SpuleID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("SpuleID"));

                    b.Property<int>("AuftragsPosNr")
                        .HasColumnType("int");

                    b.Property<int>("Auftragsnummer")
                        .HasColumnType("int");

                    b.Property<int>("Einheit")
                        .HasColumnType("int");

                    b.Property<int>("SpuleTypID")
                        .HasColumnType("integer");

                    b.Property<decimal>("Ur")
                        .HasColumnType("decimal(8,3)");

                    b.Property<decimal>("omega")
                        .HasColumnType("decimal(8,5)");

                    b.HasKey("SpuleID");

                    b.HasIndex("SpuleTypID");

                    b.ToTable("Spule");
                });

            modelBuilder.Entity("TrenchAPI.Models.SpuleTyp", b =>
                {
                    b.Property<int>("SpuleTypID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("SpuleTypID"));

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

                    b.HasKey("SpuleTypID");

                    b.ToTable("SpuleTyp");
                });

            modelBuilder.Entity("TrenchAPI.Models.Spule", b =>
                {
                    b.HasOne("TrenchAPI.Models.SpuleTyp", "SpuleTyp")
                        .WithMany()
                        .HasForeignKey("SpuleTypID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("SpuleTyp");
                });
#pragma warning restore 612, 618
        }
    }
}
