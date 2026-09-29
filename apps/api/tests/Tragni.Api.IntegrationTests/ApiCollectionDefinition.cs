namespace Tragni.Api.IntegrationTests;

/// <summary>
/// One container for all integration tests: starting one per test class would
/// multiply the startup cost for no gain.
/// </summary>
[CollectionDefinition(Name)]
public sealed class ApiCollectionDefinition : ICollectionFixture<ApiFactory>
{
    public const string Name = "api";
}
