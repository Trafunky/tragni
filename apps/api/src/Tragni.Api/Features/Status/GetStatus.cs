namespace Tragni.Api.Features.Status;

internal static class GetStatus
{
    internal static IEndpointRouteBuilder MapGetStatus(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/status", (TimeProvider clock) => new Response("ok", clock.GetUtcNow()))
            .WithName("GetStatus")
            .WithSummary("Reports that the API is reachable, and the time it currently holds.");

        return app;
    }

    internal sealed record Response(string Status, DateTimeOffset ServerTime);
}
