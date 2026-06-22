"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitPullRequest,
  History,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "Review history", icon: History },
  { href: "/pr", label: "PR details", icon: GitPullRequest },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar"
      aria-label="Sidebar"
    >
      <div className="flex h-14 shrink-0 items-center border-b border-border px-5">
        <Logo />
      </div>

      <nav className="flex flex-col gap-1 px-3 py-6">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent font-semibold text-sidebar-foreground"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              {/* {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-purple shadow-[0_0_10px_rgba(163,113,247,0.55)]"
                />
              ) : null} */}
              <item.icon
                className={cn(
                  "size-[18px] shrink-0 transition-colors",
                  isActive
                    ? "text-accent-purple"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
