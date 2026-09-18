import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

/** Shared layout for legal placeholder pages (pending client legal review). */
export function LegalPage({ title, path, children }: { title: string; path: string; children: ReactNode }) {
  return (
    <PageTransition>
      <section className="pb-24 pt-28 lg:pt-36" aria-labelledby="legal-title">
        <div className="container-x">
          <Breadcrumbs items={[{ name: title, path }]} />
          <h1 id="legal-title" className="t-h1 mt-10 lg:mt-14">
            {title}
          </h1>
          <div
            role="note"
            className="mt-10 max-w-3xl border-l-2 border-orange bg-carbon p-5 text-sm text-bone/85"
          >
            Placeholder content. This page must be reviewed and completed by Tiruppur Embossing (and its legal advisor)
            before launch.
          </div>
          <div className="mt-12 max-w-3xl space-y-6 text-bone/85 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-bone">
            {children}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
