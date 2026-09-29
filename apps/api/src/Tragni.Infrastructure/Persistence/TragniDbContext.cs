using Microsoft.EntityFrameworkCore;

namespace Tragni.Infrastructure.Persistence;

public sealed class TragniDbContext(DbContextOptions<TragniDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Entity configurations live next to their entities and are picked up
        // from this assembly, so adding one never means editing this file.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TragniDbContext).Assembly);
    }
}
