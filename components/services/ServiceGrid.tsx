import type { ServiceCategory } from "@/data/services";
import { ServiceCard } from "./ServiceCard";

/** Asymmetric editorial grid - first two services lead at a larger scale. */
export function ServiceGrid({ items }: { items: ServiceCategory[] }) {
  const [a, b, ...rest] = items;
  return (
    <div className="space-y-14 md:space-y-20">
      <div className="grid gap-x-6 gap-y-14 md:grid-cols-2">
        {a && <ServiceCard service={a} size="lg" headingLevel="h2" />}
        {b && <ServiceCard service={b} size="lg" headingLevel="h2" className="md:mt-24" />}
      </div>
      <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((s, i) => (
          <ServiceCard key={s.slug} service={s} headingLevel="h2" className={i % 3 === 1 ? "lg:mt-16" : undefined} />
        ))}
      </div>
    </div>
  );
}
