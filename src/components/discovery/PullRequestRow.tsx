import Link from "next/link";
import { GitPullRequest } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ReviewJobStatus } from "@/types/review";

import { ReviewStatusBadge, getReviewDisplayStatus } from "./ReviewStatusBadge";
import { StartReviewButton } from "./StartReviewButton";

export type PullRequestRowData = {
  number: number;
  title: string;
  author: string | null;
  headRef: string;
  createdAt: string;
  htmlUrl: string;
  latestJob?: {
    id: string;
    status: ReviewJobStatus;
  } | null;
};

type PullRequestRowProps = {
  owner: string;
  repo: string;
  pull: PullRequestRowData;
  jobId?: string | null;
  jobStatus?: ReviewJobStatus | null;
  onReauthRequired?: () => void;
  onReviewStarted?: () => void;
};

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "opened recently";
  if (diffHours < 24) return `opened ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `opened ${diffDays}d ago`;
}

export function PullRequestRow({
  owner,
  repo,
  pull,
  jobId,
  jobStatus,
  onReauthRequired,
  onReviewStarted,
}: PullRequestRowProps) {
  const displayStatus = getReviewDisplayStatus(jobStatus ?? null);

  return (
    <div className="flex items-start gap-3 border-t border-border/60 px-4 py-3 first:border-t-0">
      <GitPullRequest
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          <Link
            href={pull.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-link hover:underline"
          >
            #{pull.number} — {pull.title}
          </Link>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {pull.author ? `by @${pull.author}` : "by unknown"} ·{" "}
          {formatRelativeTime(pull.createdAt)} ·{" "}
          <code className="text-[10px] text-primary">{pull.headRef}</code>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ReviewStatusBadge status={jobStatus ?? null} />
        {displayStatus === "reviewed" && jobId ? (
          <Button size="sm" variant="outline" render={<Link href={`/review/${jobId}`} />}>
            View results
          </Button>
        ) : null}
        {displayStatus === "in-progress" ? (
          <Button size="sm" variant="outline" disabled>
            Reviewing…
          </Button>
        ) : null}
        {displayStatus === "not-reviewed" || displayStatus === "failed" ? (
          <StartReviewButton
            owner={owner}
            repo={repo}
            prNumber={pull.number}
            onReauthRequired={onReauthRequired}
            onSuccess={() => onReviewStarted?.()}
          />
        ) : null}
      </div>
    </div>
  );
}
