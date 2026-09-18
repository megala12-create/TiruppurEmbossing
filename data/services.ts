/**
 * Service taxonomy - the single source of truth for every service surface
 * (home list, /services, /services/[slug], quote form, footer, sitemap).
 *
 * Content rules (from the build specification):
 * - Do not invent technical specifications, MOQ, pricing, wash results or
 *   fabric guarantees. Where suitability is unknown, use careful wording.
 * - `image` visuals are generated, illustrative material studies - NOT client
 *   work. Replace with client photography and set `illustrative: false`.
 */

export type Accent = "teal" | "red" | "orange" | "amber" | "maroon";

export type PortfolioCategory =
  | "emboss"
  | "silicone-hd"
  | "hd"
  | "dtf"
  | "sublimation"
  | "screen"
  | "specialty"
  | "transfers"
  | "stickers"
  | "combination";

export type ServiceImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** true when the visual is a generated material study rather than client photography */
  illustrative: boolean;
};

export type ServiceCategory = {
  slug: string;
  number: string;
  title: string;
  /** Short name for chips, selects and compact lists */
  shortTitle: string;
  /** Positioning statement shown under the title on the detail page */
  tagline: string;
  shortDescription: string;
  /** "What it is" - paragraphs */
  description: string[];
  /** Technical process label, e.g. "Heat · Pressure · Mould" */
  process: string[];
  subServices: string[];
  applications: string[];
  materialConsiderations: string[];
  productionConsiderations: string[];
  portfolioCategory?: PortfolioCategory;
  related: string[];
  accent: Accent;
  image: ServiceImage;
  /** Optional page-specific feature block */
  feature?: "placement-diagram";
};

const SUITABILITY =
  "Suitability depends on fabric composition, design and production requirements.";

const img = (slug: string, alt: string): ServiceImage => ({
  src: `/assets/services/${slug}.webp`,
  alt,
  width: 1600,
  height: 1200,
  illustrative: true,
});

