import Link from "next/link";
import { Play, Sparkles } from "lucide-react";

import { GitHubIcon } from "@/components/shared/GitHubIcon";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b border-border bg-card px-6 py-24 md:px-10 md:py-28"
      style={{
        background:
          "radial-gradient(circle at 85% 30%, rgba(163,113,247,0.2) 0%, transparent 50%), radial-gradient(circle at 15% 70%, rgba(47,129,247,0.15) 0%, transparent 50%), var(--card)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[20%] top-[15%] size-36 rounded-full bg-accent-purple opacity-60 blur-[40px] animate-pulse"
        />
        <div
          className="absolute bottom-[20%] right-[15%] size-44 rounded-full bg-[#238636] opacity-50 blur-[40px] animate-pulse"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <Badge
          variant="outline"
          className="mb-6 border-accent-purple/40 bg-accent-purple/10 text-accent-purple uppercase tracking-wider"
        >
          <Sparkles className="size-3" />
          AI-powered code review
        </Badge>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          Catch bugs before your
          <br />
          <span className="bg-gradient-to-r from-link to-accent-purple bg-clip-text text-transparent">
            teammates even look
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          PR AI flags security issues, performance problems, and code quality
          gaps in your pull requests — staged in-app before you post to GitHub.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ size: "lg" }), "gap-2 px-7")}
          >
            <GitHubIcon className="size-4" />
            Sign in with GitHub
          </Link>
          <span
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "gap-2 px-7 bg-white/[0.02] pointer-events-none opacity-50",
            )}
          >
            <Play className="size-4" />
            View demo
          </span>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="relative flex size-28 items-center justify-center">
            <div
              className="absolute size-24 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] bg-gradient-to-br from-accent-purple to-link opacity-50 blur-xl"
            />
            <svg
              height="72"
              width="72"
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="relative z-10 fill-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
            >
              <path
                fillRule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
