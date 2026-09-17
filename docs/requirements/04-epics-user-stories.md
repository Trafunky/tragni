# 04 — Epics & User Stories

Acceptance criteria use Given/When/Then. They define done, not how it is built.
Each story is cut so that it fits into one or two working blocks of a few hours.

---

## E1 — Project catalogue

### PK-01 · Project overview

> As a **visitor** I want to see all published projects at a glance, so I can
> quickly judge what has been built.

- **Given** published projects exist, **when** I open `/` or `/projects`,
  **then** I see title, summary, preview image and the technologies used for
  each project.
- **Given** a project is marked as a draft, **when** I open the overview,
  **then** it does not appear — not even if I know the URL.
- **Given** no published project exists, **when** I open the page, **then** I
  see a designed empty state.
- **Given** a mobile device on a 4G profile, **when** the page loads, **then**
  LCP is below 2.0 s. *(Q1)*

### PK-02 · Filter by technology

> As a **tech lead** I want to filter by technology, so I can see whether there
> is experience with my stack.

- **Given** projects with different technologies, **when** I select one,
  **then** I see only matching projects and the filter is reflected in the URL
  (`?tech=csharp`).
- **Given** a filtered URL, **when** someone opens it, **then** the same filter
  is active.
- **Given** a filter combination with no results, **when** I select it, **then**
  I see a message with a way to reset.
- **Given** JavaScript is disabled, **when** I open the overview, **then** the
  projects are still visible. *(Q4, Q5)*

### PK-03 · Project detail

> As a **visitor** I want to read a project in detail, so I understand the
> context, the decisions and the outcome.

- **Given** a published project, **when** I open it, **then** I see the full
  content, images, tech stack and time period at `/projects/<slug>`.
- **Given** the content contains code blocks, **when** the page renders,
  **then** they have syntax highlighting.
- **Given** an unknown slug, **when** I request it, **then** I get HTTP 404 with
  a designed error page.
- **Given** the slug was changed later, **when** someone requests the old URL,
  **then** they are redirected to the new one with a 301.

> The last criterion requires slug history in the data model.

### PK-04 · Reach source code and demo

> As a **developer** I want to jump straight to the repository, so I can judge
> the code.

- **Given** a project has a GitHub URL, **when** I view the detail page,
  **then** the link is prominent and opens in a new tab with `rel="noopener"`.
- **Given** a project has no demo URL, **when** the page renders, **then** no
  dead demo button appears.
- **Given** a project has a demo URL, **when** I click it, **then** I land on
  the running demo. *(applies from Epic 6)*

### PK-05 · Shareability

> As a **recruiter** I want to share a project link without a bare URL showing
> up.

- **Given** a project page, **when** a service loads the preview, **then** the
  page provides Open Graph title, description and image.
- **Given** the site is live, **when** a crawler reads it, **then**
  `sitemap.xml`, `robots.txt` and structured data exist. *(Q4)*

---

## E2 — Content management

### CV-01 · Sign in

> As the **admin** I want to sign in securely, so I can manage content.

- **Given** I am not signed in, **when** I open `/admin`, **then** I am
  redirected to the login.
- **Given** I sign in through the external identity provider, **when** the flow
  succeeds, **then** the backend sets an HttpOnly, Secure, SameSite cookie; no
  token is reachable from browser JavaScript.
- **Given** my external identity is not mapped to a role, **when** I sign in,
  **then** I get 403 and no access.
- **Given** an expired session, **when** I perform an action, **then** I get 401
  and am taken to the login without losing my draft.
- **Given** repeated failed attempts, **when** the threshold is exceeded,
  **then** rate limiting applies.
- **Given** the API container restarts, **when** I then perform an action,
  **then** my session is still valid (persisted data protection keys).
- **Given** a write request, **when** no valid antiforgery token is sent,
  **then** it is rejected.

### CV-02 · Create a project as a draft

> As the **admin** I want to create and save a project without publishing it
> immediately.

- **Given** I am signed in, **when** I save a project with a title and a
  description, **then** it is stored as a draft and is not publicly visible.
- **Given** I enter a title, **when** I supply no slug, **then** one is
  suggested and I can override it.
- **Given** a slug that is already taken, **when** I save, **then** I get a
  comprehensible error message rather than a 500.
- **Given** invalid input, **when** I save, **then** frontend and backend
  validate independently of each other.

### CV-03 · Upload images

> As the **admin** I want to upload screenshots without optimising them by hand
> first.

- **Given** I upload a JPEG or PNG, **when** the upload completes, **then**
  optimised variants exist (WebP/AVIF, several widths).
- **Given** a file over the limit or of the wrong type, **when** I select it,
  **then** it is rejected — checked by actual content, not by file extension.
- **Given** an uploaded image, **when** I embed it, **then** alt text is
  mandatory. *(Q5)*
- **Given** an image is no longer referenced, **when** the cleanup routine runs,
  **then** it is removed.

### CV-04 · Publish and retire

> As the **admin** I want to decide myself when a project becomes visible.

- **Given** a finished draft, **when** I publish it, **then** it is publicly
  visible within a minute (ISR revalidation). *(Q14)*
- **Given** a published project, **when** I retire it, **then** the URL returns
  410 and it disappears from the overview and the sitemap.
- **Given** a draft, **when** I generate a signed preview URL, **then** I can
  show it to someone without publishing.
- **Given** I delete a project, **when** the action is confirmed, **then** it is
  marked as deleted (soft delete) and is nowhere visible; permanent deletion
  happens only through a deliberate cleanup routine.

### CV-05 · Control ordering

> As the **admin** I want to decide which projects appear first.

- **Given** several projects, **when** I mark one as featured, **then** it
  appears at the top of the overview.
- **Given** no manual ordering, **when** the overview loads, **then** the
  default order is comprehensible (most recent first).

### CV-06 · Author content

> As the **admin** I want to write project content in Markdown and see the
> result before publishing.

- **Given** the editor, **when** I type Markdown, **then** I see a live preview
  rendered as the published page will look.
- **Given** Markdown with embedded HTML, **when** it is rendered, **then** it is
  sanitised; injected script does not execute.
- **Given** an uploaded image, **when** I insert it in the editor, **then** the
  correct reference is written without me knowing any paths.

> No WYSIWYG. A rich text editor is a project of its own with a failure class of
> its own; there is exactly one author, and that author knows Markdown.

---

## Architectural provisions from later epics

Not built in the MVP, but provided for now because they would be expensive to
retrofit:

- **User entity** with `ExternalId` + `Provider` (not "GitHubId"), `Role` and
  `CreatedAt`. In the MVP it holds exactly one record.
- **Role model** `Anonymous` / `User` / `Contributor` / `Admin`, implemented
  through policies (`RequireAuthorization("CanManageProjects")`), never through
  role comparisons in code.
- **Resource-based authorisation** as an existing entry point
  (`IAuthorizationHandler`), even though the implementation is trivial at first.
- **Self-registration** on first sign-in is a deliberate act and can be switched
  off with a flag.
- **Token exchange:** on request, the platform issues short-lived signed tokens
  for a specific project; the project only verifies the signature. No cookie
  sharing across subdomains, no shared database access.
- **Cookie scope** restricted tightly to the main domain, so demo subdomains
  never see the admin cookie.
