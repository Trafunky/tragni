# 04 — Epics & User Stories

Akzeptanzkriterien im Given/When/Then-Format. Sie definieren „fertig", nicht die
Umsetzung. Jede Story ist so geschnitten, dass sie in ein bis zwei Arbeitsblöcke
von wenigen Stunden passt.

---

## E1 — Projekt-Katalog

### PK-01 · Projektübersicht

> Als **Besucher** will ich alle veröffentlichten Projekte auf einen Blick
> sehen, um schnell einzuschätzen, was gebaut wurde.

- **Given** es existieren veröffentlichte Projekte, **when** ich `/` bzw.
  `/projekte` aufrufe, **then** sehe ich pro Projekt Titel, Kurzbeschreibung,
  Vorschaubild und die verwendeten Technologien.
- **Given** ein Projekt ist als Entwurf markiert, **when** ich die Übersicht
  aufrufe, **then** erscheint es nicht — auch nicht bei Kenntnis der URL.
- **Given** es existiert kein veröffentlichtes Projekt, **when** ich die Seite
  aufrufe, **then** sehe ich einen gestalteten Leerzustand.
- **Given** Mobilgerät im 4G-Profil, **when** die Seite lädt, **then** ist
  LCP < 2,0 s. *(Q1)*

### PK-02 · Nach Technologie filtern

> Als **Tech Lead** will ich nach Technologien filtern, um zu sehen, ob
> Erfahrung mit meinem Stack besteht.

- **Given** Projekte mit verschiedenen Technologien, **when** ich eine
  Technologie wähle, **then** sehe ich nur passende Projekte und der Filter
  steht in der URL (`?tech=csharp`).
- **Given** eine gefilterte URL, **when** jemand sie öffnet, **then** ist
  derselbe Filter aktiv.
- **Given** eine Filterkombination ohne Treffer, **when** ich sie wähle,
  **then** sehe ich eine Meldung mit Möglichkeit zum Zurücksetzen.
- **Given** JavaScript ist deaktiviert, **when** ich die Übersicht aufrufe,
  **then** sind die Projekte trotzdem sichtbar. *(Q4, Q5)*

### PK-03 · Projektdetail

> Als **Besucher** will ich ein Projekt im Detail lesen, um Kontext,
> Entscheidungen und Ergebnis zu verstehen.

- **Given** ein veröffentlichtes Projekt, **when** ich es öffne, **then** sehe
  ich unter `/projekte/<slug>` den vollständigen Inhalt, Bilder, Tech-Stack und
  Zeitraum.
- **Given** der Inhalt enthält Codeblöcke, **when** die Seite rendert, **then**
  sind sie mit Syntax-Highlighting dargestellt.
- **Given** ein unbekannter Slug, **when** ich ihn aufrufe, **then** erhalte ich
  HTTP 404 mit gestalteter Fehlerseite.
- **Given** der Slug wurde nachträglich geändert, **when** jemand die alte URL
  aufruft, **then** werde ich per 301 auf die neue umgeleitet.

> Das letzte Kriterium erfordert eine Slug-Historie im Datenmodell.

### PK-04 · Quellcode und Demo erreichen

> Als **Entwickler** will ich direkt zum Repository springen, um den Code zu
> beurteilen.

- **Given** ein Projekt hat eine GitHub-URL, **when** ich die Detailseite
  ansehe, **then** ist der Link prominent und öffnet in neuem Tab mit
  `rel="noopener"`.
- **Given** ein Projekt hat keine Demo-URL, **when** die Seite rendert, **then**
  erscheint kein toter Demo-Button.
- **Given** ein Projekt hat eine Demo-URL, **when** ich klicke, **then** lande
  ich auf der laufenden Demo. *(erst mit E6)*

### PK-05 · Teilbarkeit

> Als **Recruiter** will ich einen Projektlink teilen, ohne dass eine nackte URL
> erscheint.

- **Given** eine Projektseite, **when** ein Dienst die Vorschau lädt, **then**
  liefert die Seite Open-Graph-Titel, -Beschreibung und -Bild.
- **Given** die Seite ist live, **when** ein Crawler sie liest, **then**
  existieren `sitemap.xml`, `robots.txt` und strukturierte Daten. *(Q4)*

---

## E2 — Content-Verwaltung

### CV-01 · Anmelden

> Als **Admin** will ich mich sicher anmelden, um Inhalte zu pflegen.

- **Given** ich bin nicht angemeldet, **when** ich `/admin` aufrufe, **then**
  werde ich zum Login geleitet.
- **Given** ich melde mich über den externen Identitätsanbieter an, **when** der
  Flow erfolgreich ist, **then** setzt das Backend einen HttpOnly-, Secure-,
  SameSite-Cookie; kein Token ist im Browser-JavaScript zugänglich.
- **Given** meine externe Identität ist keiner Rolle zugeordnet, **when** ich
  mich anmelde, **then** erhalte ich 403 und keinen Zugriff.
- **Given** eine abgelaufene Session, **when** ich eine Aktion ausführe, **then**
  erhalte ich 401 und werde zum Login geführt, ohne meinen Entwurf zu verlieren.
- **Given** wiederholte Fehlversuche, **when** die Schwelle überschritten ist,
  **then** greift Rate-Limiting.
- **Given** der API-Container wird neu gestartet, **when** ich danach eine
  Aktion ausführe, **then** bleibt meine Session gültig (persistierte
  DataProtection-Keys).
