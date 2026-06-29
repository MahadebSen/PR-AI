import Link from "next/link";

import { DashboardDiscovery } from "@/components/discovery/DashboardDiscovery";
import { requireSession } from "@/lib/auth/session";
import {
  getAuthenticatedOctokit,
  GitHubAuthError,
  listUserRepos,
} from "@/lib/core/github";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await requireSession();
  const user = session.user;
  const displayName = user.username ?? user.name ?? "there";
  const githubProfileUrl = user.username
    ? `https://github.com/${user.username}`
    : null;

  let initialRepos: Awaited<ReturnType<typeof listUserRepos>>["repos"] = [];
  let initialHasNext = false;
  let initialReposError: string | null = null;
  let needsReauth = false;

  try {
    const octokit = await getAuthenticatedOctokit(session.user.id);
    const result = await listUserRepos(octokit, 1, 10);
    initialRepos = result.repos;
    initialHasNext = result.hasNext;
  } catch (error) {
    if (error instanceof GitHubAuthError) {
      needsReauth = true;
      initialReposError = error.message;
    } else if (error instanceof Error) {
      initialReposError = error.message;
    } else {
      initialReposError = "Failed to load repositories";
    }
  }

  return (
    <div className="px-6 py-8 md:px-10">
      <Card className="mb-8 border-border/80">
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <UserAvatar
            name={displayName}
            image={user.image}
            className="size-12"
          />
          <div className="flex-1">
            <CardTitle>Welcome back, {displayName}</CardTitle>
            <CardDescription>
              Browse repositories or paste a pull request URL to start a review.
            </CardDescription>
          </div>
          <Badge
            variant={needsReauth ? "destructive" : "secondary"}
            className="shrink-0"
          >
            {needsReauth ? "Reconnect GitHub" : "Connected"}
          </Badge>
        </CardHeader>
        {user.username ? (
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Signed in as{" "}
            <Link
              href={githubProfileUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-link hover:underline"
            >
              @{user.username}
            </Link>
          </CardContent>
        ) : null}
      </Card>

      <DashboardDiscovery
        initialRepos={initialRepos}
        initialHasNext={initialHasNext}
        initialReposError={initialReposError}
        needsReauth={needsReauth}
      />
    </div>
  );
}
