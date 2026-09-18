import type { Metadata } from "next";
import Link from "next/link";
import { primaryNav } from "@/data/navigation";
import { Button } from "@/components/ui/Button";
import { RegMark } from "@/components/ui/Brand";
import { SiteChrome } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-32" aria-labelledby="nf-title">
        <div
          className="pointer-events-none absolute -right-[4vw] top-1/2 -translate-y-1/2 select-none font-display text-[42vw] font-extrabold leading-none text-graphite [font-variation-settings:'wdth'_62]"
          aria-hidden
        >
          <span className="inline-block -rotate-3 translate-x-[0.04em] text-maroon/25">4</span>
          <span className="inline-block">0</span>
          <span className="inline-block rotate-2 translate-y-[0.03em] text-teal-deep/25">4</span>
        </div>
        <RegMark className="absolute left-8 top-28 hidden md:block" />

        <div className="container-x relative">
          <p className="t-label mb-6 text-red">Error 404 · Misregistration</p>
          <h1 id="nf-title" className="t-h1 max-w-[16ch]">
            Looks like this print didn&rsquo;t land where expected.
          </h1>
          <p className="t-lead mt-8 max-w-lg text-mute">
            The page you&rsquo;re looking for may have moved or no longer exists.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/" size="lg" variant="light">
              Back to Home
            </Button>
            <Button href="/request-a-quote" size="lg" variant="outline">
              Request a Quote
            </Button>
          </div>
          <nav aria-label="Popular pages" className="mt-14">
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {primaryNav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="t-label link-underline text-mute hover:text-bone">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </SiteChrome>
  );
}
