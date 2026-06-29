"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, isReauthError } from "@/lib/api/client";
import { isValidPullRequestUrl } from "@/lib/core/github/parse-pr-url";

type PrLinkFormProps = {
  onReauthRequired?: () => void;
};

export function PrLinkForm({ onReauthRequired }: PrLinkFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isValidPullRequestUrl(url)) {
      setError("Invalid URL. Use format: https://github.com/owner/repo/pull/123");
      return;
    }

    setLoading(true);

    try {
      const result = await apiFetch<{ jobId: string }>("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl: url.trim() }),
      });

      setSuccess(`Review queued. Job ID: ${result.jobId}`);
      setUrl("");
      router.push("/history");
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2 rounded-lg border border-border bg-card p-3">
        <Input
          type="url"
          placeholder="https://github.com/owner/repo/pull/123"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            if (error) setError(null);
          }}
          aria-invalid={!!error}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !url.trim()}>
          {loading ? "Starting…" : "Review PR"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-muted-foreground">{success}</p> : null}
    </form>
  );
}
