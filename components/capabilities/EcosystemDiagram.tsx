import { productionFlow, productionMachines } from "@/data/capabilities";

/** Production ecosystem flow: brief → selection → preparation → print systems → finishing → QC → dispatch. */
export function EcosystemDiagram() {
  return (
    <figure>
      <ol className="relative grid gap-px bg-line lg:grid-cols-7" data-reveal="stagger" aria-label="Production flow">
        {productionFlow.map((step, i) => {
          const isPrint = step.id === "print";
          return (
            <li
              key={step.id}
              className={`relative flex flex-col gap-6 bg-ink p-5 lg:min-h-72 lg:p-6 ${isPrint ? "lg:col-span-1 bg-carbon" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="t-label text-mute">{String(i + 1).padStart(2, "0")}</span>
                <span className={`size-2 ${isPrint ? "bg-orange" : "bg-teal"}`} aria-hidden />
              </div>
              <p className="font-display text-xl font-bold uppercase leading-none [font-variation-settings:'wdth'_80]">
                {step.label}
              </p>
              {isPrint && (
                <ul className="mt-auto flex flex-wrap gap-1.5" aria-label="Print systems">
                  {productionMachines.map((m) => (
                    <li key={m.slug} className="t-label border border-line px-1.5 py-1 text-[0.55rem] text-bone/80">
                      {m.name}
                    </li>
                  ))}
                </ul>
              )}
              {i < productionFlow.length - 1 && (
                <span
                  className="absolute -bottom-3 left-8 z-10 flex size-6 items-center justify-center bg-ink text-red lg:-right-3 lg:bottom-auto lg:left-auto lg:top-8"
                  aria-hidden
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" className="rotate-90 fill-current lg:rotate-0">
                    <path d="M0 0 10 5 0 10z" />
                  </svg>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <figcaption className="t-label mt-4 text-mute">Fig. Typical production flow across the ecosystem</figcaption>
    </figure>
  );
}
