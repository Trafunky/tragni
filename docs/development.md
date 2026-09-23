# Development

How to work on this repository locally, and the pitfalls already met once.

## Prerequisites

| Tool | Version | Used for |
|---|---|---|
| .NET SDK | pinned in [`global.json`](../global.json) | API |
| Git | current | — |
| Docker Desktop | current | local PostgreSQL, image builds |
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

A running API answers on `/health/live` and `/health/ready`.

## Frontend

Commands run from the repository root; `--filter web` selects the package.

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
