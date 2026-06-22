import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  return (
    <header
      className="flex items-center justify-between border-b border-border bg-sidebar px-6 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.4)] md:px-10"
    >
      <Logo />
      <nav className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Sign in
        </Link>
        <Link href="/sign-in" className={cn(buttonVariants({ size: "sm" }))}>
          Get started free
        </Link>
      </nav>
    </header>
  );
}
