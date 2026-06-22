const steps = [
  {
    title: "Connect your GitHub account",
    description:
      "OAuth sign-in requests repo scope to read PRs and post comments.",
    dotClass: "bg-link",
  },
  {
    title: "Paste a PR link or pick from your repos",
    description:
      "We chunk the diff, run dual-agent review, and prioritize findings.",
    dotClass: "bg-link",
  },
  {
    title: "Review inside PR AI — post to GitHub when ready",
    description:
      "Comments live here first. One click pushes them as inline comments on the PR.",
    dotClass: "bg-accent-purple",
    isLast: true,
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border pt-10">
      <h2 className="mb-8 text-center text-2xl font-bold">How it works</h2>
      <ol className="mx-auto max-w-2xl space-y-0">
        {steps.map((step) => (
          <li key={step.title} className="flex gap-5">
            <div className="flex flex-col items-center pt-1">
              <div
                className={`size-3 shrink-0 rounded-full ring-4 ring-background ${step.dotClass}`}
              />
              {!step.isLast ? (
                <div className="my-1 w-px flex-1 bg-border min-h-8" />
              ) : null}
            </div>
            <div className={`pb-8 ${step.isLast ? "pb-0" : ""}`}>
              <h3 className="text-sm font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
