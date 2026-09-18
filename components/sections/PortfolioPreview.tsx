import Image from "next/image";
import Link from "next/link";
import { categoryLabel } from "@/data/portfolio";
import { getPortfolio } from "@/lib/content/store";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { IllustrativeTag } from "@/components/ui/Brand";
import { SectionHeading } from "@/components/ui/SectionHeading";

const layout = [
  "lg:col-span-6 lg:row-span-2",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-6",
];

const aspect = [
  "aspect-[4/5] lg:aspect-auto lg:min-h-[520px] lg:flex-1",
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-[16/9]",
];

export async function PortfolioPreview({ index = "05" }: { index?: string }) {
  const portfolio = await getPortfolio();
  const items = portfolio.slice(0, 4);
  const illustrative = items.some((i) => i.illustrative);
  return (
    <section aria-labelledby="portfolio-preview-title" className="section-y">
      <div className="container-x">
        <SectionHeading
          id="portfolio-preview-title"
          index={index}
          label="Portfolio"
          accent="amber"
          title={"Material\nstudies."}
          intro={illustrative ? "A visual index of finishes and techniques. Client project photography is being prepared; current visuals are illustrative studies." : "A visual index of finishes and techniques across our printing processes."}
          aside={
            <div className="mt-8">
              <Button href="/portfolio" variant="outline">
                View portfolio
              </Button>
            </div>
          }
        />

        <ul className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-12">
          {items.map((item, i) => (
            <li key={item.slug} className={cn("group relative flex flex-col", layout[i])}>
              <Link href={`/portfolio?item=${item.slug}`} className="flex flex-1 flex-col">
                <div
                  className={cn("relative overflow-hidden bg-graphite", aspect[i])}
                  data-reveal="clip"
                >
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes={i === 0 || i === 3 ? "(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
                    className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                  />
                  {item.illustrative && <IllustrativeTag className="absolute bottom-3 left-3" />}
                </div>
                <div className="flex items-baseline justify-between gap-4 pt-3">
                  <h3 className="font-display text-xl font-bold uppercase leading-none [font-variation-settings:'wdth'_80]">
                    {item.title}
                  </h3>
                  <span className="t-label text-mute">{categoryLabel(item.category)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
