"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[80svh] items-center pb-20 pt-32" aria-labelledby="err-title">
      <div className="container-x">
        <p className="t-label mb-6 text-red">Something went wrong</p>
        <h1 id="err-title" className="t-h1 max-w-[18ch]">
          The press jammed on this page.
        </h1>
        <p className="t-lead mt-6 max-w-lg text-mute">Please try again. If the problem continues, contact us directly.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button onClick={reset} size="lg" variant="light">
            Try again
          </Button>
          <Button href="/" size="lg" variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </section>
  );
}
