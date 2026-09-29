using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;
using Tragni.Infrastructure.Persistence;

namespace Tragni.Api.IntegrationTests;

/// <summary>
/// Starts the API against a PostgreSQL container of its own, so a test run does
/// not depend on what happens to be running on the machine.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer database = new PostgreSqlBuilder("postgres:18-alpine")
        .Build();

    public async ValueTask InitializeAsync()
    {
        await database.StartAsync(TestContext.Current.CancellationToken);

        // Environment variables rank above appsettings.*.json, which is also how
        // the connection string reaches the application in production.
        Environment.SetEnvironmentVariable("ConnectionStrings__Database", database.GetConnectionString());

        // Applied here for the same reason they are a separate step in
        // production: never by the application itself (ADR-0009).
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<TragniDbContext>();
        await context.Database.MigrateAsync(TestContext.Current.CancellationToken);
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        await database.DisposeAsync();

        Environment.SetEnvironmentVariable("ConnectionStrings__Database", null);
    }
}
