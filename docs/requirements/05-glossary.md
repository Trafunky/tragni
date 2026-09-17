# 05 — Glossary (Ubiquitous Language)

These terms are used **identically** in documentation, code, database and user
interface. Where a German term appears, it is the wording shown in the German
interface; the English term is the one used in code.

| Term | Code | Meaning |
|---|---|---|
| **Platform** | — | The tragni.ch system itself: frontend, API, database, infrastructure. Not the projects shown on it. |
| **Project** | `Project` | A catalogue entry. May be an application, a tool or a technical article. The unit everything revolves around. |
| **Slug** | `Slug` | URL-safe identifier of a project. Unique, changeable, with history. |
| **Slug history** | `SlugHistory` | Previous slugs of a project. The basis for 301 redirects. |
| **Draft** | `Draft` | State: created, not publicly visible. |
| **Published** | `Published` | State: publicly visible, in the overview and the sitemap. |
| **Retired** | `Retired` | State: was published, no longer is. The URL returns 410. |
| **Deleted** | `DeletedAt` | Soft delete. Nowhere visible, but recoverable until the cleanup routine runs. |
| **Featured** | `IsFeatured` | Appears at the top of the overview. |
| **Technology** | `Technology` | Shared taxonomy used for filtering (e.g. "C#", "Docker"). |
| **Media** | `Media` | An uploaded file with its generated variants and alt text. |
| **Demo** | `Demo` | A running container belonging to a project, reachable under its own path. A black box from the platform's point of view. |
| **Demo contract** | — | What a demo must provide: an image in the registry, HTTP on a defined port, a health endpoint, a routing target, resource limits. |
| **User** | `User` | A durable identity of external origin (`Provider` + `ExternalId`) with a role. |
| **Participant** | — | A transient identity **inside** a project (e.g. room code plus nickname). Never a `User`, never stored by the platform. |
| **Contributor** | `Contributor` | Role: may manage their own projects, not the platform. |
| **Token exchange** | — | The platform issuing a short-lived signed token for a specific project. The project only verifies the signature. |
| **Base stack** | — | Proxy, frontend, API, database, collector. Everything except demos. The basis of the resource budget (Q10). |
| **Walking skeleton** | — | The thinnest end-to-end path: browser → frontend → API → database, built in CI, deployed, with TLS and a health check. Built before the first feature. |

## Terms deliberately avoided

| Do not use | Use instead | Why |
|---|---|---|
| "blog", "blog post" | project of type article | Not a separate feature (see scope) |
| "post", "article" as an entity | `Project` | One entity, one model |
| "GitHubId" | `ExternalId` + `Provider` | The provider is replaceable |
| "admin area" as a role | role `Admin`, area `/admin` | A role and a place are different things |
| "player" | participant | Applies to all demos, not only games |
