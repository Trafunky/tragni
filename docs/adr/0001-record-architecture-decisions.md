# 0001 — Record architecture decisions

- **Status:** accepted
- **Date:** 2026-09-17
- **Deciders:** Stephan Tragni

## Context and problem statement

This project runs over years, is worked on in blocks of a few hours per week,
and is often set aside for weeks at a time. Decisions made in one session are
forgotten by the next, and the code alone does not say *why* something was done
one way and not another.

It is also a portfolio: the reasoning is precisely what a knowledgeable visitor
is looking for (persona P1). A repository that shows only results shows the
least interesting half.

An earlier version of this project kept its architecture in a Word document
outside the repository. It was out of date within months, because nothing tied
it to the code.

## Considered options

1. **No formal record** — reasoning lives in commit messages and memory
2. **A single architecture document** — one file, maintained centrally
3. **ADRs as files in the repository**, alongside arc42 documentation

## Decision

Chosen: **ADRs as files in the repository**, in [MADR](https://adr.github.io/madr/)
format under `docs/adr/`, next to arc42 documentation under
`docs/architecture/`.

Documentation lives in the repository, in Markdown, and travels with the code.
It is reviewed in the same pull request as the change it describes, which is the
only mechanism that reliably keeps it current. Diagrams are written as code
(text sources rendered to images), not pasted as pictures, so they can be
diffed.

An ADR is immutable once accepted. Changing one's mind produces a *new* ADR that
supersedes the old one, and the old one stays. The sequence of decisions is
itself the record — including the ones that turned out wrong.

## Consequences

**Positive**

- Reasoning survives the gaps between working sessions.
- The decision history is visible in `git log` and in pull requests.
- Documentation and code cannot drift apart silently: a stale document shows up
  in review.

**Negative / accepted costs**

- Every significant decision costs 15–30 minutes of writing.
- The discipline has to hold even when the decision feels obvious at the time.

**Obligations this creates**

- Quality goal Q12: every architecture decision has an ADR. Enforced in review,
  listed in the definition of done.
- The ADR is written in the pull request that implements the decision, not
  afterwards.

## Why not the others

**No formal record** — the failure mode is known from experience: after three
months, the reasoning is gone and the only way to recover it is to re-derive it.
For a project explicitly meant to demonstrate engineering judgement, leaving the
judgement undocumented defeats the purpose.

**A single architecture document** — describes the current state but loses the
path. It cannot express "we chose X over Y because Z", and every revision
overwrites the previous reasoning. This is exactly what the Word document from
the earlier attempt did.

## Revisit when

Not applicable. This is a working convention, not a technical choice.
