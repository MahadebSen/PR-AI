"use client";

import { signIn } from "next-auth/react";

import { GitHubIcon } from "@/components/shared/GitHubIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GitHubSignInButtonProps = {
  callbackUrl?: string;
  className?: string;
  label?: string;
};

export function GitHubSignInButton({
  callbackUrl = "/dashboard",
  className,
  label = "Authenticate with GitHub",
}: GitHubSignInButtonProps) {
  return (
    <Button
      type="button"
      className={cn("gap-2", className)}
      onClick={() => signIn("github", { callbackUrl })}
    >
      <GitHubIcon className="size-4" />
      {label}
    </Button>
  );
}