- **Given** ein schreibender Zugriff, **when** kein gültiges Antiforgery-Token
  mitgesendet wird, **then** wird er abgelehnt.

### CV-02 · Projekt als Entwurf anlegen

> Als **Admin** will ich ein Projekt anlegen und speichern, ohne es sofort zu
> veröffentlichen.

- **Given** ich bin angemeldet, **when** ich ein Projekt mit Titel und
  Beschreibung speichere, **then** ist es als Entwurf gespeichert und öffentlich
  unsichtbar.
- **Given** ich gebe einen Titel ein, **when** ich keinen Slug angebe, **then**
  wird einer vorgeschlagen, den ich überschreiben kann.
- **Given** ein bereits vergebener Slug, **when** ich speichere, **then** erhalte
  ich eine verständliche Fehlermeldung statt eines 500ers.
- **Given** ungültige Eingaben, **when** ich speichere, **then** validieren
  Frontend und Backend unabhängig voneinander.

### CV-03 · Bilder hochladen

> Als **Admin** will ich Screenshots hochladen, ohne sie vorher von Hand zu
> optimieren.

- **Given** ich lade ein JPEG oder PNG hoch, **when** der Upload abgeschlossen
  ist, **then** liegen optimierte Varianten (WebP/AVIF, mehrere Breiten) vor.
- **Given** eine Datei über dem Limit oder mit falschem Typ, **when** ich sie
  wähle, **then** wird sie abgelehnt — geprüft am tatsächlichen Inhalt, nicht an
  der Dateiendung.
- **Given** ein hochgeladenes Bild, **when** ich es einbinde, **then** ist ein
  Alt-Text Pflichtfeld. *(Q5)*
- **Given** ein Bild wird nicht mehr referenziert, **when** die Aufräumroutine
  läuft, **then** wird es entfernt.

### CV-04 · Veröffentlichen und zurückziehen

> Als **Admin** will ich selbst bestimmen, wann ein Projekt sichtbar wird.

- **Given** ein fertiger Entwurf, **when** ich veröffentliche, **then** ist er
  innerhalb einer Minute öffentlich sichtbar (ISR-Revalidierung). *(Q14)*
- **Given** ein veröffentlichtes Projekt, **when** ich es zurückziehe, **then**
  liefert die URL 410 und es verschwindet aus Übersicht und Sitemap.
- **Given** ein Entwurf, **when** ich eine signierte Vorschau-URL erzeuge,
  **then** kann ich ihn zeigen, ohne zu veröffentlichen.
- **Given** ich lösche ein Projekt, **when** die Aktion bestätigt ist, **then**
  wird es als gelöscht markiert (Soft Delete) und ist nirgends mehr sichtbar;
  endgültiges Löschen erfolgt nur über eine bewusste Aufräumroutine.

### CV-05 · Reihenfolge steuern

> Als **Admin** will ich bestimmen, welche Projekte zuerst erscheinen.

- **Given** mehrere Projekte, **when** ich eines als hervorgehoben markiere,
  **then** steht es in der Übersicht oben.
- **Given** keine manuelle Sortierung, **when** die Übersicht lädt, **then** ist
  die Standardreihenfolge nachvollziehbar (neueste zuerst).

### CV-06 · Inhalte erfassen

> Als **Admin** will ich Projektinhalte in Markdown schreiben und die Wirkung
> sehen, bevor ich veröffentliche.

- **Given** der Editor, **when** ich Markdown eingebe, **then** sehe ich eine
  Live-Vorschau in der Darstellung der späteren Seite.
- **Given** Markdown mit eingebettetem HTML, **when** es gerendert wird,
  **then** wird es sanitisiert; eingeschleustes Skript wird nicht ausgeführt.
- **Given** ein hochgeladenes Bild, **when** ich es im Editor einfüge, **then**
  wird die korrekte Referenz eingesetzt, ohne dass ich Pfade kenne.

> Kein WYSIWYG. Ein Rich-Text-Editor ist ein eigenes Projekt mit eigener
> Fehlerklasse; es gibt genau einen Autor, und der kann Markdown.

---

## Architekturvorkehrungen aus späteren Epics

Diese Punkte werden **nicht im MVP gebaut**, aber jetzt vorgesehen, weil sie
nachträglich teuer wären:

- **Benutzer-Entity** mit `ExternalId` + `Provider` (nicht „GitHubId"), `Role`
  und `CreatedAt`. Im MVP enthält sie genau einen Datensatz.
- **Rollenmodell** `Anonymous` / `User` / `Contributor` / `Admin`, umgesetzt über
  Policies (`RequireAuthorization("CanManageProjects")`), nie über
  Rollenvergleiche im Code.
- **Ressourcenbasierte Autorisierung** als vorhandener Einstiegspunkt
  (`IAuthorizationHandler`), auch wenn die Implementierung zunächst trivial ist.
- **Selbstregistrierung** bei Erstanmeldung ist ein bewusster, per Flag
  abschaltbarer Vorgang.
- **Token-Exchange:** Die Plattform stellt auf Anfrage kurzlebige, signierte
  Token für ein bestimmtes Projekt aus; das Projekt prüft nur die Signatur.
  Kein Cookie-Sharing über Subdomains, kein geteilter Datenbankzugriff.
- **Cookie-Scope** eng auf die Hauptdomain begrenzen, damit Demo-Subdomains den
  Admin-Cookie nie sehen.
