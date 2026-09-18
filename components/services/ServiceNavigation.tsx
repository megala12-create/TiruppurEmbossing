import Link from "next/link";
import { getAdjacentServices } from "@/data/services";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";

/** Previous / next service navigation. */
export function ServiceNavigation({ slug }: { slug: string }) {
  const { prev, next } = getAdjacentServices(slug);
  return (
    <nav aria-label="More services" className="grid border-y border-line md:grid-cols-2">
      <Link
        href={`/services/${prev.slug}`}
        className="group flex min-h-40 flex-col justify-between gap-6 border-b border-line p-6 transition-colors hover:bg-carbon md:border-b-0 md:border-r md:p-10"
      >
        <span className="t-label flex items-center gap-3 text-mute">
          <ArrowLeft size={16} className="transition-transform duration-500 group-hover:-translate-x-1" />
          Previous · {prev.number}
        </span>
        <span className="font-display text-[clamp(1.6rem,3.2vw,3.2rem)] font-extrabold uppercase leading-[0.95] [font-variation-settings:'wdth'_72]">
          {prev.title}
        </span>
      </Link>
      <Link
        href={`/services/${next.slug}`}
        className="group flex min-h-40 flex-col justify-between gap-6 p-6 text-right transition-colors hover:bg-carbon md:p-10"
      >
        <span className="t-label flex items-center justify-end gap-3 text-mute">
          Next · {next.number}
          <ArrowRight size={16} className="transition-transform duration-500 group-hover:translate-x-1" />
        </span>
        <span className="font-display text-[clamp(1.6rem,3.2vw,3.2rem)] font-extrabold uppercase leading-[0.95] [font-variation-settings:'wdth'_72]">
          {next.title}
        </span>
      </Link>
    </nav>
  );
}
