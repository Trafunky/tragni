# 02 — Scope

## MVP

Ziel des MVP ist ein **produktiv laufendes, vollständig automatisiert
deploytes System** mit einem einzigen fachlichen Kern: dem Projekt-Katalog.

| Epic | Inhalt | Im MVP |
|---|---|---|
| E1 — Projekt-Katalog | Übersicht, Filter, Detailseite, Teilbarkeit | ja |
| E2 — Content-Verwaltung | Login, CRUD, Bild-Upload, Veröffentlichen | ja |
| E3 — Über mich & Kontakt | Werdegang, Fähigkeiten, Kontaktwege | reduziert |
| E4 — Mehrsprachigkeit | DE/EN | ja |
| E5 — Betrieb & Transparenz | Health-Checks, Statusseite | teilweise |
| E6 — Live-Demos | Demo-Routing, Lifecycle, Mitwirkenden-Vertrag | nein |

**Reduziert in E3:** Kontakt im MVP über E-Mail-Adresse (obfusziert), LinkedIn
und GitHub. Kein Kontaktformular — Mailversand von einem frischen VPS ist ohne
SPF/DKIM/DMARC und saubere Reverse-DNS unzuverlässig, und eine Anfrage, die im
Spam landet, ist schlimmer als kein Formular. Kein CV-PDF zum Download (siehe
Annahme A4).

**Teilweise in E5:** Health-Checks, Restart-Policies, Backup und Observability
gehören zum MVP. Die öffentliche Statusseite kommt erst, wenn diese Basis steht
— eine Statusseite ist ein Versprechen und darf nicht vor der Fähigkeit
erscheinen, es zu halten.

## Ausbaustufen nach dem MVP

| Stufe | Inhalt |
|---|---|
| A1 | Öffentliche Statusseite (Verfügbarkeit, p95-Antwortzeiten, Komponentenstatus, letztes Deployment mit Commit-SHA) |
| A2 | Kontaktformular mit Versand über SMTP-Relay des Mailkontos, Honeypot + Rate-Limiting |
| A3 | CV-Generierung als PDF aus den strukturierten Daten (eine Datenquelle für Web und Dokument) |
| A4 | Live-Demos: Traefik-Routing, Demo-Lifecycle, Mitwirkenden-Vertrag, Token-Exchange |
| A5 | Quiz-Projekt: Quizmaster mit Konto, Teilnehmer per Raumcode, serverseitige Buzzer-Auflösung |

## Nicht-Ziele

Diese Punkte werden bewusst nicht verfolgt. Sie stehen hier, damit sie niemand
vermisst und niemand sie versehentlich einführt.

- **Hochverfügbarkeit und Redundanz.** Ein einzelner VPS ohne Standby. Höhere
  Verfügbarkeit wäre nur mit Redundanz erreichbar und sprengt den Rahmen.
- **Horizontale Skalierbarkeit / Kubernetes.** Für eine Handvoll Container auf
  einem Server sind Docker Compose und Traefik die angemessene Antwort.
- **Mandantenfähigkeit.** Es gibt einen Betreiber.
- **Blog als eigenständiges Feature.** Ein technischer Artikel ist ein
  Katalog-Eintrag vom Typ „Artikel". Ein Blog mit drei alten Beiträgen schadet
  mehr, als er nützt.
- **Kommentare, Likes, soziale Funktionen.** Moderationsaufwand ohne Gegenwert.
- **Offline-Fähigkeit, native Apps.**
- **Eigene Benutzerverwaltung mit Passwörtern.** Identität kommt von externen
  Providern.

## Annahmen und Randbedingungen

| # | Annahme |
|---|---|
| A1 | Betrieb auf einem Infomaniak VPS Lite: 2 vCPU, 4 GB RAM, 60 GB Disk. Aufstockung ist möglich und erfolgt erst bei gemessenem Bedarf (siehe Q10). |
| A2 | Backup-Ziel ist Infomaniak Swiss Backup über S3. Swiss Backup ist **Sicherung**, kein Live-Speicher; ausgelieferte Bilder liegen in einem Docker-Volume auf dem Server. |
| A3 | Betrieb erfolgt nebenberuflich. Reaktionszeit auf Störungen bis 24 h (siehe Q3b). |
| A4 | Öffentlich gezeigt werden Branche, Rolle und Zeiträume des Werdegangs — keine Arbeitgebernamen, keine Adresse, kein Geburtsdatum, keine Telefonnummer. |
| A5 | Fixe Technologie-Vorgaben: Backend C#/.NET, Linux-Server bei Infomaniak, Docker. |
| A6 | Die Plattform ist Identitäts-Autorität für alle Projekte. Projekte erhalten Benutzeridentität ausschliesslich über kurzlebige, signierte Token und greifen nie auf die Plattform-Datenbank zu. |
| A7 | Projekte dürfen zusätzlich eigene, flüchtige Sitzungsidentitäten führen (z. B. Raumcode + Spitzname), die nicht in der Plattform gespeichert werden. |
| A8 | Der Quellcode der Plattform ist öffentlich. Alles, was nicht öffentlich sein darf, ist Secret und liegt nie im Repository. |
