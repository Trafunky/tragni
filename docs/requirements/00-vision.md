# 00 — Vision

## Kernaussage

> tragni.ch ist die persönliche Engineering-Plattform von Stephan Tragni. Sie
> präsentiert nicht nur abgeschlossene Projekte, sondern ist selbst das grösste
> davon: eine über Jahre wachsende, produktiv betriebene Anwendung, an der
> Aufbau, Betrieb und Weiterentwicklung öffentlich nachvollziehbar sind.
>
> Ziel ist, dass eine fachkundige Person nach kurzer Betrachtung überzeugt ist,
> dass hier jemand Software nicht nur schreibt, sondern versteht und betreibt.

## Was das bedeutet

Der zweite Satz ist ein Versprechen an das System selbst. Daraus folgen drei
Leitentscheidungen, die jede spätere Detailfrage mitentscheiden:

**1. Die Plattform ist nicht das Produkt — die Projekte sind es.**
tragni.ch ist die Bühne, nicht die Aufführung. Jede Funktion, die das
Veröffentlichen eines neuen Projekts erschwert, arbeitet gegen den Zweck des
Systems.

**2. Der Weg dorthin ist Teil der Aussage.**
Nicht nur das Ergebnis wird gezeigt, sondern die Entscheidungen: ADRs,
Pull Requests, Commit-Historie, CI-Läufe, Betriebsmetriken. Ein öffentliches
Repository ohne nachvollziehbare Entscheidungen ist nur Code.

**3. Das System muss ohne Betreuung überleben.**
Es wird nebenberuflich betrieben, mit einer realistischen Reaktionszeit von bis
zu 24 Stunden. Selbstheilung ist deshalb keine Kür, sondern Grundanforderung.

## Persönlicher Kontext

Der berufliche Weg — handwerkliche Grundbildung, danach Planung/AVOR in der
Industrie, heute Verantwortung für mehrere Applikationen, dazu ein
berufsbegleitendes Studium — ist ein Differenzierungsmerkmal und wird auf der
Seite als solches dargestellt. Gezeigt werden Branche, Rolle und Zeiträume;
Arbeitgebernamen werden bewusst **nicht** öffentlich genannt (siehe
[02-scope.md](02-scope.md), Annahmen).

## Erfolgskriterien

Das Projekt gilt als erfolgreich, wenn nach zwölf Monaten gilt:

- Die Seite läuft produktiv und wurde im Zeitraum mehrfach erweitert.
- Mindestens vier Projekte sind veröffentlicht, das jüngste ist nicht älter als
  drei Monate.
- Ein neues Projekt zu veröffentlichen kostet höchstens einen Abend und kein
  Deployment.
- Ein fremder Entwickler kann anhand von README und ADRs die Architektur
  verstehen, ohne zu fragen.
- Das System hat mindestens einen unbeaufsichtigten Ausfall selbst überstanden.

## Was das Projekt nicht ist

Kein kommerzielles Produkt, keine Agentur-Website, kein CMS für Dritte, kein
Blog. Es gibt keine Nutzer, die bedient werden müssen — es gibt Betrachter, die
überzeugt werden sollen, und einen Betreiber, der Freude daran haben muss.
