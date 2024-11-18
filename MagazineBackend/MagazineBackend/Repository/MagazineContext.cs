using MagazineBackend.Domain;
using Microsoft.EntityFrameworkCore;

namespace MagazineBackend.Repository;

public class MagazineContext : DbContext
{
    public MagazineContext() { }
    
    public MagazineContext(DbContextOptions<MagazineContext> options) : base(options) { }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Magazine> Magazines { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).ValueGeneratedNever();

            e.HasMany<Magazine>(u => u.Magazines)
                .WithOne(m => m.User)
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Magazine>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.Id).ValueGeneratedOnAdd();
        
            e.Property(m => m.PageUrls)
                .HasColumnType("jsonb") 
                .IsRequired();

            e.HasIndex(m => m.UserId);
        });
    }
}