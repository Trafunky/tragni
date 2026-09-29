using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Tragni.Infrastructure.Persistence;

namespace Tragni.Infrastructure;

public static class InfrastructureServices
{
    /// <summary>
    /// Registers everything the application needs to reach the outside world.
    /// The API composes this; it never references EF Core itself.
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<TragniDbContext>(options => options.UseNpgsql(connectionString));

        return services;
    }
}
