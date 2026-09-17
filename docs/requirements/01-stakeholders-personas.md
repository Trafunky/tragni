# 01 — Stakeholders & Personas

## Overview

| Persona | Role in the system | Priority |
|---|---|---|
| [P1 — Tech lead / developer](#p1--tech-lead--developer) | Visitor, technical judgement | high |
| [P2 — Recruiter / HR](#p2--recruiter--hr) | Visitor, quick assessment | high |
| [P3 — Stephan (admin)](#p3--stephan-admin) | Operator and author | high |
| [P4 — Project contributor](#p4--project-contributor) | Supplies a demo | medium (post-MVP) |
| [P5 — Project participant](#p5--project-participant) | Uses a demo | low (post-MVP) |

---

## P1 — Tech lead / developer

**Goal:** Judge whether this person would fit the team technically.

**Behaviour:** Skims the project overview, filters by their own stack, opens one
or two projects, jumps to GitHub, reads the README and the ADRs, looks at commit
history and CI status. Spends five to ten minutes.

**Convinces them:** Well-structured repositories, decisions that can be
followed, real tests, working pipelines, a system that actually runs.

**Puts them off:** Tutorial code, an empty or generic test folder,
overengineering without justification, dead links, "coming soon".

---

## P2 — Recruiter / HR

**Goal:** Decide quickly whether making contact is worthwhile.

**Behaviour:** Often on a mobile device, scans for at most 60 seconds, looks for
technologies, availability and a way to get in touch. Does not read code.

**Convinces them:** Immediately clear what the person can do. Fast loading,
clean mobile layout, an obvious contact route.

**Puts them off:** Jargon without context, a slow page, no visible way to make
contact.

> **Conflict P1 ↔ P2:** depth versus speed. Resolved through information
> architecture — a sparse surface, with depth exactly one click below. Not a
> compromise in the middle.

---

## P3 — Stephan (admin)

**Goal:** Publish projects and operate the system, alongside a full-time job.

**Behaviour:** Works in blocks of a few hours per week, often weeks apart. Has
to get back up to speed quickly after a break.

**Needs:** Publishing without a deployment and without a terminal. A
comprehensible error message instead of a stack trace. A system that restarts
itself.

**Breaks them:** Any friction in publishing. What is cumbersome does not get
done, and then the site stands still — the worst possible state for this
project.

---

## P4 — Project contributor

**Goal:** Make their own project visible on the platform without knowing the
platform.

**Behaviour:** Develops in their own repository, their own language (e.g. Java),
their own rhythm. Supplies a container image and metadata.

**Needs:** A documented, stable contract — image, port, health endpoint, routing
path. No coordination over platform internals.

**Constraint:** Gets no access to the platform database or network. Identity
is provided exclusively through short-lived, signed tokens.

---

## P5 — Project participant

**Goal:** Try out a demo without registering for it.

**Behaviour:** Arrives via a link, stays for minutes, may never return.

**Needs:** No account. Where an identity is required (e.g. a quiz round with a
buzzer), a transient session identity inside the project is enough — a room
code plus a nickname.

> **Principle:** whoever owns data needs a durable identity. Whoever takes part
> in a session needs only a transient one.

---

## Other stakeholders (not users)

| Stakeholder | Interest |
|---|---|
| Infomaniak | Host of the VPS and Swiss Backup; resource limits and cost |
| GitHub | Identity provider, code hosting, CI, container registry |
| Search engine crawlers | Indexability of the public pages |
