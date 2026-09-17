# Requirements — tragni.ch

Requirements documentation for the tragni.ch portfolio platform.

| Document | Contents |
|---|---|
| [00-vision.md](00-vision.md) | Why the system exists |
| [01-stakeholders-personas.md](01-stakeholders-personas.md) | Who it is built for |
| [02-scope.md](02-scope.md) | MVP, later stages, non-goals, assumptions |
| [03-quality-goals.md](03-quality-goals.md) | Measurable non-functional requirements |
| [04-epics-user-stories.md](04-epics-user-stories.md) | Epics and user stories with acceptance criteria |
| [05-glossary.md](05-glossary.md) | Ubiquitous language |

## Conventions

- **IDs are stable.** A story ID is never reassigned, even if the story is
  dropped (it is then marked `rejected`).
- **Acceptance criteria** use Given/When/Then. They define done, not how it is
  built.
- **Quality goals** (Q-IDs) are referenced from stories where they apply
  concretely.
- Architecture decisions do **not** belong here; they live in `docs/adr/`.

## Status

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-09 | Initial version, project restart |
| 0.2 | 2026-09 | Translated to English; repository language is now English throughout |

---

**Open / not yet written:**

- User stories for Epic 3 (About & contact), Epic 4 (Internationalisation),
  Epic 5 (Operations & transparency)
- Epic 6 (Live demos) — deliberately deferred until after the MVP
