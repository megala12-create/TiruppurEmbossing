import { productionMachines, supportingEquipment } from "@/data/capabilities";
import { services, totalVariations } from "@/data/services";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitText } from "@/components/ui/SplitText";

/** Editorial statement + data-derived counters (every number is computed from site data). */
export function IntroStatement() {
  const stats = [
    { value: services.length, label: "Service categories" },
    { value: totalVariations, label: "Print variations" },
    { value: productionMachines.length, label: "Production systems" },
    { value: supportingEquipment.length, label: "Supporting equipment types" },
  ];

  return (
    <section id="intro" aria-labelledby="intro-title" className="section-y relative scroll-mt-20">
      <div className="container-x">
        <SectionLabel index="01" label="Overview" accent="maroon" className="mb-10 md:mb-14" />

        <SplitText
          id="intro-title"
          as="h2"
          text={"From texture to transfer.\nFrom detail to production."}
          className="t-h1 max-w-[18ch]"
          highlight={{ words: ["texture", "production."], className: "text-mute" }}
        />

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:col-start-2" data-reveal="fade">
            <p className="t-lead text-bone/85">
              Tiruppur Embossing brings multiple printing technologies together under one production ecosystem: emboss,
              silicone HD, high-density, DTF, sublimation, screen, specialty and transfer printing.
            </p>
            <p className="mt-5 text-mute">
              That means one partner can recommend the right process for a design, combine techniques when a garment needs
              both colour and texture, and carry approved samples through to production.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-px self-start bg-line lg:col-span-5 lg:col-start-8" data-reveal="stagger">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col justify-between gap-6 bg-ink p-5 md:p-7">
                <dt className="t-label order-2 text-mute">{s.label}</dt>
                <dd className="t-number order-1 text-[clamp(3.5rem,7vw,6.5rem)]" data-count={s.value}>
                  {String(s.value).padStart(2, "0")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
