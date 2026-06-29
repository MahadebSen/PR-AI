"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiFetch, isReauthError } from "@/lib/api/client";

type StartReviewButtonProps = {
  owner: string;
  repo: string;
  prNumber: number;
  disabled?: boolean;
  onReauthRequired?: () => void;
  onSuccess?: (jobId: string) => void;
};

export function StartReviewButton({
  owner,
  repo,
  prNumber,
  disabled = false,
  onReauthRequired,
  onSuccess,
}: StartReviewButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartReview() {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFetch<{ jobId: string }>("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, prNumber }),
      });

      onSuccess?.(result.jobId);
      router.refresh();
    } catch (err) {
      if (isReauthError(err)) {
        onReauthRequired?.();
        setError("Re-authenticate GitHub to continue");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to start review");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="default"
        disabled={disabled || loading}
        onClick={handleStartReview}
      >
        {loading ? "Starting…" : "Start review"}
      </Button>
      {error ? (
        <p className="max-w-40 text-right text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
