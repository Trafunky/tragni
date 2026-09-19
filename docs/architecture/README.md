# Architecture — tragni.ch

Architecture documentation following the [arc42](https://arc42.org) template.

Twelve chapters, always in the same order. The structure is fixed so that a
reader knows where to look and the author does not have to invent an outline.

| # | Chapter | Contents |
|---|---|---|
| [01](01-introduction-and-goals.md) | Introduction and goals | What the system does, top quality goals, stakeholders |
| [02](02-constraints.md) | Constraints | What is fixed and not up for discussion |
| [03](03-context-and-scope.md) | Context and scope | System boundary, users, external systems |
| [04](04-solution-strategy.md) | Solution strategy | The handful of decisions that shape everything else |
| [05](05-building-block-view.md) | Building block view | Static structure, top-down |
| [06](06-runtime-view.md) | Runtime view | How the parts interact in key scenarios |
| [07](07-deployment-view.md) | Deployment view | Infrastructure, containers, networks, resource budget |
| [08](08-crosscutting-concepts.md) | Crosscutting concepts | Rules that apply everywhere |
| [09](09-architecture-decisions.md) | Architecture decisions | Index of ADRs |
| [10](10-quality-requirements.md) | Quality requirements | Quality tree and concrete scenarios |
| [11](11-risks-and-technical-debt.md) | Risks and technical debt | What could go wrong, and what is knowingly unfinished |
| [12](12-glossary.md) | Glossary | Ubiquitous language |

## Conventions

- **No duplication.** Where requirements already state something, this document
  links to it instead of repeating it. A fact that exists twice is a fact that
  will disagree with itself.
- **Diagrams as code.** All diagrams are Mermaid source in the Markdown, so they
  can be diffed and reviewed. No exported images.
- **Decisions live in ADRs**, not here. Chapter 9 is an index.
- This document describes how the system **is**. The ADRs describe why it
  **became** that way.

## Status

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-09-19 | First version. Written before implementation; sections marked *planned* are not yet built. |

Everything in this document is currently **planned**, not built. The document is
written first on purpose: it is what the implementation is checked against.
