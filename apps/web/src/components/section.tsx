import type { ReactNode } from "react";

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12 sm:mt-16">
      <h2 className="mb-7 border-b border-rule pb-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-muted">
        {heading}
      </h2>
      <div>{children}</div>
    </section>
  );
}

/** One row of a timeline: a period on the left, what happened on the right. */
export function Entry({
  when,
  what,
  detail,
  children,
}: {
  when: string;
  what: string;
  detail: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-x-7 border-t border-rule py-4 first:border-t-0 first:pt-0 sm:grid-cols-[8rem_1fr]">
      <div className="text-sm tabular-nums text-muted sm:pt-0.5">{when}</div>
      <div>
        <p className="font-medium">{what}</p>
        <p className="max-w-[36rem] text-[0.9375rem] leading-relaxed text-muted">
          {detail}
        </p>
        {children}
      </div>
    </div>
  );
}
