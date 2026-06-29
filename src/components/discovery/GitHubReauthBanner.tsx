"use client";

import Link from "next/link";
import { AlertCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GITHUB_SIGN_IN_URL } from "@/lib/api/client";

type GitHubReauthBannerProps = {
  visible: boolean;
  onDismiss?: () => void;
};

export function GitHubReauthBanner({
  visible,
  onDismiss,
}: GitHubReauthBannerProps) {
  if (!visible) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-destructive">
          GitHub connection expired
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Re-authenticate GitHub to browse repositories and start reviews.
        </p>
        <Button
          size="sm"
          variant="destructive"
          className="mt-2"
          render={<Link href={GITHUB_SIGN_IN_URL} />}
        >
          Re-authenticate GitHub
        </Button>
      </div>
      {onDismiss ? (
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
