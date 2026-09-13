# 05 — Glossar (Ubiquitous Language)

Diese Begriffe werden in Dokumentation, Code, Datenbank und Oberfläche
**identisch** verwendet. Wo ein deutscher und ein englischer Begriff steht, gilt
der englische im Code, der deutsche in der Oberfläche.

| Begriff | Code | Bedeutung |
|---|---|---|
| **Plattform** | — | Das System tragni.ch selbst: Frontend, API, Datenbank, Infrastruktur. Nicht die darauf gezeigten Projekte. |
| **Projekt** | `Project` | Ein Katalog-Eintrag. Kann eine Anwendung, ein Werkzeug oder ein technischer Artikel sein. Die Einheit, um die sich alles dreht. |
| **Slug** | `Slug` | URL-tauglicher Bezeichner eines Projekts. Eindeutig, änderbar, mit Historie. |
| **Slug-Historie** | `SlugHistory` | Frühere Slugs eines Projekts. Grundlage für 301-Weiterleitungen. |
| **Entwurf** | `Draft` | Zustand: erfasst, nicht öffentlich sichtbar. |
| **Veröffentlicht** | `Published` | Zustand: öffentlich sichtbar, in Übersicht und Sitemap. |
| **Zurückgezogen** | `Retired` | Zustand: war veröffentlicht, ist es nicht mehr. URL liefert 410. |
| **Gelöscht** | `DeletedAt` | Soft Delete. Nirgends sichtbar, aber wiederherstellbar bis zur Aufräumroutine. |
| **Hervorgehoben** | `IsFeatured` | Erscheint in der Übersicht oben. |
| **Technologie** | `Technology` | Gemeinsame Taxonomie für Filterung (z. B. „C#", „Docker"). |
| **Medium** | `Media` | Hochgeladene Datei mit ihren generierten Varianten und Alt-Text. |
| **Demo** | `Demo` | Ein lauffähiger Container, der zu einem Projekt gehört und unter einem eigenen Pfad erreichbar ist. Black Box aus Sicht der Plattform. |
| **Demo-Vertrag** | — | Die Zusage, die eine Demo erfüllen muss: Image in der Registry, HTTP auf definiertem Port, Health-Endpoint, Routing-Ziel, Ressourcenlimits. |
| **Benutzer** | `User` | Eine dauerhafte Identität mit externer Herkunft (`Provider` + `ExternalId`) und einer Rolle. |
| **Teilnehmer** | — | Eine flüchtige Identität **innerhalb** eines Projekts (z. B. Raumcode + Spitzname). Nie ein `User`, nie in der Plattform gespeichert. |
| **Mitwirkender** | `Contributor` | Rolle: darf eigene Projekte pflegen, nicht die Plattform verwalten. |
| **Token-Exchange** | — | Ausstellung eines kurzlebigen, signierten Tokens durch die Plattform für ein bestimmtes Projekt. Das Projekt prüft nur die Signatur. |
| **Basis-Stack** | — | Traefik, Frontend, API, Datenbank, Collector. Alles ausser Demos. Grundlage des Ressourcenbudgets (Q10). |
| **Walking Skeleton** | — | Der dünnste End-to-End-Pfad: Browser → Frontend → API → Datenbank, gebaut in CI, deployt, mit TLS und Health-Check. Entsteht vor dem ersten Feature. |

## Bewusst vermiedene Begriffe

| Nicht verwenden | Stattdessen | Warum |
|---|---|---|
| „Blog", „Blogpost" | Projekt vom Typ Artikel | Kein eigenes Feature (siehe Scope) |
| „Post", „Artikel" als Entity | `Project` | Eine Entity, ein Modell |
| „GitHubId" | `ExternalId` + `Provider` | Provider ist austauschbar |
| „Admin-Bereich" als Rolle | Rolle `Admin`, Bereich `/admin` | Rolle und Ort sind verschiedene Dinge |
| „Spieler" | Teilnehmer | Gilt für alle Demos, nicht nur Spiele |
