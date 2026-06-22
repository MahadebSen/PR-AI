import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 font-bold tracking-tight text-foreground ${className ?? ""}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="text-accent-purple drop-shadow-[0_0_8px_rgba(163,113,247,0.65)]"
      >
        <path
          fill="currentColor"
          d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v5.256a2.251 2.251 0 1 0 1.5 0V5.372zm8 5.378a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0-5.494a2.25 2.25 0 1 0-1.5 0v2.878a2.25 2.25 0 0 0 1.5 0V3.256zM11.5 1.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM4.25 12a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm7.25 1a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"
        />
      </svg>
      PR AI
    </Link>
  );
}
