import { Logo } from "@/components/shared/Logo";
import { GitHubSignInButton } from "@/components/auth/GitHubSignInButton";

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl } = await searchParams;
  const redirectUrl = callbackUrl ?? "/dashboard";

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 shadow-[0_0_20px_rgba(163,113,247,0.25)]"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(163,113,247,0.15), transparent), var(--card)",
        }}
      >
        <div className="mx-auto max-w-sm text-center">
          <div className="mb-6 flex items-center justify-center gap-2.5">
            <Logo className="text-xl" />
          </div>

          <h1 className="text-2xl font-bold leading-snug">
            AI review before
            <br />
            humans ever look
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Security, performance, and code quality issues caught in minutes —
            posted directly to your PR when you&apos;re ready.
          </p>

          <GitHubSignInButton
            callbackUrl={redirectUrl}
            className="mt-8 w-full justify-center py-3"
          />

          <p className="mt-4 text-xs text-muted-foreground">
            Requests{" "}
            <code
              className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-accent-purple"
            >
              repo
            </code>{" "}
            scope to read PRs and post comments.
          </p>
        </div>
      </div>
    </main>
  );
}
