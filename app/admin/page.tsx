import type { Metadata } from "next";
import { productionMachines } from "@/data/capabilities";
import { portfolioCategories } from "@/data/portfolio";
import { services as defaultServices } from "@/data/services";
import { adminConfigured, isAdmin } from "@/lib/admin/auth";
import { listEnquiries } from "@/lib/admin/enquiries";
import { getPortfolio, readContent } from "@/lib/content/store";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/** Password-protected photo manager. Intentionally not linked from any page. */
export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin configured={adminConfigured()} />;

  const content = await readContent();
  const samples = await getPortfolio();
  const enquiries = await listEnquiries();

  const services = defaultServices.map((s) => {
    const custom = content.services[s.slug];
    return {
      kind: "services" as const,
      slug: s.slug,
      number: s.number,
      title: s.title,
      image: custom ?? { src: s.image.src, alt: s.image.alt, width: s.image.width, height: s.image.height },
      custom: Boolean(custom),
    };
  });

  const machines = productionMachines.map((m) => ({
    kind: "machines" as const,
    slug: m.slug,
    number: `Sys. ${m.number}`,
    title: m.name,
    image: content.machines[m.slug],
    custom: Boolean(content.machines[m.slug]),
  }));

  return (
    <AdminDashboard
      enquiries={enquiries}
      services={services}
      machines={machines}
      samples={samples}
      categories={portfolioCategories.map((c) => ({ id: c.id, label: c.label }))}
      serviceOptions={defaultServices.map((s) => ({ id: s.slug, label: s.title }))}
    />
  );
}
