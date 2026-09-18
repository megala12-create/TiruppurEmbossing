import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Accent } from "@/data/services";
import { SectionLabel } from "./SectionLabel";
import { SplitText } from "./SplitText";

type Props = {
  index?: string;
  label: string;
  title: string;
  intro?: ReactNode;
  accent?: Accent;
  as?: "h1" | "h2";
  size?: "h1" | "h2";
  tone?: "dark" | "light";
  className?: string;
  aside?: ReactNode;
  id?: string;
};

export function SectionHeading({
  index,
  label,
  title,
  intro,
  accent,
  as = "h2",
  size = "h2",
  tone = "dark",
  className,
  aside,
  id,
}: Props) {
  return (
    <header className={cn("grid gap-8 lg:grid-cols-12 lg:items-end", className)}>
      <div className="lg:col-span-8">
        <SectionLabel index={index} label={label} accent={accent} tone={tone} className="mb-6 md:mb-8" />
        <SplitText id={id} as={as} text={title} className={size === "h1" ? "t-h1" : "t-h2"} />
      </div>
      {(intro || aside) && (
        <div className="lg:col-span-4 lg:pb-2" data-reveal="fade">
          {intro && (
            <div className={cn("t-lead max-w-md", tone === "dark" ? "text-mute" : "text-paper-mute")}>{intro}</div>
          )}
          {aside}
        </div>
      )}
    </header>
  );
}
