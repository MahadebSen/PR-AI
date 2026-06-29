"use client";

import { useCallback, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiFetch, isReauthError } from "@/lib/api/client";
import type { RepoSummary } from "@/lib/core/github";
import type { ReviewJobStatus } from "@/types/review";

import { PullRequestRow, type PullRequestRowData } from "./PullRequestRow";

type RepoCardProps = {
  repo: RepoSummary;
  onReauthRequired?: () => void;
};

export function RepoCard({ repo, onReauthRequired }: RepoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pulls, setPulls] = useState<PullRequestRowData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadPulls = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFetch<{ pulls: PullRequestRowData[] }>(
        `/api/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}/pulls`,
      );

      setPulls(result.pulls);
      setHasLoaded(true);
    } catch (err) {
      if (isReauthError(err)) {
        onReauthRequired?.();
        setError("Re-authenticate GitHub to load pull requests");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load pull requests");
      }
    } finally {
      setLoading(false);
    }
  }, [repo.owner, repo.name, onReauthRequired]);

  async function handleToggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    if (!hasLoaded) {
      await loadPulls();
    }
  }

  function handleReviewStarted() {
    void loadPulls();
  }

  return (
    <Card className="border-border/80">
      <CardHeader className="flex-row items-center justify-between space-y-0 px-4 py-3">
        <button
          type="button"
          onClick={() => void handleToggle()}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {expanded ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          <BookOpen className="size-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate font-medium">{repo.fullName}</span>
          {repo.private ? (
            <Badge variant="outline" className="shrink-0">
              Private
            </Badge>
          ) : null}
        </button>
      </CardHeader>
      {expanded ? (
        <CardContent className="p-0 pb-2">
          {loading ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Loading pull requests…
            </p>
          ) : null}
          {error ? (
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
              <Button size="sm" variant="outline" onClick={() => void loadPulls()}>
                Retry
              </Button>
            </div>
          ) : null}
          {!loading && !error && pulls.length === 0 && hasLoaded ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No open pull requests
            </p>
          ) : null}
          {pulls.map((pull) => (
            <PullRequestRow
              key={pull.number}
              owner={repo.owner}
              repo={repo.name}
              pull={pull}
              jobId={pull.latestJob?.id}
              jobStatus={pull.latestJob?.status as ReviewJobStatus | undefined}
              onReauthRequired={onReauthRequired}
              onReviewStarted={handleReviewStarted}
            />
          ))}
        </CardContent>
      ) : null}
    </Card>
  );
}

type RepoBrowserProps = {
  initialRepos: RepoSummary[];
  initialHasNext: boolean;
  initialError?: string | null;
  onReauthRequired?: () => void;
};

export function RepoBrowser({
  initialRepos,
  initialHasNext,
  initialError = null,
  onReauthRequired,
}: RepoBrowserProps) {
  const [repos, setRepos] = useState<RepoSummary[]>(initialRepos);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const loadRepos = useCallback(
    async (pageNum: number, append: boolean) => {
      setLoadingMore(true);
      setError(null);

      try {
        const result = await apiFetch<{
          repos: RepoSummary[];
          page: number;
          hasNext: boolean;
        }>(`/api/repos?page=${pageNum}&per_page=10`);

        setRepos((prev) =>
          append ? [...prev, ...result.repos] : result.repos,
        );
        setPage(result.page);
        setHasNext(result.hasNext);
      } catch (err) {
        if (isReauthError(err)) {
          onReauthRequired?.();
          setError("Re-authenticate GitHub to browse repositories");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load repositories");
        }
      } finally {
        setLoadingMore(false);
      }
    },
    [onReauthRequired],
  );

  return (
    <div className="space-y-3">
      {error ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-destructive">{error}</p>
          <Button size="sm" variant="outline" onClick={() => void loadRepos(1, false)}>
            Retry
          </Button>
        </div>
      ) : null}
      {repos.length === 0 && !error ? (
        <p className="text-sm text-muted-foreground">No repositories found</p>
      ) : null}
      {repos.map((repo) => (
        <RepoCard
          key={repo.fullName}
          repo={repo}
          onReauthRequired={onReauthRequired}
        />
      ))}
      {hasNext ? (
        <Button
          variant="outline"
          className="w-full"
          disabled={loadingMore}
          onClick={() => void loadRepos(page + 1, true)}
        >
          {loadingMore ? "Loading…" : "Load more repositories"}
        </Button>
      ) : null}
    </div>
  );
}
