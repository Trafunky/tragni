# Contributing & Conventions

This repository is developed by one person. The conventions are written down
anyway: they are the agreement with a future self returning after weeks away,
and they make the history readable to anyone else.

## Language

Everything in this repository is written in **English** — code, commit messages,
branch names, issues, pull requests, documentation and ADRs.

The website itself ships in German and English as a product feature. That is a
separate concern from the language of the repository.

## Branches

```
main              always deployable, protected
feat/<name>       new functionality
fix/<name>        bug fix
chore/<name>      cleanup, dependencies, configuration
docs/<name>       documentation only
```

The simplest route is *Create a branch* directly from an issue — the link is
then established automatically.

Nothing is committed to `main` directly, not even by a single developer. The
detour through a pull request costs two minutes and produces the record of
reasoning this project exists to show.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description, imperative, lowercase>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`

Scopes: `api`, `web`, `deploy`, `docs`, `ci`

Examples:

```
feat(api): add project overview endpoint
fix(web): prevent layout shift on image load
test(api): cover slug collision handling
docs(adr): record decision on monorepo layout
```

Rules:

- Imperative, present tense: `add`, not `added` or `adds`
- Lowercase after the colon, no full stop at the end
- First line at most 72 characters
- One commit does one thing. If the description contains "and", it is two
  commits.
- Reference the issue where it applies: `(#12)`

## Pull requests

- Title follows the commit convention
- Description says what and **why**; the how is in the diff
- `Closes #12` in the description — closes the issue on merge
- Merge only when all checks pass
- **Squash merge** — one feature becomes one commit on `main`

Self-review before merging: read your own diff once, in full. Remarkably
effective.

## Definition of done

An issue is done when:

- [ ] all acceptance criteria are met and ticked off
- [ ] tests exist and the pipeline is green
- [ ] affected documentation is updated
- [ ] an ADR exists if an architectural decision was made
- [ ] `main` is deployable

## Tests

Test-driven development applies to logic with clear inputs and outputs: slug
generation and history, validation, authorisation policies, publication state
transitions.

Not test-driven: presentation, and code that primarily drives a framework.
Database access is covered by integration tests running against real PostgreSQL
via Testcontainers, not by unit tests with mocks.

**Every bug fix starts with a failing test.** Test commit first, fix commit
second — in that order, so it is visible in the history.

## Secrets

Never in the repository. Not briefly, not "I'll take it out later" — a secret
that has been pushed is compromised and has to be rotated.

Configuration belongs in `.env` (local, ignored) or in GitHub secrets. Only
`.env.example` with placeholders is versioned.

## Dependencies

A new dependency means ongoing responsibility. Before adding one, check the
licence, maintenance status and size — and whether the standard library already
covers it. A dependency that shapes the architecture belongs in an ADR.
