"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type View = "front" | "back" | "bottoms";
type Zone = { view: View; x: number; y: number; w: number; h: number };

/** Indicative positions only - actual size and position are agreed per job. */
const ZONES: Record<string, Zone> = {
  Chest: { view: "front", x: 105, y: 100, w: 90, h: 34 },
  "Left Chest": { view: "front", x: 170, y: 96, w: 36, h: 30 },
  "Right Chest": { view: "front", x: 94, y: 96, w: 36, h: 30 },
  Front: { view: "front", x: 95, y: 118, w: 110, h: 120 },
  Back: { view: "back", x: 88, y: 92, w: 124, h: 150 },
  Sleeve: { view: "front", x: 28, y: 88, w: 30, h: 26 },
  Neck: { view: "back", x: 128, y: 48, w: 44, h: 18 },
  Pocket: { view: "front", x: 168, y: 110, w: 34, h: 38 },
  Bottom: { view: "front", x: 100, y: 262, w: 44, h: 24 },
  Leg: { view: "bottoms", x: 176, y: 90, w: 38, h: 70 },
};

const TEE = "M112 30 L88 38 L20 70 L6 128 L52 138 L66 108 L66 300 L234 300 L234 108 L248 138 L294 128 L280 70 L212 38 L188 30 Q150 58 112 30 Z";
const TEE_BACK = "M112 30 L88 38 L20 70 L6 128 L52 138 L66 108 L66 300 L234 300 L234 108 L248 138 L294 128 L280 70 L212 38 L188 30 Q150 40 112 30 Z";
const BOTTOMS = "M80 30 L220 30 L236 300 L166 300 L150 120 L134 300 L64 300 Z";

export function PlacementDiagram({ placements }: { placements: string[] }) {
  const [selected, setSelected] = useState(placements[1] ?? placements[0]);
  const zone = ZONES[selected];
  const view: View = zone?.view ?? "front";

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-5">
        <p className="t-label mb-4 text-mute">Select a placement</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Placements">
          {placements.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={p === selected}
              onClick={() => setSelected(p)}
              onMouseEnter={() => setSelected(p)}
              className={cn(
                "t-label min-h-11 border px-4 transition-colors",
                p === selected ? "border-teal-deep bg-teal-deep text-white" : "border-line text-bone hover:border-bone",
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <p className="mt-6 text-sm text-mute" aria-live="polite">
          <span className="text-bone">{selected}</span>: shown on the{" "}
          {view === "bottoms" ? "bottoms" : `garment ${view}`}. Positions are indicative; exact size and placement are
          confirmed on the sample.
        </p>
      </div>

      <div className="relative lg:col-span-6 lg:col-start-7">
        <div className="relative mx-auto aspect-[300/320] max-w-md border border-line bg-carbon p-6">
          <span className="t-label absolute left-3 top-3 text-[0.6rem] text-mute">
            View · {view === "bottoms" ? "Bottoms" : view === "front" ? "Front" : "Back"}
          </span>
          <svg viewBox="0 0 300 320" className="size-full" role="img" aria-label={`Diagram highlighting the ${selected} placement`}>
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M10 0H0V10" fill="none" stroke="var(--color-line)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="300" height="320" fill="url(#grid)" opacity="0.6" />
            <path
              d={view === "bottoms" ? BOTTOMS : view === "back" ? TEE_BACK : TEE}
              fill="var(--color-graphite)"
              stroke="var(--color-mute)"
              strokeWidth="1.2"
              className="transition-all duration-500"
            />
            {view !== "bottoms" && (
              <path d="M66 108 L66 300 M234 108 L234 300" stroke="var(--color-steel)" strokeWidth="1" fill="none" />
            )}
            {zone && (
              <g key={selected} className="animate-fade">
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  fill="rgba(247,126,30,.12)"
                  stroke="var(--color-orange)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <circle cx={zone.x + zone.w / 2} cy={zone.y + zone.h / 2} r="3" fill="var(--color-orange)" />
                <line
                  x1={zone.x + zone.w / 2}
                  y1={zone.y + zone.h / 2}
                  x2={zone.x + zone.w / 2 > 150 ? 292 : 8}
                  y2={zone.y + zone.h / 2}
                  stroke="var(--color-orange)"
                  strokeWidth="0.75"
                />
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
