using System.Net;
using System.Net.Http.Json;

namespace Tragni.Api.IntegrationTests.Status;

[Collection(ApiCollectionDefinition.Name)]
public sealed class StatusEndpointTests(ApiFactory factory)
{
    [Fact]
    public async Task ReportsOk()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(new Uri("/api/status", UriKind.Relative), cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var status = await response.Content.ReadFromJsonAsync<StatusPayload>(cancellationToken);

        Assert.NotNull(status);
        Assert.Equal("ok", status.Status);
        Assert.NotEqual(default, status.ServerTime);
    }

    private sealed record StatusPayload(string Status, DateTimeOffset ServerTime);
}
