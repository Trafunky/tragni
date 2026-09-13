# 01 — Stakeholder & Personas

## Übersicht

| Persona | Rolle im System | Priorität |
|---|---|---|
| [P1 — Tech Lead / Entwickler](#p1--tech-lead--entwickler) | Besucher, fachliche Beurteilung | hoch |
| [P2 — Recruiter / HR](#p2--recruiter--hr) | Besucher, schnelle Einschätzung | hoch |
| [P3 — Stephan (Admin)](#p3--stephan-admin) | Betreiber und Autor | hoch |
| [P4 — Projekt-Mitwirkender](#p4--projekt-mitwirkender) | liefert eine Demo | mittel (nach MVP) |
| [P5 — Projekt-Teilnehmer](#p5--projekt-teilnehmer) | nutzt eine Demo | niedrig (nach MVP) |

---

## P1 — Tech Lead / Entwickler

**Ziel:** Beurteilen, ob diese Person fachlich in sein Team passt.

**Verhalten:** Überfliegt die Projektübersicht, filtert nach seinem Stack, öffnet
ein bis zwei Projekte, springt zu GitHub, liest README und ADRs, schaut sich
Commit-Historie und CI-Status an. Nimmt sich fünf bis zehn Minuten.

**Überzeugt ihn:** Strukturierte Repositories, nachvollziehbare Entscheidungen,
echte Tests, funktionierende Pipelines, ein System, das tatsächlich läuft.

**Schreckt ihn ab:** Tutorial-Code, ein leerer oder generischer Test-Ordner,
Overengineering ohne Begründung, tote Links, „Coming soon".

---

## P2 — Recruiter / HR

**Ziel:** In kurzer Zeit einschätzen, ob ein Kontakt sich lohnt.

**Verhalten:** Öffnet die Seite häufig auf dem Mobilgerät, scannt maximal 60
Sekunden, sucht Technologien, Verfügbarkeit und Kontaktmöglichkeit. Liest keinen
Code.

**Überzeugt ihn:** Sofort erkennbar, was die Person kann. Schnelle Ladezeit,
saubere Mobildarstellung, klarer Kontaktweg.

**Schreckt ihn ab:** Fachjargon ohne Einordnung, langsame Seite, kein
erkennbarer Kontaktweg.

> **Zielkonflikt P1 ↔ P2:** Tiefe gegen Geschwindigkeit. Auflösung über die
> Informationsarchitektur — knappe Oberfläche, Tiefe genau eine Klickebene
> darunter. Kein Kompromiss in der Mitte.

---

## P3 — Stephan (Admin)

**Ziel:** Projekte veröffentlichen und das System betreiben, neben einer
100%-Anstellung.

**Verhalten:** Arbeitet in Blöcken von wenigen Stunden pro Woche, oft mit
Wochen Abstand. Muss nach einer Pause schnell wieder hineinfinden.

**Braucht:** Veröffentlichen ohne Deployment und ohne Terminal. Eine
verständliche Fehlermeldung statt eines Stacktraces. Ein System, das sich
selbst neu startet.

**Bricht ihm das Genick:** Jeder Reibungspunkt beim Veröffentlichen. Was
umständlich ist, wird nicht gemacht, und dann steht die Seite still — der
schlimmstmögliche Zustand für dieses Projekt.

---

## P4 — Projekt-Mitwirkender

**Ziel:** Ein eigenes Projekt auf der Plattform sichtbar machen, ohne die
Plattform zu kennen.

**Verhalten:** Entwickelt in eigenem Repository, eigener Sprache (z. B. Java),
eigenem Rhythmus. Liefert ein Container-Image und Metadaten.

**Braucht:** Einen dokumentierten, stabilen Vertrag — Image, Port,
Health-Endpoint, Routing-Pfad. Keine Abstimmung über Details der Plattform.

**Randbedingung:** Bekommt keinen Zugriff auf Plattform-Datenbank oder
-Netzwerk. Identität ausschliesslich über kurzlebige, signierte Token.

---

## P5 — Projekt-Teilnehmer

**Ziel:** Eine Demo ausprobieren, ohne sich dafür zu registrieren.

**Verhalten:** Kommt über einen Link, bleibt Minuten, kommt vielleicht nie
wieder.

**Braucht:** Keinen Account. Wo eine Identität nötig ist (z. B. Spielrunde mit
Buzzer), reicht eine flüchtige Sitzungsidentität innerhalb des Projekts —
Raumcode plus Spitzname.

> **Grundsatz:** Wer Daten besitzt, braucht eine dauerhafte Identität. Wer an
> einer Sitzung teilnimmt, braucht nur eine flüchtige.

---

## Weitere Stakeholder (keine Nutzer)

| Stakeholder | Interesse |
|---|---|
| Infomaniak | Hoster von VPS und Swiss Backup; Ressourcengrenzen und Kosten |
| GitHub | Identitätsanbieter, Code-Hosting, CI, Container-Registry |
| Suchmaschinen-Crawler | Indexierbarkeit der öffentlichen Seiten |
