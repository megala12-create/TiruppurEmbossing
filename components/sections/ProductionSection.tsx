import { productionPrinciples, workflow } from "@/data/production";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Quality & production mindset - principles grid + typical workflow. */
export function ProductionSection({ index = "04" }: { index?: string }) {
  return (
    <section aria-labelledby="production-title" className="section-y bg-paper text-bone">
      <div className="container-x">
        <SectionHeading
          id="production-title"
          index={index}
          label="Quality & Production"
          accent="red"
          tone="light"
          title={"Sample with care.\nProduce with consistency."}
          intro="Printing decisions are made against the fabric, the design and the delivery requirement, then validated before bulk."
        />

        <ul className="mt-16 grid gap-px bg-paper-line sm:grid-cols-2 lg:mt-24 lg:grid-cols-4" data-reveal="stagger">
          {productionPrinciples.map((p, i) => (
            <li key={p.title} className="flex flex-col gap-10 bg-paper p-6 md:p-8">
              <span className="t-label text-paper-mute">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-2xl font-extrabold uppercase leading-none [font-variation-settings:'wdth'_76]">
                  {p.title}
                </h3>
                <p className="mt-3 text-paper-mute">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-20 lg:mt-28">
          <h3 className="t-label mb-8 text-paper-mute">How a project typically moves</h3>
          <ol className="relative grid gap-8 md:grid-cols-3 lg:grid-cols-6 lg:gap-0" data-reveal="stagger">
            {workflow.map((w) => (
              <li key={w.step} className="relative border-l border-paper-line pl-5 lg:border-l-0 lg:border-t lg:pl-0 lg:pr-6 lg:pt-6">
                <span className="absolute -left-[5px] top-0 size-2.5 bg-red lg:-top-[5px] lg:left-0" aria-hidden />
                <span className="t-number block text-5xl text-bone/15">{w.step}</span>
                <p className="mt-3 font-display text-xl font-bold uppercase leading-none [font-variation-settings:'wdth'_80]">
                  {w.title}
                </p>
                <p className="mt-2 text-sm text-paper-mute">{w.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
