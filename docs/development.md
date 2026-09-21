# Development

How to work on this repository locally, and the pitfalls already met once.

## Prerequisites

| Tool | Version | Used for |
|---|---|---|
| .NET SDK | pinned in [`global.json`](../global.json) | API |
| Git | current | — |
| Docker Desktop | current | local PostgreSQL, image builds |
| Node.js, pnpm | added with the frontend | web, API client |

Any editor works. Formatting rules live in the repository
([`.editorconfig`](../.editorconfig), [`.gitattributes`](../.gitattributes)),
not in IDE settings.

## API

```bash
dotnet build apps/api/Tragni.slnx
dotnet test --solution apps/api/Tragni.slnx
dotnet run --project apps/api/src/Tragni.Api
```

A running API answers on `/health/live` and `/health/ready`.

## Rules the build enforces

| Where | What |
|---|---|
| `apps/api/Directory.Build.props` | Target framework, nullable reference types, analyzers; **warnings are errors** |
| `apps/api/Directory.Packages.props` | Every NuGet version, in one place. `dotnet add package` writes here. A `Version` attribute in a `.csproj` fails the build (NU1008). |
| `.editorconfig` | UTF-8 without BOM, LF, final newline; file-scoped namespaces and no unused `using` directives, enforced in the build |
| `.gitattributes` | LF line endings in the repository and the working tree |

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
