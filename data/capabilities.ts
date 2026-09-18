/**
 * Production machinery and supporting equipment.
 *
 * Machine brands, models, counts and capacities are intentionally NOT listed -
 * they have not been verified. Machine photography is pending: `photo` is
 * undefined and the UI renders a clearly-marked technical diagram placeholder.
 * TODO(client): supply machine photos → public/assets/machines/<slug>.webp
 */

export type DiagramKind =
  | "press"
  | "silicone"
  | "layers"
  | "dtf"
  | "calender"
  | "carousel"
  | "shaker"
  | "oven"
  | "exposure"
  | "washout"
  | "flash"
  | "qc";

export type Machine = {
  slug: string;
  number: string;
  name: string;
  summary: string;
  labels: string[];
  diagram: DiagramKind;
  services: string[];
  photo?: { src: string; alt: string; width: number; height: number };
};

export type Equipment = {
  slug: string;
  number: string;
  name: string;
  role: string;
  stage: "Film" | "Curing" | "Application" | "Screen prep" | "Quality";
  diagram: DiagramKind;
};

export const productionMachines: Machine[] = [
  {
    slug: "embossing",
    number: "01",
    name: "Embossing",
    summary: "Heat-and-pressure systems used with custom moulds to form raised and recessed texture in fabric.",
    labels: ["Heat", "Pressure", "Mould"],
    diagram: "press",
    services: ["emboss-printing", "combination-printing"],
  },
  {
    slug: "silicone",
    number: "02",
    name: "Silicone",
    summary: "Silicone print application for flexible, dimensional print surfaces.",
    labels: ["Silicone ink", "Flexible", "Raised"],
    diagram: "silicone",
    services: ["silicone-hd-printing"],
  },
  {
    slug: "silicone-hd",
    number: "03",
    name: "Silicone HD",
    summary: "High-density silicone builds for sharper edges, height and glossy, matte or soft finishes.",
    labels: ["High density", "Layer build", "Finish control"],
    diagram: "layers",
    services: ["silicone-hd-printing", "combination-printing"],
  },
  {
    slug: "hd",
    number: "04",
    name: "HD",
    summary: "High-density printing for raised, defined graphics with a structured surface.",
    labels: ["Layered ink", "Raised profile"],
    diagram: "layers",
    services: ["hd-printing"],
  },
  {
    slug: "dtf",
    number: "05",
    name: "DTF",
    summary: "Digital printing onto PET film for full-colour transfers, from small quantities to bulk.",
    labels: ["Digital", "PET film", "Full colour"],
    diagram: "dtf",
    services: ["dtf-printing", "heat-transfer"],
  },
  {
    slug: "sublimation",
    number: "06",
    name: "Sublimation",
    summary: "Heat transfer of inks into polyester and polymer-coated surfaces for cut-panel and all-over prints.",
    labels: ["Heat", "Polyester", "All-over"],
    diagram: "calender",
    services: ["sublimation-printing"],
  },
  {
    slug: "screen-printing",
    number: "07",
    name: "Screen Printing",
    summary: "Mesh-screen printing across water-based, plastisol, discharge, pigment and high-density systems.",
    labels: ["Mesh", "Colour per screen", "Multi-ink"],
    diagram: "carousel",
    services: ["screen-printing", "specialty-printing"],
  },
  {
    slug: "heat-transfer",
    number: "08",
    name: "Heat Transfer",
    summary: "Controlled heat-press application for TPU, vinyl/HTV, DTF and specialty transfers.",
    labels: ["Heat press", "Transfers", "Placement"],
    diagram: "press",
    services: ["heat-transfer", "sticker-printing", "placement-printing"],
  },
];

export const supportingEquipment: Equipment[] = [
  {
    slug: "dtf-powder-shaker",
    number: "01",
    name: "DTF Powder Shaker",
    role: "Applies adhesive powder evenly across printed DTF film.",
    stage: "Film",
    diagram: "shaker",
  },
  {
    slug: "curing-oven",
    number: "02",
    name: "Curing Oven",
    role: "Cures inks and adhesive layers as part of the print finishing process.",
    stage: "Curing",
    diagram: "oven",
  },
  {
    slug: "heat-press",
    number: "03",
    name: "Heat Press",
    role: "Applies controlled heat and pressure for transfers, DTF and embossing work.",
    stage: "Application",
    diagram: "press",
  },
  {
    slug: "screen-exposure",
    number: "04",
    name: "Screen Exposure",
    role: "Exposes artwork onto coated screens to prepare stencils for screen printing.",
    stage: "Screen prep",
    diagram: "exposure",
  },
  {
    slug: "screen-washing",
    number: "05",
    name: "Screen Washing",
    role: "Washes out and cleans screens during preparation and between jobs.",
    stage: "Screen prep",
    diagram: "washout",
  },
  {
    slug: "flash-dryer",
    number: "06",
    name: "Flash Dryer",
    role: "Sets ink layers between screen passes, supporting multi-layer and multi-colour prints.",
    stage: "Curing",
    diagram: "flash",
  },
  {
    slug: "qc-equipment",
    number: "07",
    name: "QC Equipment",
    role: "Supports inspection of print quality, placement and finish before dispatch.",
    stage: "Quality",
    diagram: "qc",
  },
];

/** Production flow used by the ecosystem diagram. */
export const productionFlow = [
  { id: "artwork", label: "Artwork & brief" },
  { id: "process", label: "Process selection" },
  { id: "prep", label: "Screens · moulds · film" },
  { id: "print", label: "Print systems" },
  { id: "cure", label: "Curing & finishing" },
  { id: "qc", label: "Quality check" },
  { id: "dispatch", label: "Dispatch" },
];
