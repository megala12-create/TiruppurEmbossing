import type { Metadata } from "next";
import { productionMachines, supportingEquipment } from "@/data/capabilities";
import { services } from "@/data/services";
import { buildMetadata } from "@/lib/seo";
import { EcosystemDiagram } from "@/components/capabilities/EcosystemDiagram";
import { EquipmentList } from "@/components/capabilities/EquipmentList";
import { MachineShowcase } from "@/components/capabilities/MachineShowcase";
import { PageTransition } from "@/components/motion/PageTransition";
import { CtaBand } from "@/components/sections/CtaBand";
import { ProductionSection } from "@/components/sections/ProductionSection";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RegMark } from "@/components/ui/Brand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitText } from "@/components/ui/SplitText";

export const metadata: Metadata = buildMetadata({
  title: "Capabilities: Machines & Production",
  description:
    "Production machinery and supporting equipment at Tiruppur Embossing: embossing, silicone, silicone HD, HD, DTF, sublimation, screen printing and heat transfer systems, with curing, screen preparation and QC.",
  path: "/capabilities",
});

export default function CapabilitiesPage() {
  const stats = [
    { value: productionMachines.length, label: "Production systems" },
    { value: supportingEquipment.length, label: "Supporting equipment" },
    { value: services.length, label: "Service categories" },
  ];

  return (
    <PageTransition>
      <section aria-labelledby="cap-title" className="relative overflow-hidden pt-28 lg:pt-36">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Capabilities", path: "/capabilities" }]} />
          <p className="t-label mt-10 flex gap-3 text-mute animate-fade lg:mt-14">
            <span className="text-bone">02</span> / Capabilities
          </p>
          <SplitText
            as="h1"
            id="cap-title"
            reveal="hero"
            text={"Built for detail.\nEquipped for\nproduction."}
            className="t-display mt-6"
            highlight={{ words: ["production."], className: "text-teal-light" }}
          />

          <div className="mt-14 grid gap-10 border-t border-line pt-8 lg:grid-cols-12">
            <p className="t-lead text-bone/85 lg:col-span-5 animate-fade [animation-delay:400ms]">
              A production ecosystem of print systems and supporting equipment, so sampling, combination designs and bulk
              runs are planned in one place.
            </p>
            <dl className="grid grid-cols-3 gap-6 lg:col-span-6 lg:col-start-7">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="t-label order-2 mt-3 text-mute">{s.label}</dt>
                  <dd className="t-number order-1 text-[clamp(3rem,7vw,6rem)]" data-count={s.value}>
                    {String(s.value).padStart(2, "0")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <RegMark className="absolute right-8 top-32 hidden lg:block" />
      </section>

      <section aria-labelledby="ecosystem-title" className="section-y">
        <div className="container-x">
          <SectionHeading
            id="ecosystem-title"
            index="01"
            label="Production ecosystem"
            accent="teal"
            title={"From artwork\nto dispatch."}
            intro="Each job moves through preparation, printing, finishing and quality checks. The process selected depends on the design, fabric and quantity."
          />
          <div className="mt-14 lg:mt-20">
            <EcosystemDiagram />
          </div>
        </div>
      </section>

      <section aria-label="Production machines">
        <div className="container-x mb-10 flex items-center justify-between gap-6">
          <p className="t-label text-mute">
            <span className="text-bone">02</span> / Production machines
          </p>
          <p className="t-label hidden text-mute md:block">Photography pending · schematic views shown</p>
        </div>
        <MachineShowcase />
      </section>

      <section aria-labelledby="equipment-title" className="section-y">
        <div className="container-x">
          <SectionHeading
            id="equipment-title"
            index="03"
            label="Supporting equipment"
            accent="amber"
            title={"The systems\naround the print."}
            intro="Preparation, curing, pressing and inspection equipment that supports consistent results across processes."
          />
          <div className="mt-14 lg:mt-20">
            <EquipmentList />
          </div>
        </div>
      </section>

      <ProductionSection index="04" />
      <CtaBand title="Bring us the brief." body="We'll match your design to the right system." />
    </PageTransition>
  );
}