export const services: ServiceCategory[] = [
  {
    slug: "emboss-printing",
    number: "01",
    title: "Emboss Printing",
    shortTitle: "Emboss",
    tagline: "Texture you can feel: raised and recessed detail pressed directly into fabric.",
    shortDescription:
      "Raised or recessed patterns created on fabric using heat, pressure and custom moulds.",
    description: [
      "Emboss printing creates dimensional patterns on fabric using heat, pressure and a custom mould. Instead of adding a visible ink layer, the design is formed into the fabric surface itself, giving logos, text and graphics a tactile, tone-on-tone presence.",
      "It can be used on its own for a subtle premium finish, or combined with other print techniques such as DTF or silicone to add colour and depth to the same artwork.",
    ],
    process: ["Heat", "Pressure", "Custom mould"],
    subServices: ["Basic Emboss", "3D Emboss", "Raised Emboss", "Logo Emboss", "Text Emboss", "Fashion Emboss"],
    applications: [
      "Brand logos and monograms",
      "Typographic and text-led designs",
      "Fashion and premium casual wear",
      "Tone-on-tone and minimal graphics",
      "Combination designs with colour prints",
    ],
    materialConsiderations: [
      "Emboss definition and depth are influenced by fabric weight, knit or weave structure and fibre composition.",
      "Heat and pressure behaviour differ between fabrics, so settings are confirmed during sampling.",
      SUITABILITY,
    ],
    productionConsiderations: [
      "A custom mould is typically prepared for the design before sampling.",
      "Artwork detail, line thickness and placement size affect how clearly the emboss reads.",
      "Sample approval is recommended before bulk production.",
    ],
    portfolioCategory: "emboss",
    related: ["combination-printing", "silicone-hd-printing", "hd-printing"],
    accent: "maroon",
    image: img("emboss-printing", "Illustrative material study: tone-on-tone embossed triangular relief pattern on dark woven fabric"),
  },
  {
    slug: "silicone-hd-printing",
    number: "02",
    title: "Silicone HD Printing",
    shortTitle: "Silicone HD",
    tagline: "Raised, flexible silicone surfaces with a crisp, high-definition edge.",
    shortDescription:
      "High-density silicone-based inks that build raised, flexible print surfaces in glossy, matte or soft finishes.",
    description: [
      "Silicone HD printing uses high-density silicone-based inks to build a raised print surface on the garment. The result is a dimensional, flexible print with clean edges, well suited to logos, badges and bold graphic details.",
      "Finish can be tuned to the design direction: glossy for a high-shine technical look, matte for an understated finish, or soft for a smoother hand feel.",
    ],
    process: ["Silicone ink", "Layer build", "Curing"],
    subServices: ["Silicone HD", "Silicone 3D", "Glossy Silicone", "Matte Silicone", "Soft Silicone", "High-Density Silicone"],
    applications: [
      "Sportswear and athleisure branding",
      "Chest logos and badges",
      "Raised typographic details",
      "Performance and technical garment trims",
      "Fashion graphics with dimensional finish",
    ],
    materialConsiderations: [
      "Adhesion and stretch behaviour vary with fabric composition and surface finish.",
      "Stretch fabrics and coated fabrics should be reviewed with a sample before bulk.",
      SUITABILITY,
    ],
    productionConsiderations: [
      "Height, finish (glossy, matte or soft) and edge sharpness are confirmed during sampling.",
      "Very fine details may need artwork adjustment to hold their shape when raised.",
      "Curing is part of the production process and is planned into timelines.",
    ],
    portfolioCategory: "silicone-hd",
    related: ["hd-printing", "combination-printing", "emboss-printing"],
    accent: "teal",
    image: img("silicone-hd-printing", "Illustrative material study: glossy raised teal silicone lines on black fabric"),
  },
  {
    slug: "hd-printing",
    number: "03",
    title: "HD / High-Density Printing",
    shortTitle: "HD Print",
    tagline: "Built-up ink layers for sharp, raised and highly defined graphics.",
    shortDescription:
      "High-density ink layers that create raised, sharply defined print surfaces with strong visual presence.",
    description: [
      "High-density (HD) printing builds ink in controlled layers to create a raised print with sharp, defined edges. It gives graphics a structured, premium surface that stands off the fabric.",
      "HD print is often chosen for logos, numbers and bold graphic elements, and can be paired with silicone or screen printing within the same design.",
    ],
    process: ["Layered ink", "Raised profile", "Curing"],
    subServices: ["HD Print", "High-Density Print", "Raised HD"],
    applications: [
      "Logos and brand marks",
      "Bold graphic and geometric artwork",
      "Numbers and lettering",
      "Streetwear and fashion graphics",
    ],
    materialConsiderations: [
      "Raised height and edge definition depend on fabric surface, weight and composition.",
      SUITABILITY,
    ],
    productionConsiderations: [
      "Layer count and height are agreed during sampling against the artwork.",
      "Artwork with very thin lines may require adjustment for high-density application.",
      "Sample approval is recommended before bulk production.",
    ],
    portfolioCategory: "hd",
    related: ["silicone-hd-printing", "screen-printing", "combination-printing"],
    accent: "amber",
    image: img("hd-printing", "Illustrative material study: raised amber and orange halftone dots on dark fabric"),
  },
  {
    slug: "dtf-printing",
    number: "04",
    title: "DTF Printing",
    shortTitle: "DTF",
    tagline: "Full-colour digital transfers, from single logos to production runs.",
    shortDescription:
      "Digital Transfer Film printing: designs printed on PET film, finished with adhesive and heat-pressed onto garments.",
    description: [
      "DTF (Digital Transfer Film) printing reproduces full-colour artwork digitally on PET film. The printed film is finished with an adhesive layer and then applied to the garment using a heat press.",
      "Because the artwork is printed digitally, DTF handles gradients, photographic detail and multi-colour designs without separate screens for each colour, making it flexible for both small quantities and bulk production.",
    ],
    process: ["Digital print", "PET film", "Adhesive powder", "Heat press"],
    subServices: ["DTF Full Colour", "DTF Logo", "DTF Photo Print", "DTF Small Quantity", "DTF Bulk Production"],
    applications: [
      "Full-colour and photographic artwork",
      "Multi-colour logos",
      "Short runs and sampling",
      "Bulk production orders",
      "Designs combined with emboss or silicone",
    ],
    materialConsiderations: [
      "DTF can be applied to a range of fabrics; hand feel and adhesion vary with fabric composition and texture.",
      "Heat-sensitive fabrics should be reviewed before production.",
      SUITABILITY,
    ],
    productionConsiderations: [
      "Artwork resolution and colour setup directly affect print sharpness.",
      "Film printing, powdering, curing and pressing are all part of the production flow.",
      "Quantity (sampling, small runs or bulk) is confirmed at quotation.",
    ],
    portfolioCategory: "dtf",
    related: ["heat-transfer", "combination-printing", "sticker-printing"],
    accent: "orange",
    image: img("dtf-printing", "Illustrative material study: full-colour printed film emblem on light fabric"),
  },
  {
    slug: "sublimation-printing",
    number: "05",
    title: "Sublimation Printing",
    shortTitle: "Sublimation",
    tagline: "Colour carried into the fibre, for all-over prints and sportswear.",
    shortDescription:
      "Heat transfers inks into polyester or polymer-coated surfaces for vibrant, all-over colour.",
    description: [
      "Sublimation printing uses heat to transfer inks into polyester or polymer-coated surfaces. Instead of sitting on top as a separate layer, the colour becomes part of the fabric surface.",
      "It is widely used for all-over prints (AOP), cut-panel printing and sportswear, where continuous colour and full-coverage designs are required.",
    ],
    process: ["Printed transfer", "Heat", "Polyester surface"],
    subServices: [
      "Cut-Panel Sublimation",
      "All-Over Print (AOP) Sublimation",
      "Sportswear Sublimation",
      "Jersey Printing",
      "Polyester Printing",
    ],
    applications: [
      "Sports jerseys and team kits",
      "All-over print garments",
      "Cut-panel fashion and activewear",
      "Polyester uniforms and promotional wear",
    ],
    materialConsiderations: [
      "Sublimation is suited to polyester or polymer-coated surfaces; colour vibrancy depends on polyester content.",
      "Fabric colour affects the final result; sublimation is generally planned on white or light base fabrics.",
      SUITABILITY,
    ],
    productionConsiderations: [
      "Cut-panel and all-over formats are planned differently; share garment type and panel details at enquiry.",
      "Colour matching to a reference is reviewed during sampling.",
    ],
    portfolioCategory: "sublimation",
    related: ["dtf-printing", "screen-printing", "placement-printing"],
    accent: "red",
    image: img("sublimation-printing", "Illustrative material study: flowing multi-colour all-over print on polyester mesh"),
  },
  {
    slug: "screen-printing",
    number: "06",
    title: "Screen Printing",
    shortTitle: "Screen",
    tagline: "The production workhorse: ink through mesh, colour by colour.",
    shortDescription:
      "Ink pressed through prepared mesh screens, one colour at a time, across water-based, plastisol, discharge and pigment systems.",
    description: [
      "Screen printing transfers ink through a prepared mesh screen onto the garment, with a separate screen for each colour. It is a versatile process suited to repeat production and a wide range of ink systems.",
      "Different ink types create different results, from soft water-based and discharge prints to opaque plastisol and raised high-density screen effects.",
    ],
    process: ["Screen exposure", "Mesh", "Ink per colour", "Curing"],
    subServices: [
      "Basic Screen Print",
      "Multicolour Screen",
      "Water-Based",
      "Plastisol",
      "Discharge",
      "Pigment",
      "High-Density Screen",
    ],
    applications: [
      "Repeat production runs",
      "Spot-colour logos and graphics",
      "Soft-hand prints on cotton garments",
      "Multicolour artwork",
      "Combination with foil or HD effects",
    ],
    materialConsiderations: [
      "Ink system selection (water-based, plastisol, discharge, pigment) depends on fabric type and colour.",
      "Discharge printing depends on fabric dye and composition and should be sampled first.",
      SUITABILITY,
    ],
    productionConsiderations: [
      "Each colour typically requires its own screen, so colour count influences setup.",
      "Screens are exposed and prepared before printing; flash drying and curing are part of the flow.",
      "Pantone or reference-sample matching is reviewed during sampling.",
    ],
    portfolioCategory: "screen",
    related: ["hd-printing", "specialty-printing", "combination-printing"],
    accent: "teal",
    image: img("screen-printing", "Illustrative material study: overlapping teal, red and amber halftone ink layers"),
  },
  {
    slug: "specialty-printing",
    number: "07",
    title: "Specialty Printing",
    shortTitle: "Specialty",
    tagline: "Finishes that change how a print catches light and feels to the touch.",
    shortDescription:
      "Puff, flock, foil, glitter, reflective, metallic and shimmer effects for statement finishes.",
    description: [
      "Specialty printing covers finishes that go beyond flat colour, adding texture, shine or reflectivity to a design. Puff and flock add touch; foil, metallic, glitter and shimmer add light; reflective finishes add visibility.",
      "Specialty effects can be used as the hero of a design or as accents layered with screen, HD or transfer prints.",
    ],
    process: ["Effect medium", "Application", "Heat / curing"],
    subServices: ["Puff", "Flock", "Foil", "Glitter", "Reflective", "Metallic", "Shimmer"],
    applications: [
      "Fashion and statement graphics",
      "Premium logo accents",
      "Kidswear and seasonal collections",
      "Reflective details for visibility-focused garments",
    ],
    materialConsiderations: [
      "Each specialty effect behaves differently across fabrics; hand feel and appearance vary with composition.",
      "Reflective and foil finishes should be sampled on the actual production fabric.",
      SUITABILITY,
    ],
    productionConsiderations: [
      "Effect choice, coverage area and combination with other prints are confirmed at sampling.",
      "Some effects are applied as a secondary process after the base print.",
    ],
    portfolioCategory: "specialty",
    related: ["screen-printing", "heat-transfer", "combination-printing"],
    accent: "amber",
    image: img("specialty-printing", "Illustrative material study: gold foil triangle with glitter and maroon flock circle on black fabric"),
  },
  {
    slug: "heat-transfer",
    number: "08",
    title: "Heat Transfer",
    shortTitle: "Heat Transfer",
    tagline: "Pre-produced transfers, applied cleanly with heat and pressure.",
    shortDescription:
      "TPU, vinyl/HTV, DTF and specialty transfers applied to garments with heat presses.",
    description: [
      "Heat transfer printing applies a pre-produced design (such as a TPU, vinyl/HTV, DTF or specialty transfer) onto the garment using controlled heat and pressure.",
      "Transfers make it possible to produce design elements separately from the garment and apply them precisely at the placement stage, including dimensional options such as 3D TPU transfers.",
    ],
    process: ["Transfer production", "Placement", "Heat press"],
    subServices: ["TPU Transfer", "Heat Transfer", "Vinyl / HTV", "DTF Transfer", "Specialty Transfer"],
    applications: [
      "Logos, labels and brand badges",
      "Numbers and names",
      "3D and dimensional TPU details",
      "Transfers supplied for garment application",
    ],
    materialConsiderations: [
      "Transfer adhesion depends on fabric composition, texture and heat tolerance.",
      SUITABILITY,
    ],
    productionConsiderations: [
      "Transfer type is selected based on the design, finish and garment.",
      "Application settings are confirmed during sampling on the production fabric.",
    ],
    portfolioCategory: "transfers",
    related: ["dtf-printing", "sticker-printing", "specialty-printing"],
    accent: "red",
    image: img("heat-transfer", "Illustrative material study: layered teal, red and amber transfer films on dark fabric"),
  },
  {
    slug: "sticker-printing",
    number: "09",
    title: "Sticker Printing",
    shortTitle: "Stickers",
    tagline: "Garment, transfer and custom stickers produced for brands and production lines.",
    shortDescription:
      "Garment stickers, transfer stickers, glass/table stickers and custom printed stickers.",
    description: [
      "Sticker printing covers printed stickers for garments and transfers, as well as glass, table and custom printed stickers for brand and retail use.",
      "Transfer stickers allow designs to be prepared in advance and applied to garments with heat, supporting consistent placement across production.",
    ],
    process: ["Print", "Cut", "Apply"],
    subServices: ["Garment Stickers", "Transfer Stickers", "Glass / Table Stickers", "Custom Printed Stickers"],
    applications: [
      "Garment branding and trims",
      "Transfer stickers for production application",
      "Glass and table stickers for retail or events",
      "Custom stickers for packaging and promotion",
    ],
    materialConsiderations: [
      "Sticker material and adhesive are chosen based on the surface they will be applied to.",
      SUITABILITY,
    ],
    productionConsiderations: [
      "Size, shape, quantity and application surface are confirmed at quotation.",
      "Samples are recommended for new garment or surface types.",
    ],
    portfolioCategory: "stickers",
    related: ["heat-transfer", "dtf-printing", "placement-printing"],
    accent: "orange",
    image: img("sticker-printing", "Illustrative material study: die-cut stickers with white borders on a graphite surface"),
  },
  {
    slug: "combination-printing",
    number: "10",
    title: "Combination / Value-Added Printing",
    shortTitle: "Combination",
    tagline: "Two techniques, one design, layered for depth, colour and texture.",
    shortDescription:
      "Value-added designs that combine techniques such as DTF with emboss, silicone with DTF, or foil with screen.",
    description: [
      "Combination printing brings more than one technique together in a single design. For example, a full-colour DTF print framed by embossed texture, or a screen print lifted with HD or foil accents.",
      "Working with multiple printing technologies under one production ecosystem makes it practical to plan layered, value-added designs from sampling through to bulk.",
    ],
    process: ["Technique A", "Registration", "Technique B"],
    subServices: ["DTF + Emboss", "Silicone + DTF", "HD + Silicone", "Screen + HD", "Foil + Screen", "Digital + Specialty"],
    applications: [
      "Premium brand and fashion collections",
      "Logos with both colour and texture",
      "Statement graphics with layered effects",
      "Value-added versions of existing designs",
    ],
    materialConsiderations: [
      "Each technique in the combination must suit the fabric; the most sensitive process sets the limits.",
      SUITABILITY,
    ],
    productionConsiderations: [
      "Process order and registration between techniques are planned before sampling.",
      "Combination designs typically need sample approval before bulk production.",
    ],
    portfolioCategory: "combination",
    related: ["emboss-printing", "silicone-hd-printing", "dtf-printing"],
    accent: "maroon",
    image: img("combination-printing", "Illustrative material study: embossed relief meeting teal silicone lines and a full-colour film triangle"),
  },
  {
    slug: "placement-printing",
    number: "11",
    title: "Placement Printing",
    shortTitle: "Placement",
    tagline: "The right print, in the right position, from left chest to leg.",
    shortDescription:
      "Positioned prints across chest, front, back, sleeve, neck, pocket, bottom and leg placements.",
    description: [
      "Placement printing is about where the print lands on the garment. Position, size and orientation are planned for each placement, from a small left-chest logo to a full back print or a leg detail.",
      "Placements can be produced using the printing technique that best suits the design, and multiple placements can be combined on the same garment.",
    ],
    process: ["Position", "Size", "Technique"],
    subServices: ["Chest", "Left Chest", "Right Chest", "Front", "Back", "Sleeve", "Neck", "Pocket", "Bottom", "Leg"],
    applications: [
      "T-shirts, polos and sweatshirts",
      "Uniforms and corporate wear",
      "Sportswear and team kits",
      "Bottoms and joggers (leg placements)",
    ],
    materialConsiderations: [
      "Seams, pockets and garment construction can limit print size at some placements.",
      SUITABILITY,
    ],
    productionConsiderations: [
      "Share placement, print size and garment size range at enquiry.",
      "Placement is confirmed on the sample before bulk production.",
    ],
    related: ["screen-printing", "dtf-printing", "heat-transfer"],
    accent: "amber",
    image: img("placement-printing", "Illustrative diagram: T-shirt silhouette with dashed placement markers on chest, front, sleeve and bottom"),
    feature: "placement-diagram",
  },
];

export const serviceSlugs = services.map((s) => s.slug);

export const getService = (slug: string) => services.find((s) => s.slug === slug);

export const getRelatedServices = (service: ServiceCategory) =>
  service.related.map(getService).filter((s): s is ServiceCategory => Boolean(s));

export const getAdjacentServices = (slug: string) => {
  const i = services.findIndex((s) => s.slug === slug);
  return {
    prev: services[(i - 1 + services.length) % services.length],
    next: services[(i + 1) % services.length],
  };
};

export const totalVariations = services.reduce((n, s) => n + s.subServices.length, 0);

export const numberWord = (n: number) =>
  ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"][n] ??
  String(n);
