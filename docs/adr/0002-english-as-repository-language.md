# 0002 — English as the repository language

- **Status:** accepted
- **Date:** 2026-09-17
- **Deciders:** Stephan Tragni

## Context and problem statement

The requirements were first written in German, the author's working language.
The repository is public and exists to be read by potential employers and other
developers, some of whom do not read German.

An initial convention split the two — code and commits in English, issues,
pull requests and documentation in German. In practice that means switching
language several times within a single unit of work: a German issue, an English
commit, a German pull request, for the same change.

## Considered options

1. **German throughout** — the author's strongest language
2. **Bilingual** — both versions maintained in the repository
3. **English throughout** — one language for everything in the repository

## Decision

Chosen: **English throughout** — code, commit messages, branch names, issues,
pull requests, documentation and ADRs.

The repository is public and is meant to recommend its author. English costs
nothing and removes a barrier for part of the audience, including international
teams within Switzerland. Writing technical English is itself part of the craft
this project is meant to develop.

The website remains German and English as a product feature. That is a separate
concern from the language of the repository.

German reading copies of documents may be produced on demand and are kept
locally in `_de/`, which is git-ignored. They are snapshots, never a maintained
second version.

The seven existing requirement documents were translated at the point of this
decision, while there were still seven of them.

## Consequences

**Positive**

- One language per unit of work; no switching mid-task.
- The repository is readable by anyone in the field.
- Deliberate practice in technical writing in English.

**Negative / accepted costs**

- Nuanced reasoning takes the author longer to write than it would in German,
  and some precision may be lost in the process.
- Reading back one's own documentation is slower.

**Obligations this creates**

- `_de/` stays in `.gitignore`. A German copy must never be committed.
- The issue history has a visible language break at issue #11. This is left as
  it is — a dated, deliberate switch reads better than a rewritten history.

## Why not the others

**German throughout** — would be faster to write and no worse for the primary
Swiss audience, but it narrows the readership of a public repository for no
gain, and it forgoes the practice.

**Bilingual** — the worst of the three, and the option that felt most
appealing. Two versions mean double maintenance, and at four to eight hours of
project time per week the second one goes stale. A German translation sitting
next to updated English text signals that things get started and not followed
through — the opposite of the message this project is meant to send.

## Revisit when

Not applicable.
