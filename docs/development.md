# Development

How to work on this repository locally, and the pitfalls already met once.

## Prerequisites

| Tool | Version | Used for |
|---|---|---|
| .NET SDK | pinned in [`global.json`](../global.json) | API |
| Git | current | — |
| Docker Desktop | current | local PostgreSQL, integration tests, image builds |
| Node.js | 24 or newer (`engines` in `package.json`) | web, API client |
| pnpm | pinned via `packageManager` in `package.json` | workspace, installs |

Any editor works. Formatting rules live in the repository
([`.editorconfig`](../.editorconfig), [`.gitattributes`](../.gitattributes)),
not in IDE settings.

## API

```bash
dotnet build apps/api/Tragni.slnx
dotnet test --solution apps/api/Tragni.slnx
dotnet run --project apps/api/src/Tragni.Api
```

The OpenAPI specification is **not** written on every build, because generating
it starts the application. Regenerate it deliberately after changing an endpoint:

```powershell
$env:ConnectionStrings__Database = "Host=not-used"
dotnet build apps/api/src/Tragni.Api -p:OpenApiGenerateDocumentsOnBuild=true
Remove-Item Env:\ConnectionStrings__Database
```

The connection string is never used: the generator starts the application only to
read its endpoints. The result, `apps/api/openapi/Tragni.Api.json`, is committed,
so the frontend generates its types without .NET being installed.

A running API answers on `/health/live` and `/health/ready`.

## Database

PostgreSQL runs in a container, for development only:

```bash
docker compose -f deploy/docker-compose.dev.yml up -d     # start
docker compose -f deploy/docker-compose.dev.yml down      # stop, keep the data
docker compose -f deploy/docker-compose.dev.yml down -v   # stop and delete the data
```

The credentials sit in the compose file on purpose: the port is bound to the
loopback interface and the data is throwaway. The server keeps its own in
`/opt/tragni/secrets`, never in this repository.

Migrations use the tools pinned in `.config/dotnet-tools.json`
(`dotnet tool restore` once):

```bash
dotnet ef migrations add <Name> --project apps/api/src/Tragni.Infrastructure --startup-project apps/api/src/Tragni.Api --output-dir Persistence/Migrations
dotnet ef database update --project apps/api/src/Tragni.Infrastructure --startup-project apps/api/src/Tragni.Api
```

**Migrations are never applied on application startup** ([ADR-0009](adr/0009-ef-core-for-data-access.md)).
Applying them is a step of its own, here and later in the pipeline.

`/health/ready` reports the database: it answers 503 while PostgreSQL is down,
and `/health/live` keeps answering 200 — the process is fine, its dependency is
not.

The API integration tests do **not** use this database. They start a PostgreSQL
container of their own and apply the migrations to it, so a test run does not
depend on what is running on the machine. Docker has to be available; this
container does not.

## Containers

The whole stack can run locally the way it runs on the server:

```bash
docker compose -f deploy/docker-compose.dev.yml --profile apps up -d --build
docker compose -f deploy/docker-compose.dev.yml --profile apps ps
docker compose -f deploy/docker-compose.dev.yml --profile apps down
```

Without `--profile apps`, only PostgreSQL starts. That is the everyday case: the
applications then run from the IDE against it.

The API image is built from `apps/api`. The frontend image is built from the
repository root, because it needs the workspace, the lock file and the committed
OpenAPI specification — the frontend container is built without .NET being
involved.

Both images are multi-stage: the build stage carries the SDK and the sources,
the runtime stage only the result. Neither ships a compiler or source code.

## Frontend

Commands run from the repository root; `--filter web` selects the package.

Copy `apps/web/.env.example` to `apps/web/.env.local` before the first start.
The development server reads it at startup, so a change needs a restart.

```bash
pnpm install                         # once, and after pulling changes
pnpm --filter web dev                # development server on :3000
pnpm --filter web build              # production build, as CI runs it
pnpm --filter web lint
pnpm --filter web exec tsc --noEmit  # type check only
```

`pnpm install` is a workspace-wide install: one `pnpm-lock.yaml` in the root
covers every package. A second lock file inside `apps/web` is a mistake and gets
deleted ([ADR-0011](adr/0011-pnpm-as-package-manager.md)).

## API client

`packages/api-client` turns the OpenAPI specification into TypeScript types.

```bash
pnpm --filter @tragni/api-client generate    # after changing the API
pnpm --filter @tragni/api-client typecheck
```

`generate` also runs automatically on `pnpm install`. The generated
`src/schema.d.ts` is not committed — the specification is the source, and one
source is enough ([ADR-0013](adr/0013-openapi-typescript-for-the-generated-client.md)).

After changing an endpoint the full chain is:

