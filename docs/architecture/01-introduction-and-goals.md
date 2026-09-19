# 01 — Introduction and Goals

## What the system does

tragni.ch is a personal portfolio and engineering platform. It presents projects
in a catalogue, is maintained by its owner through an admin area, and later
hosts running demonstrations of those projects as isolated containers.

The full rationale is in [Vision](../requirements/00-vision.md). The one
sentence that drives every decision below:

> The platform is not the product — the projects are. Any feature that makes
> publishing a new project harder works against the purpose of the system.

## Top three quality goals

The full, measurable set is in
[Quality goals](../requirements/03-quality-goals.md). In priority order, the
three that decide conflicts:

| Priority | Goal | Why it ranks here |
|---|---|---|
| 1 | **Maintainability and traceability** | Worked on in blocks of a few hours, often weeks apart. Code that cannot be picked up again in one evening is dead code. Decisions that cannot be read up on have to be re-derived. |
| 2 | **Operability** | Operated alongside a full-time job, with up to 24 hours before anyone looks at a problem. The system has to notice and recover from most failures without help. |
| 3 | **Performance and discoverability** | The public pages have roughly sixty seconds to convince a visitor. Slow or unindexed pages fail before the content is read. |

Where two of these conflict, the higher one wins. Concretely: readable code
beats a clever optimisation, and a simpler operational setup beats a more
capable one.

## Stakeholders

Detailed personas are in
[Stakeholders & personas](../requirements/01-stakeholders-personas.md). For
architecture purposes:

| Stakeholder | What they need from the architecture |
|---|---|
| Tech lead / developer (P1) | Structure that can be read and judged; decisions that are written down |
| Recruiter (P2) | Fast public pages on mobile; nothing that requires patience |
| Operator (P3) | Publishing without deployment; a system that restarts itself |
| Project contributor (P4) | A stable contract for adding a demo, with no knowledge of the platform |
| Project participant (P5) | Access to a demo without an account |

The conflict between P1 and P2 — depth against speed — is resolved in the
information architecture: a sparse public surface with detail exactly one click
below, not a compromise between the two.
