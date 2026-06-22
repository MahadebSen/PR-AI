import Link from "next/link";

import { requireSession } from "@/lib/auth/session";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await requireSession();
  const user = session.user;
  const displayName = user.username ?? user.name ?? "User";
  const githubProfileUrl = user.username
    ? `https://github.com/${user.username}`
    : null;

  return (
    <div className="px-6 py-8 md:px-10">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Account and integration settings. BYOK and disconnect flow arrive in
            Phase 6.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              GitHub connection
            </p>
            <div className="flex items-center gap-4">
              <UserAvatar
                name={displayName}
                image={user.image}
                className="size-11"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{displayName}</p>
                {user.username ? (
                  <Link
                    href={githubProfileUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-link hover:underline"
                  >
                    @{user.username}
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    GitHub account linked
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className="border-[rgba(35,134,54,0.4)] bg-[rgba(35,134,54,0.15)] text-[#56d364]"
              >
                Connected
              </Badge>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Token health checks and disconnect options will be added when
              GitHub API integration lands in Phase 2.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
