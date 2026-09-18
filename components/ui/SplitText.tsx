import { Fragment, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** Text to split. Use "\n" for controlled editorial line breaks. */
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
  /** Highlight words (exact match, case-insensitive) with an accent class */
  highlight?: { words: string[]; className: string };
  /** "words" = GSAP scroll reveal · "hero" = CSS-only entrance (no JS, LCP-safe) · "none" = static */
  reveal?: "words" | "hero" | "none";
  delay?: number;
};

/**
 * Server-rendered text splitting. Each word is wrapped in a mask so it can
 * rise into view. The full text stays in the DOM (and in an aria-label-free,
 * readable order) so screen readers and search engines read it normally.
 */
export function SplitText({ text, as: Tag = "h2", className, id, highlight, reveal = "words", delay = 0 }: Props) {
  const lines = text.split("\n");
  let wordIndex = 0;
  const hl = highlight?.words.map((w) => w.toLowerCase());

  return (
    <Tag id={id} className={className} data-reveal={reveal === "words" ? "words" : undefined}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {line.split(" ").map((word, wi, arr) => {
            const i = wordIndex++;
            const isHl = hl?.includes(word.replace(/[.,!?]/g, "").toLowerCase());
            let inner: ReactNode = word;
            if (isHl) inner = <span className={highlight!.className}>{word}</span>;
            return (
              <Fragment key={wi}>
                <span className="mask-line">
                  <span
                    data-word
                    className={cn("inline-block will-change-transform", reveal === "hero" && "animate-rise")}
                    style={reveal === "hero" ? { animationDelay: `${delay + i * 55}ms` } : undefined}
                  >
                    {inner}
                  </span>
                </span>
                {wi < arr.length - 1 && " "}
              </Fragment>
            );
          })}
          {li < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </Tag>
  );
}
