"use client";

import { useState } from "react";
import { mapsHref, site } from "@/data/site";
import { Pin } from "@/components/ui/Icons";

/**
 * Click-to-load map facade: no third-party map scripts, cookies or network
 * requests until the visitor asks for the interactive map.
 */
export function MapEmbed() {
  const [loaded, setLoaded] = useState(false);
  const query = encodeURIComponent(site.contact.location.mapQuery);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-carbon md:aspect-[16/10]">
      {loaded ? (
        <iframe
          title={`Map showing ${site.contact.location.locality}, ${site.contact.location.city}`}
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          className="absolute inset-0 size-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <>
          <svg className="absolute inset-0 size-full text-line" aria-hidden>
            <defs>
              <pattern id="map-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M48 0H0V48" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
            <path d="M-20 260 C 180 200 260 320 520 240 S 900 180 1400 260" stroke="var(--color-steel)" strokeWidth="18" fill="none" />
            <path d="M300 -20 C 330 200 280 360 360 900" stroke="var(--color-steel)" strokeWidth="10" fill="none" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
            <span className="flex size-14 items-center justify-center bg-orange text-white">
              <Pin size={24} />
            </span>
            <p className="t-h3">
              {site.contact.location.locality}, {site.contact.location.city}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setLoaded(true)}
                className="t-label min-h-12 bg-teal-deep px-5 text-white hover:bg-bone"
              >
                Load interactive map
              </button>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="t-label flex min-h-12 items-center border border-line px-5 hover:border-bone"
              >
                Open in Google Maps
              </a>
            </div>
            <p className="max-w-xs text-xs text-mute">Loading the map connects to Google Maps.</p>
          </div>
        </>
      )}
    </div>
  );
}
