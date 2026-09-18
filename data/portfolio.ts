import type { PortfolioCategory } from "./services";

/**
 * Portfolio entries.
 *
 * Every current entry is an ILLUSTRATIVE generated material study and is
 * labelled as such in the UI. Replace with client project photography and set
 * `illustrative: false`. Do not present generated visuals as client work.
 */

export type PortfolioItem = {
  slug: string;
  title: string;
  category: PortfolioCategory;
  /** Related service slug for the detail link */
  service: string;
  summary: string;
  image: { src: string; width: number; height: number; alt: string };
  illustrative: boolean;
};

export const portfolioCategories: { id: PortfolioCategory; label: string }[] = [
  { id: "emboss", label: "Emboss" },
  { id: "silicone-hd", label: "Silicone HD" },
  { id: "hd", label: "HD" },
  { id: "dtf", label: "DTF" },
  { id: "sublimation", label: "Sublimation" },
  { id: "screen", label: "Screen Printing" },
  { id: "specialty", label: "Specialty" },
  { id: "transfers", label: "Transfers" },
  { id: "stickers", label: "Stickers" },
  { id: "combination", label: "Combination Printing" },
];

export const categoryLabel = (id: PortfolioCategory) =>
  portfolioCategories.find((c) => c.id === id)?.label ?? id;

const P = { width: 1000, height: 1250 };
const L = { width: 1200, height: 900 };
const S = { width: 1100, height: 1100 };

const item = (
  slug: string,
  title: string,
  category: PortfolioCategory,
  service: string,
  size: { width: number; height: number },
  summary: string,
  alt: string,
): PortfolioItem => ({
  slug,
  title,
  category,
  service,
  summary,
  image: { src: `/assets/portfolio/${slug}.webp`, alt, ...size },
  illustrative: true,
});

export const portfolio: PortfolioItem[] = [
  item("emboss-tonal-geometry", "Tonal Geometry", "emboss", "emboss-printing", P,
    "A material study of layered triangular relief: tone-on-tone texture with no added ink.",
    "Illustrative study: embossed nested triangles on graphite fabric"),
  item("silicone-teal-wave", "Teal Wave", "silicone-hd", "silicone-hd-printing", S,
    "Raised glossy silicone lines exploring height, flow and specular finish.",
    "Illustrative study: glossy teal silicone wave lines on black fabric"),
  item("dtf-full-colour-emblem", "Full-Colour Emblem", "dtf", "dtf-printing", P,
    "Digital full-colour gradients on film, studied against a light base fabric.",
    "Illustrative study: multi-colour printed film triangle on light fabric"),
  item("hd-halftone-gradient", "Halftone Gradient", "hd", "hd-printing", L,
    "Raised high-density dots building a tonal gradient across the surface.",
    "Illustrative study: raised teal halftone dots forming a gradient"),
  item("sublimation-aop-flow", "AOP Flow", "sublimation", "sublimation-printing", P,
    "Continuous all-over colour flowing through a polyester knit surface.",
    "Illustrative study: flowing red, orange and teal all-over print on mesh"),
  item("screen-cmyk-halftone", "Overprint Rosette", "screen", "screen-printing", S,
    "Three screen ink layers overlapping at different angles.",
    "Illustrative study: overlapping teal, red and amber halftone screen layers"),
  item("specialty-foil-flock", "Foil & Flock", "specialty", "specialty-printing", L,
    "Contrasting specialty finishes: reflective foil with glitter beside soft flock.",
    "Illustrative study: gold foil triangle and maroon flock circle on black fabric"),
  item("combination-emboss-silicone", "Relief Meets Gloss", "combination", "combination-printing", P,
    "Emboss relief, silicone lines and full-colour film combined in one composition.",
    "Illustrative study: embossed relief, teal silicone lines and colour film combined"),
  item("transfer-layered-film", "Layered Transfers", "transfers", "heat-transfer", S,
    "Overlapping transfer films with gloss and depth.",
    "Illustrative study: stacked teal, red and amber transfer films"),
  item("emboss-typographic-relief", "Typographic Relief", "emboss", "emboss-printing", L,
    "Raised bars studying how line weight reads when pressed into fabric.",
    "Illustrative study: embossed horizontal bars of varying length on dark fabric"),
  item("sticker-die-cut-set", "Die-Cut Set", "stickers", "sticker-printing", L,
    "A set of die-cut sticker forms with white borders and shadows.",
    "Illustrative study: circular, triangular and rectangular die-cut stickers"),
  item("silicone-amber-lines", "Amber Lines", "silicone-hd", "silicone-hd-printing", P,
    "Dense, raised silicone lines in a warm brand tone.",
    "Illustrative study: glossy orange silicone lines on black fabric"),
  item("hd-raised-dots", "Raised Dot Field", "hd", "hd-printing", S,
    "Large high-density dots with a domed, raised profile.",
    "Illustrative study: raised red high-density dots on dark fabric"),
  item("dtf-dark-garment", "Film on Dark", "dtf", "dtf-printing", L,
    "Full-colour film graphic studied on a dark base.",
    "Illustrative study: multi-colour circular film print on black fabric"),
  item("sublimation-sportswear-mesh", "Sportswear Mesh", "sublimation", "sublimation-printing", L,
    "Cool-toned sublimation colour through a sports mesh structure.",
    "Illustrative study: teal and amber sublimation colour on sports mesh"),
  item("screen-two-colour", "Two-Colour Screen", "screen", "screen-printing", P,
    "A restrained two-ink halftone on a light base fabric.",
    "Illustrative study: maroon and teal halftone screen print on light fabric"),
];
