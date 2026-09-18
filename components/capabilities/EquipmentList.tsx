import { supportingEquipment } from "@/data/capabilities";
import { MachineDiagram } from "./MachineDiagram";

export function EquipmentList() {
  return (
    <ol className="border-t border-line" data-reveal="stagger">
      {supportingEquipment.map((e) => (
        <li
          key={e.slug}
          className="group grid grid-cols-12 items-center gap-x-4 gap-y-3 border-b border-line py-6 transition-colors hover:bg-carbon md:gap-x-6 md:py-8"
        >
          <span className="t-label col-span-2 text-mute md:col-span-1">{e.number}</span>
          <h3 className="col-span-10 font-display text-[clamp(1.5rem,3vw,2.75rem)] font-extrabold uppercase leading-none [font-variation-settings:'wdth'_74] md:col-span-4">
            {e.name}
          </h3>
          <span className="t-label col-span-10 col-start-3 text-teal-light md:col-span-2 md:col-start-auto">
            {e.stage}
          </span>
          <p className="col-span-10 col-start-3 text-mute md:col-span-3 md:col-start-auto">{e.role}</p>
          <div className="hidden md:col-span-2 md:block">
            <MachineDiagram kind={e.diagram} className="ml-auto h-20 w-auto transition-colors group-hover:text-bone" />
          </div>
        </li>
      ))}
    </ol>
  );
}
