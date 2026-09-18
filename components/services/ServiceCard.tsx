import Image from "next/image";
import Link from "next/link";
import type { ServiceCategory } from "@/data/services";
import { cn } from "@/lib/cn";
import { IllustrativeTag } from "@/components/ui/Brand";
import { ArrowUpRight } from "@/components/ui/Icons";

/** Editorial service tile - sharp edges, image-led, whole tile is one link. */
export function ServiceCard({
  service,
  size = "md",
  className,
  headingLevel = "h3",
}: {
  service: ServiceCategory;
  size?: "md" | "lg";
  className?: string;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div
        className={cn(
          "relative overflow-hidden bg-graphite",
          size === "lg" ? "aspect-[4/3] lg:aspect-[16/11]" : "aspect-[4/3]",
        )}
        data-reveal="clip"
      >
        <Image
          src={service.image.src}
          alt={service.image.alt}
          fill
          sizes={size === "lg" ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
        <span className="t-number absolute right-4 top-3 text-[clamp(3rem,6vw,5.5rem)] text-white [text-shadow:0_2px_24px_rgba(0,0,0,.45)]">
          {service.number}
        </span>
        {service.image.illustrative && <IllustrativeTag className="absolute bottom-3 left-3" />}
      </div>

      <div className="flex flex-1 flex-col border-b border-line py-5">
        <div className="flex items-start justify-between gap-4">
          <Heading
            className={cn(
              "font-display font-extrabold uppercase leading-[0.95] [font-variation-settings:'wdth'_74]",
              size === "lg" ? "text-[clamp(1.8rem,3vw,3rem)]" : "text-[clamp(1.5rem,2.2vw,2.1rem)]",
            )}
          >
            <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0">
              {service.title}
            </Link>
          </Heading>
          <span
            className="mt-1 flex size-10 shrink-0 items-center justify-center border border-line transition-colors duration-500 group-hover:border-red group-hover:bg-red group-hover:text-white"
            aria-hidden
          >
            <ArrowUpRight size={18} />
          </span>
        </div>
        <p className="mt-3 max-w-prose text-sm text-mute">{service.shortDescription}</p>
        <p className="t-label mt-4 text-mute">
          <span className="text-bone">{String(service.subServices.length).padStart(2, "0")}</span> variations ·{" "}
          {service.process.join(" · ")}
        </p>
      </div>
    </article>
  );
}