```powershell
# Windows / PowerShell
$env:ConnectionStrings__Database = "Host=not-used"
dotnet build apps/api/src/Tragni.Api -p:OpenApiGenerateDocumentsOnBuild=true
Remove-Item Env:\ConnectionStrings__Database
```

```bash
# Linux, macOS, and the pipeline
ConnectionStrings__Database="Host=not-used" dotnet build apps/api/src/Tragni.Api -p:OpenApiGenerateDocumentsOnBuild=true
```

Then, in both cases:

```bash
pnpm --filter @tragni/api-client generate  # regenerate the types
pnpm --filter web exec tsc --noEmit        # fails if the frontend still uses the old shape
```

## Rules the build enforces

| Where | What |
|---|---|
| `apps/api/Directory.Build.props` | Target framework, nullable reference types, analyzers; **warnings are errors** |
| `apps/api/Directory.Packages.props` | Every NuGet version, in one place. `dotnet add package` writes here. A `Version` attribute in a `.csproj` fails the build (NU1008). |
| `.editorconfig` | UTF-8 without BOM, LF, final newline; file-scoped namespaces and no unused `using` directives, enforced in the build |
| `.gitattributes` | LF line endings in the repository and the working tree |
| `apps/web/tsconfig.json` | `strict` plus `noUncheckedIndexedAccess`, `noUnusedLocals` and `noUnusedParameters`. The production build fails on a type error or unused code. |
| `pnpm-workspace.yaml` | Packages may not run install scripts unless listed under `allowBuilds` |

## Troubleshooting

### `dotnet test` fails: "Testing with VSTest target is no longer supported"

Tests run on Microsoft Testing Platform, opted in via `global.json`. The
solution is passed with `--solution`, not as a positional argument:

```bash
dotnet test --solution apps/api/Tragni.slnx
```

### Windows: "An application control policy has blocked this file" (0x800711C7)

Windows Smart App Control blocks freshly built assemblies because they are
unsigned and have no reputation. It does not affect every build, which makes it
look random. Check whether it is active:

```powershell
Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy' | Select-Object VerifiedAndReputablePolicyState
```

`1` means enforcing. There is no per-folder exclusion; turning it off is the
usual choice on a development machine.

### Windows PowerShell 5 writes a BOM

`Set-Content -Encoding utf8` in Windows PowerShell 5 prepends a byte order mark,
which some tools reject in JSON files. PowerShell 7 does not. To strip it from an
existing file:

```powershell
$p = "$PWD\path\to\file"; [IO.File]::WriteAllText($p, [IO.File]::ReadAllText($p))
```

### Git output ends in `(END)` and the terminal no longer responds

Long output opens in a pager. `q` quits it; `git --no-pager <command>` avoids it.

### `ERR_PNPM_IGNORED_BUILDS` during install

pnpm blocks install scripts by default, because a compromised package could run
arbitrary code during `pnpm install`. Check what the package is and why it needs
a script, then allow it explicitly in `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  unrs-resolver: true
```

### Hydration mismatch on `<html>` in development

If the reported difference is an attribute such as `data-lt-installed` or
`suppresshydrationwarning`, a browser extension modified the page before React
took over. Confirm in a private window, where extensions are disabled. This is
not fixed with `suppressHydrationWarning` — that would hide real mismatches too.

### ESLint reports version 9 as no longer supported

Deliberate. `eslint-config-next` depends on plugins that do not yet declare
support for ESLint 10, so the warning is accepted until they do.

### `openapi-typescript` fails with `Cannot read properties of undefined`

TypeScript 7 does not yet provide the compiler API that `openapi-typescript`
uses to emit types. The repository stays on TypeScript 5; check that no package
was installed with `typescript@latest`.

### `API_BASE_URL is not configured.`

`apps/web/.env.local` is missing or the development server was started before it
existed. Copy it from `.env.example` and restart.

### The `postgres` container restarts in a loop

From version 18 the official image stores data in a version-specific
subdirectory. The volume belongs at `/var/lib/postgresql`, not at
`/var/lib/postgresql/data`. The log says so, at length.

### A style rule such as `IDE0161` fails on a file under `Migrations/`

EF Core writes those files. `.editorconfig` marks `**/Migrations/*.cs` as
generated code so analyzers skip them; our rules apply to what we write.

### An integration test connects to the wrong database

Configuration wins by rank, not by call order: environment variables rank above
`appsettings.*.json`. `ConfigureAppConfiguration` inside `WebApplicationFactory`
runs *before* those files, so values set there are overwritten. The test fixture
therefore sets `ConnectionStrings__Database` as an environment variable, and it
does so before the host is built.

### A container build fails with `NETSDK1064: Package … was not found`

`bin/` and `obj/` from the host were copied into the image and overwrote the
restore that ran inside it — they contain Windows paths. Patterns in
`.dockerignore` match one level only: `**/obj` is needed, not `obj`.
