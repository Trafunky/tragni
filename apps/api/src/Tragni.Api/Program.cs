using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Tragni.Api.Features.Status;
using Microsoft.AspNetCore.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddHealthChecks();
// Slices name their own types `Response` and `Request`. Those names are local to
// a slice but global in the specification, so they are qualified with the name
// of the endpoint class: GetStatus.Response becomes GetStatusResponse.
builder.Services.AddOpenApi(options =>
{
    options.CreateSchemaReferenceId = jsonTypeInfo =>
        jsonTypeInfo.Type.DeclaringType is { } endpoint
            ? $"{endpoint.Name}{jsonTypeInfo.Type.Name}"
            : OpenApiOptions.CreateDefaultSchemaReferenceId(jsonTypeInfo);
});

var app = builder.Build();

// Deliberately runs no checks: a failing dependency must not make Docker
// restart an otherwise healthy process.
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false,
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
});

app.MapGetStatus();

// The specification describes the API to its clients. It is not served in
// production: the generated client is built from the specification during the
// build, so nothing at runtime needs to read it.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Run();
