# 03 — Qualitätsziele

## Priorisierung

Bei Zielkonflikten gewinnt die höhere Position. Wenn alles wichtig ist, ist
nichts wichtig.

1. **Wartbarkeit und Nachvollziehbarkeit** — Das System muss nach drei Monaten
   Pause in einem Abend wieder verständlich sein, und ein fremder Entwickler
   muss die Entscheidungen nachlesen können.
2. **Betreibbarkeit** — Ausfälle werden bemerkt, bevor andere sie bemerken. Ein
   Restore ist geprobt. Ein Deployment ist ein Knopfdruck.
3. **Performance und Auffindbarkeit** — Öffentliche Seiten sind schnell und
   crawlbar. Die erste Minute entscheidet.
4. **Sicherheit** — Angemessen für ein öffentliches System mit einem Admin,
   ohne Sicherheitstheater.
5. **Erweiterbarkeit** — Neue Projekte und Demos kommen additiv dazu.

> Wartbarkeit steht bewusst über Performance. Zwischen einer eleganten
> Optimierung und verständlichem Code gewinnt der verständliche Code.

## Messbare Anforderungen

| # | Anforderung | Messgrösse | Prüfmethode | Gate |
|---|---|---|---|---|
| Q1 | Frontend-Ladezeit | LCP < 2,0 s · CLS < 0,1 · INP < 200 ms (Mobil, 4G) | Lighthouse-CI | PR blockierend |
| Q2 | API-Antwortzeit | p95 < 200 ms bei Lesezugriffen | OTel-Metrik | Alert |
| Q3a | Verfügbarkeit | ≥ 97 % / Monat, geplante Wartung ausgenommen | externer Uptime-Check | Statusseite |
| Q3b | Reaktionszeit auf Störung | ≤ 24 h | Betriebsprotokoll | dokumentiert |
| Q3c | Selbstheilung | Container-Neustart ohne manuellen Eingriff | Chaos-Test (Container killen) | Architekturregel |
| Q4 | SEO | Lighthouse SEO ≥ 95; alle öffentlichen Seiten SSG/ISR | Lighthouse-CI | PR blockierend |
| Q5 | Barrierefreiheit | WCAG 2.2 AA, keine kritischen axe-Befunde | axe-core in E2E | PR blockierend |
| Q6a | Testabdeckung | Domain ≥ 90 % · Application ≥ 85 % · Frontend-Logik ≥ 80 % · Frontend-Komponenten ≥ 60 % | Coverage-Report | PR blockierend |
| Q6b | Testqualität | Mutation Score ≥ 70 % auf Domain | Stryker.NET | Beobachtung |
| Q6c | Regression | jeder Bugfix hat zuerst einen fehlschlagenden Test | Review / Commit-Historie | Architekturregel |
| Q7 | Build-Dauer | Pipeline < 5 min bis Deploy-Bereitschaft | Workflow-Laufzeit | Beobachtung |
| Q8 | Container-Sicherheit | keine High/Critical CVEs im Prod-Image | Trivy | PR blockierend |
| Q9 | Datensicherung | RPO ≤ 24 h · RTO ≤ 30 min | Restore-Probe, quartalsweise | Protokoll |
| Q10 | Ressourcenbudget | Basis-Stack ≤ 1,5 GB RSS | OTel Host-Metriken | Alert bei p95 > 75 % über 14 Tage |
| Q11 | Deploy-Automatisierung | `main` → Produktion ohne manuellen Schritt | Pipeline-Definition | Architekturregel |
| Q12 | Nachvollziehbarkeit | jede Architekturentscheidung hat einen ADR | Review beim PR | Architekturregel |
| Q13 | Demo-Integration | neue Demo ohne Codeänderung an der Plattform | Verifikation bei erster Demo | Architekturregel |
| Q14 | Publikationsaufwand | neues Projekt veröffentlichen ≤ 1 Abend, ohne Deployment | Selbstmessung | Beobachtung |

## Erläuterungen zu einzelnen Zielen

### Q3 — Verfügbarkeit, RTO, RPO sind drei verschiedene Dinge

- **RTO** ist die *technische* Wiederherstellzeit: von „ich fange an" bis „läuft
  wieder". Bei dieser Datenmenge realistisch 10–15 Minuten.
- **RPO** ist der maximale Datenverlust. Bei täglicher Sicherung bis zu 24 h —
  schlimmstenfalls ein Projekteintrag vom Vorabend.
- **Reaktionszeit** (Q3b) ist etwas anderes: die Zeit, bis überhaupt jemand
  hinschaut. Nebenberuflicher Betrieb heisst bis zu 24 h.

Ein einziger unbemerkter Ausfall über Nacht reisst ein 99-%-Ziel. 97 % mit
dokumentierter Begründung sind ehrlicher und wirken professioneller als eine
Zahl, die die Statusseite später widerlegt.

### Q3c — Selbstheilung ersetzt Reaktionszeit

Weil nicht sofort reagiert werden kann, muss das System sich selbst helfen:
`restart: unless-stopped` plus Health-Checks an jedem Container,
Speicherlimits pro Container, Swap gegen den OOM-Killer, `unattended-upgrades`
für Security-Patches ohne automatischen Reboot, Uptime-Check mit
Benachrichtigung. Der überwiegende Teil realer Ausfälle in diesem Setup ist ein
abgestürzter Container oder eine volle Disk — beides fängt Q3c ab.

### Q6 — Coverage ist eine Untergrenze, kein Ziel

Coverage wird schädlich, sobald sie zum Ziel wird: Tests, die alle Zeilen
berühren und nichts prüfen. Die Zahl fängt nur den Fall ab, dass ein ganzes
Modul ungetestet durchrutscht. Aussagekraft über Testqualität liefert Q6b.

**Vom Coverage-Gate ausgenommen:** `Program.cs`, EF-Core-Migrationen,
generierter Code, DTOs ohne Verhalten, Infrastructure-Repositories (diese werden
über Integrationstests mit Testcontainers gegen echtes PostgreSQL abgedeckt,
nicht über Unit-Tests).

**TDD-Geltungsbereich:** Testgetrieben entwickelt wird Logik mit klarer Ein- und
Ausgabe — Slug-Generierung und -Historie, Validierungsregeln,
Autorisierungs-Policies, Veröffentlichungs-Zustandsübergänge,
Bildvarianten-Berechnung. Nicht testgetrieben: UI-Darstellung und Code, der
primär gegen ein Framework arbeitet.

### Einführung der Gates

Blockierende Prüfungen werden erst scharfgeschaltet, wenn das Walking Skeleton
steht. Eine Pipeline, die am zweiten Tag wegen eines Coverage-Ziels auf einem
leeren Projekt rot ist, führt dazu, dass das Gate abgeschaltet wird — und dann
bleibt es aus. Reihenfolge: erst messen und berichten, dann durchsetzen.
