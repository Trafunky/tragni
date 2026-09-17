# 00 — Vision

## Core statement

> tragni.ch is Stephan Tragni's personal engineering platform. It does not just
> present finished projects — it is the largest one: an application that grows
> over years, runs in production, and whose construction, operation and
> evolution can be followed in public.
>
> The goal is that a knowledgeable visitor comes away convinced that the person
> behind it does not merely write software, but understands and operates it.

## What follows from this

The second sentence is a promise the system makes about itself. Three guiding
decisions follow from it, and they settle most later questions of detail:

**1. The platform is not the product — the projects are.**
tragni.ch is the stage, not the performance. Any feature that makes publishing
a new project harder works against the purpose of the system.

**2. The path there is part of the message.**
Not only results are shown, but decisions: ADRs, pull requests, commit history,
CI runs, operational metrics. A public repository without visible reasoning is
just code.

**3. The system has to survive unattended.**
It is operated alongside a full-time job, with a realistic response time of up
to 24 hours. Self-healing is therefore a baseline requirement, not a nicety.

## Personal context

The career path — a trade apprenticeship, then planning and work preparation in
industry, today responsibility for several applications, alongside a degree
completed part-time — is a differentiator and is presented as one. Industry,
role and time periods are shown; employer names are deliberately **not**
published (see [02-scope.md](02-scope.md), assumptions).

## Success criteria

The project is successful if, after twelve months:

- The site runs in production and has been extended several times in that period.
- At least four projects are published, the most recent no older than three
  months.
- Publishing a new project takes at most one evening and no deployment.
- An outside developer can understand the architecture from the README and the
  ADRs without asking.
- The system has survived at least one unattended outage on its own.

## What the project is not

Not a commercial product, not an agency website, not a CMS for third parties,
not a blog. There are no users to serve — there are visitors to convince, and
an operator who has to enjoy running it.
