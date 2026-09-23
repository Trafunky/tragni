# 0012 — Tailwind CSS for styling

- **Status:** accepted
- **Date:** 2026-09-23
- **Deciders:** Stephan Tragni

## Context and problem statement

The frontend styles two halves with different demands: public content pages
bound by Q1 (LCP under 2.0 s) and Q4 (WCAG 2.2 AA), and an admin application
where neither applies but interaction density is high.

It is maintained by one person in blocks of hours, weeks apart (constraint O1).
That shapes the question: not which approach produces the nicest stylesheet, but
which one still holds after months of interruptions, when nobody remembers which
rules are still in use.

`create-next-app` asks for this at scaffolding time. Left unanswered it is
decided by a default rather than on purpose, which is what this record prevents.

## Considered options

1. **Tailwind CSS** — utility classes in the markup
2. **CSS Modules** — a scoped stylesheet per component
3. **Both** — Tailwind for layout, CSS Modules for complex cases

## Decision

Chosen: **Tailwind CSS v4**, as wired up by `create-next-app` through
`@tailwindcss/postcss`, with no component library on top.

The deciding argument is dead code. Tailwind emits only the classes that occur
in the markup, so unused styling cannot accumulate. With CSS Modules, a rule
that is no longer used stays: removing it requires proving that nothing still
depends on it, and under O1 that proof is never attempted. The stylesheet grows,
and after a year nobody dares touch it.

The second argument follows from it: deleting a component deletes its styling
with it. There is no orphaned file and no second place to remember.

Third, the utility scale acts as a constraint. Spacing, type sizes and colours
come from a fixed set of tokens, so a page stays consistent without a designer
enforcing it. This project has no designer.

Market reach supports the decision but did not decide it: Tailwind is the
dominant approach in the Next.js ecosystem, and the knowledge transfers.

Writing speed is explicitly **not** an argument. It is the reason most often
given for Tailwind and the least durable one.

## Consequences

**Positive**

- No unused CSS in the production bundle, which serves Q1 directly.
- Styling is deleted together with the component it belongs to.
- Design tokens live in one place — `@theme` in `src/app/globals.css`.
- No runtime CSS-in-JS, so server components stay server components.

**Negative / accepted costs**

- Markup becomes noisy: long class lists on elements that would otherwise carry
  one semantic class name.
- Class names are a vocabulary that has to be learned; the documentation is open
  a lot at the beginning.
- A class string cannot express intent. `flex items-center gap-2` does not say
  *why*, where `.project-header` would.
- Diffs on markup lines are larger, which makes reviewing a layout change
  harder.

**Obligations this creates**

- A class combination that repeats becomes a component under `components/ui`,
  not a copied string. Without this rule, the noise argument above wins.
- Colours and fonts are defined as tokens in `@theme`; no hard-coded hex values
  in the markup.
- Accessibility is not covered by Tailwind. Semantic HTML, visible focus and
  contrast remain deliberate work (Q4).
- A UI component kit is not added without its own ADR — it would bring its own
  conventions, and possibly its own runtime.

## Why not the others

**CSS Modules** — a real alternative, and the more familiar one coming from
plain CSS: no new vocabulary, scoping solved by the build, intent expressible in
a class name. It loses on dead code, which under O1 is the failure mode that
actually happens. It also asks for a second file and an invented name per
component, and that toll is paid on every single one.

**Both** — flexible on paper. In practice the rule for when to use which is
never written down, both drift, and the codebase ends up with two idioms and no
reason attached to either. Where a case genuinely needs plain CSS — complex
keyframes, print styles — Tailwind permits a regular stylesheet for it. That is
an exception, not a second system.

## Revisit when

- A design system arrives that ships its own styling model.
- Markup readability becomes a measurable problem in reviews, rather than a
  matter of taste.
