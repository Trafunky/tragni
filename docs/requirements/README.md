# Requirements — tragni.ch

Anforderungsdokumentation der Portfolio-Plattform tragni.ch.

| Dokument | Inhalt |
|---|---|
| [00-vision.md](00-vision.md) | Warum es das System gibt |
| [01-stakeholder-personas.md](01-stakeholder-personas.md) | Für wen es gebaut wird |
| [02-scope.md](02-scope.md) | MVP, Ausbaustufen, Nicht-Ziele, Annahmen |
| [03-qualitaetsziele.md](03-qualitaetsziele.md) | Messbare nicht-funktionale Anforderungen |
| [04-epics-user-stories.md](04-epics-user-stories.md) | Epics und User Stories mit Akzeptanzkriterien |
| [05-glossar.md](05-glossar.md) | Ubiquitous Language |

## Konventionen

- **IDs** sind stabil. Eine Story-ID wird nie neu vergeben, auch wenn die Story
  entfällt (dann Status `verworfen`).
- **Akzeptanzkriterien** im Given/When/Then-Format. Sie sind die Definition von
  „fertig", nicht die Beschreibung der Umsetzung.
- **Qualitätsziele** (Q-IDs) werden in Stories referenziert, wo sie konkret gelten.
- Architekturentscheidungen stehen **nicht** hier, sondern in `docs/adr/`.

## Status

| Version | Datum | Änderung |
|---|---|---|
| 0.1 | 2026-09 | Erstfassung, Neustart des Projekts |

---

**Offen / noch nicht ausformuliert:**

- User Stories für Epic 3 (Über mich & Kontakt), Epic 4 (Mehrsprachigkeit),
  Epic 5 (Betrieb & Transparenz)
- Epic 6 (Live-Demos) — bewusst erst nach dem MVP
