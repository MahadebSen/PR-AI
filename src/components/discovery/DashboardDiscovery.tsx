"use client";

import { useState } from "react";

import type { RepoSummary } from "@/lib/core/github";

import { GitHubReauthBanner } from "@/components/discovery/GitHubReauthBanner";
import { PrLinkForm } from "@/components/discovery/PrLinkForm";
import { RepoBrowser } from "@/components/discovery/RepoBrowser";

type DashboardDiscoveryProps = {
  initialRepos: RepoSummary[];
  initialHasNext: boolean;
  initialReposError?: string | null;
  needsReauth?: boolean;
};

export function DashboardDiscovery({
  initialRepos,
  initialHasNext,
  initialReposError = null,
  needsReauth = false,
}: DashboardDiscoveryProps) {
  const [reauthRequired, setReauthRequired] = useState(needsReauth);

  function handleReauthRequired() {
    setReauthRequired(true);
  }

  return (
    <div className="space-y-8">
      <GitHubReauthBanner
        visible={reauthRequired}
        onDismiss={() => setReauthRequired(false)}
      />

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
          Pipeline Target Injection
        </h2>
        <PrLinkForm onReauthRequired={handleReauthRequired} />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Tracked Structural Repositories
        </h2>
        <RepoBrowser
          initialRepos={initialRepos}
          initialHasNext={initialHasNext}
          initialError={initialReposError}
          onReauthRequired={handleReauthRequired}
        />
      </section>
    </div>
  );
}
