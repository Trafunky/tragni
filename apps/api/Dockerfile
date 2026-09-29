# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Only the project files first: this layer stays cached until a dependency
# actually changes, so a code change does not re-download every package (Q7).
COPY Directory.Build.props Directory.Packages.props ./
COPY src/Tragni.Domain/Tragni.Domain.csproj src/Tragni.Domain/
COPY src/Tragni.Infrastructure/Tragni.Infrastructure.csproj src/Tragni.Infrastructure/
COPY src/Tragni.Api/Tragni.Api.csproj src/Tragni.Api/
RUN dotnet restore src/Tragni.Api/Tragni.Api.csproj

COPY src/ src/
RUN dotnet publish src/Tragni.Api/Tragni.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# The images ship a non-root user; running as root inside a container is one
# barrier fewer between a compromised process and the host.
USER $APP_UID

EXPOSE 8080
ENTRYPOINT ["dotnet", "Tragni.Api.dll"]
