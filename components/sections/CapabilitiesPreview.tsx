import Link from "next/link";
import { productionMachines, supportingEquipment } from "@/data/capabilities";
import { numberWord } from "@/data/services";
import { MachineDiagram } from "@/components/capabilities/MachineDiagram";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function CapabilitiesPreview() {
  return (
    <section aria-labelledby="cap-preview-title" className="section-y border-t border-line bg-carbon">
      <div className="container-x">
        <SectionHeading
          id="cap-preview-title"
          index="03"
          label="Capabilities"
          accent="teal"
          title={`One ecosystem.\n${numberWord(productionMachines.length)} print systems.`}
          intro={`Production machines supported by ${supportingEquipment.length} types of equipment for screen preparation, film finishing, curing, pressing and quality checks.`}
          aside={
            <div className="mt-8">
              <Button href="/capabilities" variant="outline">
                View capabilities
              </Button>
            </div>
          }
        />

        <ul className="mt-16 grid grid-cols-2 gap-px bg-line lg:mt-24 lg:grid-cols-4" data-reveal="stagger">
          {productionMachines.map((m) => (
            <li key={m.slug} className="group relative bg-carbon">
              <Link href="/capabilities" className="flex h-full flex-col gap-3 p-4 transition-colors hover:bg-graphite md:gap-4 md:p-7">
                <div className="flex items-center justify-between">
                  <span className="t-label text-mute">Sys. {m.number}</span>
                  <span className="size-1.5 bg-teal transition-colors group-hover:bg-red" aria-hidden />
                </div>
                <MachineDiagram kind={m.diagram} className="my-2 w-full transition-colors duration-500 group-hover:text-bone" />
                <h3 className="font-display text-lg font-extrabold md:text-2xl uppercase leading-none [font-variation-settings:'wdth'_76]">
                  {m.name}
                </h3>
                <p className="t-label text-mute">{m.labels.join(" · ")}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
