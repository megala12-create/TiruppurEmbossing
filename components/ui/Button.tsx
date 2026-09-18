import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { AnalyticsEvent } from "@/lib/analytics";
import { ArrowRight } from "./Icons";

type Variant = "primary" | "outline" | "light" | "dark" | "outline-dark" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-red text-white hover:bg-maroon [--arrow-border:rgba(255,255,255,.28)]",
  outline:
    "text-bone shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-bone)] [--arrow-border:var(--color-line)]",
  light: "bg-teal-deep text-white hover:bg-bone [--arrow-border:rgba(255,255,255,.28)]",
  dark: "bg-bone text-white hover:bg-maroon [--arrow-border:rgba(255,255,255,.2)]",
  "outline-dark":
    "text-bone shadow-[inset_0_0_0_1px_var(--color-paper-line)] hover:shadow-[inset_0_0_0_1px_var(--color-bone)] [--arrow-border:var(--color-paper-line)]",
  ghost: "text-bone hover:text-teal-deep [--arrow-border:transparent]",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  icon?: ReactNode | false;
  className?: string;
  track?: AnalyticsEvent;
  trackLabel?: string;
};

type LinkProps = CommonProps & { href: string; external?: boolean; type?: never; onClick?: never; disabled?: never };
type ButtonProps = CommonProps & {
  href?: undefined;
  external?: never;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

/**
 * Industrial button: label + separated arrow cell. Arrow nudges on hover.
 * Renders a real <a> for navigation and a real <button> for actions.
 */
export function Button(props: LinkProps | ButtonProps) {
  const { children, variant = "primary", size = "md", icon, className, track, trackLabel } = props;
  const classes = cn(
    "group/btn relative inline-flex select-none items-stretch t-label transition-[background-color,color,box-shadow] duration-300",
    "disabled:cursor-not-allowed disabled:opacity-50",
    size === "lg" ? "min-h-14 text-[0.78rem]" : "min-h-12",
    variants[variant],
    className,
  );
  const content = (
    <>
      <span className={cn("flex items-center", size === "lg" ? "px-7" : "px-5")}>{children}</span>
      {icon !== false && (
        <span
          className={cn(
            "flex items-center justify-center overflow-hidden border-l border-[var(--arrow-border)]",
            size === "lg" ? "w-14" : "w-12",
          )}
          aria-hidden
        >
          <span className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-1">
            {icon ?? <ArrowRight size={18} />}
          </span>
        </span>
      )}
    </>
  );

  const trackAttrs = track ? { "data-track": track, "data-track-label": trackLabel } : {};

  if (props.href !== undefined) {
    if (props.external) {
      return (
        <a href={props.href} className={classes} target="_blank" rel="noopener noreferrer" {...trackAttrs}>
          {content}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes} {...trackAttrs}>
        {content}
      </Link>
    );
  }

  return (
    <button type={props.type ?? "button"} onClick={props.onClick} disabled={props.disabled} className={classes} {...trackAttrs}>
      {content}
    </button>
  );
}
