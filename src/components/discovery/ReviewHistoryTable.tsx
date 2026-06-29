"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import {
  ReviewStatusBadge,
  getReviewDisplayStatus,
} from "@/components/discovery/ReviewStatusBadge";
import { StartReviewButton } from "@/components/discovery/StartReviewButton";
import { GitHubReauthBanner } from "@/components/discovery/GitHubReauthBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch, isReauthError } from "@/lib/api/client";
import type { ReviewJobStatus } from "@/types/review";

export type ReviewJobItem = {
  id: string;
  repoOwner: string;
  repoName: string;
  prNumber: number;
  status: ReviewJobStatus;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

const POLL_INTERVAL_MS = 8000;

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type ReviewHistoryTableProps = {
  initialJobs: ReviewJobItem[];
};

export function ReviewHistoryTable({ initialJobs }: ReviewHistoryTableProps) {
  const [jobs, setJobs] = useState<ReviewJobItem[]>(initialJobs);
  const [error, setError] = useState<string | null>(null);
  const [reauthRequired, setReauthRequired] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      const result = await apiFetch<{ jobs: ReviewJobItem[] }>(
        "/api/review?limit=50",
      );
      setJobs(result.jobs);
      setError(null);
    } catch (err) {
      if (isReauthError(err)) {
        setReauthRequired(true);
        setError("Re-authenticate GitHub to view review history");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load review history");
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      void loadJobs();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadJobs]);

  return (
    <div className="space-y-4">
      <GitHubReauthBanner
        visible={reauthRequired}
        onDismiss={() => setReauthRequired(false)}
      />

      {error ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-destructive">{error}</p>
          <Button size="sm" variant="outline" onClick={() => void loadJobs()}>
            Retry
          </Button>
        </div>
      ) : null}

      {jobs.length === 0 && !error ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No reviews yet. Start one from the{" "}
            <Link href="/dashboard" className="text-link hover:underline">
              dashboard
            </Link>
            .
          </CardContent>
        </Card>
      ) : null}

      {jobs.length > 0 ? (
        <div className="space-y-2">
          {jobs.map((job) => {
            const prUrl = `https://github.com/${job.repoOwner}/${job.repoName}/pull/${job.prNumber}`;
            const displayStatus = getReviewDisplayStatus(job.status);

            return (
              <Card key={job.id} className="border-border/80">
                <CardContent className="flex flex-wrap items-center gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {job.repoOwner}/{job.repoName} #{job.prNumber}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Started {formatDate(job.createdAt)}
                      {job.errorMessage ? ` · ${job.errorMessage}` : ""}
                    </p>
                  </div>
                  <ReviewStatusBadge status={job.status} />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <Link
                          href={prUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <ExternalLink className="size-3.5" />
                      GitHub
                    </Button>
                    {displayStatus === "reviewed" ? (
                      <Button
                        size="sm"
                        variant="default"
                        render={<Link href={`/review/${job.id}`} />}
                      >
                        View results
                      </Button>
                    ) : null}
                    {displayStatus === "failed" ? (
                      <StartReviewButton
                        owner={job.repoOwner}
                        repo={job.repoName}
                        prNumber={job.prNumber}
                        onReauthRequired={() => setReauthRequired(true)}
                        onSuccess={() => void loadJobs()}
                      />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
