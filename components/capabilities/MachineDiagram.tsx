import type { ReactNode, SVGProps } from "react";
import type { DiagramKind } from "@/data/capabilities";
import { cn } from "@/lib/cn";

/**
 * Schematic line diagrams for production systems. These are explanatory
 * illustrations - not depictions of the client's actual machines.
 * Strokes use pathLength=1 so ScrollReveal can "draw" them in.
 */

const P = (props: SVGProps<SVGPathElement>) => <path className="draw-path" pathLength={1} {...props} />;
const R = (props: SVGProps<SVGRectElement>) => <rect className="draw-path" pathLength={1} {...props} />;
const C = (props: SVGProps<SVGCircleElement>) => <circle className="draw-path" pathLength={1} {...props} />;
const A = "var(--diagram-accent, var(--color-orange))";

const wave = (x: number, y: number, len: number, amp = 6, vertical = false) => {
  const seg = len / 4;
  return vertical
    ? `M${x} ${y} q${amp} ${seg / 2} 0 ${seg} t0 ${seg} t0 ${seg} t0 ${seg}`
    : `M${x} ${y} q${seg / 2} ${-amp} ${seg} 0 t${seg} 0 t${seg} 0 t${seg} 0`;
};

const diagrams: Record<DiagramKind, ReactNode> = {
  press: (
    <>
      <R x="60" y="232" width="280" height="16" />
      <R x="100" y="200" width="200" height="22" />
      <P d="M104 196 H296" stroke={A} />
      <R x="100" y="120" width="200" height="26" stroke={A} />
      <P d="M320 248 V60 H200 V120" />
      <P d="M200 60 L118 26" />
      <C cx="112" cy="24" r="8" />
      <P d={wave(130, 172, 140, 5)} stroke={A} />
      <P d="M200 76 v28 m-7 -9 l7 9 l7 -9" />
    </>
  ),
  silicone: (
    <>
      <R x="50" y="150" width="300" height="18" />
      <P d="M170 56 H236 L218 150 H188 Z" />
      <P d="M252 100 H330 m-9 -7 l9 7 l-9 7" />
      <P d="M36 252 H364" />
      <P d="M104 252 C104 212 176 212 176 252" stroke={A} />
      <P d="M214 252 C214 222 286 222 286 252" stroke={A} />
      <P d="M200 168 V200 m-6 -8 l6 8 l6 -8" />
    </>
  ),
  layers: (
    <>
      <R x="50" y="232" width="300" height="18" />
      <P d="M88 232 H312 L300 212 H100 Z" />
      <P d="M104 212 H296 L284 192 H116 Z" />
      <P d="M120 192 H280 L268 172 H132 Z" />
      <P d="M136 172 H264 L252 152 H148 Z" stroke={A} />
      <P d="M336 152 V232 M328 152 H344 M328 232 H344" stroke={A} />
      <P d="M40 120 H150 M40 120 V110" />
    </>
  ),
  dtf: (
    <>
      <R x="56" y="70" width="288" height="78" />
      <P d="M68 136 H332" />
      <R x="150" y="148" width="54" height="20" stroke={A} />
      <C cx="92" cy="236" r="24" />
      <C cx="308" cy="236" r="24" />
      <P d="M92 212 H308" />
      <C cx="178" cy="212" r="3" stroke={A} />
      <C cx="194" cy="212" r="3" stroke={A} />
      <C cx="210" cy="212" r="3" stroke={A} />
      <P d="M230 186 H286 m-9 -7 l9 7 l-9 7" />
    </>
  ),
  calender: (
    <>
      <C cx="200" cy="140" r="82" />
      <P d="M146 140 A54 54 0 0 1 254 140" stroke={A} />
      <P d="M164 140 A36 36 0 0 1 236 140" stroke={A} />
      <C cx="88" cy="244" r="18" />
      <C cx="312" cy="244" r="18" />
      <P d="M30 226 C110 226 104 214 126 186 A82 82 0 0 1 274 186 C296 214 290 226 370 226" />
      <P d="M30 262 H370" />
    </>
  ),
  carousel: (
    <>
      <C cx="200" cy="150" r="20" stroke={A} />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <g key={deg} transform={`rotate(${deg} 200 150)`}>
          <P d="M200 130 V58" />
          <R x="176" y="22" width="48" height="36" stroke={i === 0 ? A : undefined} />
        </g>
      ))}
    </>
  ),
  shaker: (
    <>
      <P d="M36 116 H364" />
      <C cx="50" cy="126" r="10" />
      <C cx="350" cy="126" r="10" />
      <P d="M160 34 H240 L222 84 H178 Z" />
      <P d="M184 92 V104 M200 90 V106 M216 92 V104" stroke={A} />
      <P d="M120 156 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12" stroke={A} />
      <R x="120" y="204" width="160" height="32" />
    </>
  ),
  oven: (
    <>
      <R x="104" y="92" width="192" height="118" />
      <P d="M104 118 H296" />
      <P d="M26 232 H374" />
      <C cx="46" cy="232" r="10" />
      <C cx="354" cy="232" r="10" />
      <P d={wave(160, 132, 64, 6, true)} stroke={A} />
      <P d={wave(200, 132, 64, 6, true)} stroke={A} />
      <P d={wave(240, 132, 64, 6, true)} stroke={A} />
      <R x="44" y="210" width="34" height="18" />
      <R x="322" y="210" width="34" height="18" />
    </>
  ),
  exposure: (
    <>
      <R x="76" y="196" width="248" height="64" />
      <P d="M76 196 H324" />
      <R x="110" y="118" width="180" height="62" />
      <P d="M140 118 V180 M170 118 V180 M200 118 V180 M230 118 V180 M260 118 V180" />
      <P d="M130 240 L122 204 M170 240 L166 204 M230 240 L234 204 M270 240 L278 204" stroke={A} />
      <C cx="200" cy="232" r="10" stroke={A} />
    </>
  ),
  washout: (
    <>
      <R x="150" y="60" width="120" height="170" />
      <P d="M170 80 H250 M170 100 H250 M170 120 H250" />
      <C cx="64" cy="146" r="9" />
      <P d="M18 146 H55" />
      <P d="M74 140 L146 96 M74 146 L146 146 M74 152 L146 196" stroke={A} />
      <P d="M120 256 H300 M130 256 V272 H290 V256" />
    </>
  ),
  flash: (
    <>
      <R x="84" y="82" width="232" height="44" />
      <P d="M100 104 l14 -10 l14 20 l14 -20 l14 20 l14 -20 l14 20 l14 -20 l14 20 l14 -20 l14 20 l14 -20 l14 20 l14 -10" stroke={A} />
      <P d="M316 104 H352 V272" />
      <P d={wave(140, 140, 56, 5, true)} stroke={A} />
      <P d={wave(200, 140, 56, 5, true)} stroke={A} />
      <P d={wave(260, 140, 56, 5, true)} stroke={A} />
      <R x="96" y="210" width="208" height="14" />
      <P d="M200 224 V272 M160 272 H240" />
    </>
  ),
  qc: (
    <>
      <C cx="168" cy="138" r="64" />
      <C cx="168" cy="138" r="54" />
      <P d="M214 184 L292 262" />
      <P d="M136 118 H200 M136 138 H200 M136 158 H182" stroke={A} />
      <P d="M296 84 l16 16 l38 -42" stroke={A} />
      <P d="M36 280 H364 M60 280 V270 M100 280 V270 M140 280 V270 M180 280 V270 M220 280 V270 M260 280 V270 M300 280 V270 M340 280 V270" />
    </>
  ),
};

export function MachineDiagram({ kind, className }: { kind: DiagramKind; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={cn("text-mute", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden
      data-reveal="draw"
    >
      {diagrams[kind]}
    </svg>
  );
}
