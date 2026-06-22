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

type DashboardStat = {
  label: string;
  value: string | number;
};

async function getDashboardStats(): Promise<DashboardStat[]> {
  // Phase 2+: load real review metrics from the database.
  return [];
}

export default async function DashboardPage() {
  const session = await requireSession();
  const user = session.user;
  const displayName = user.username ?? user.name ?? "there";
  const githubProfileUrl = user.username
    ? `https://github.com/${user.username}`
    : null;
  const stats = await getDashboardStats();

  return (
    <div className="px-6 py-8 md:px-10">
      {stats.length > 0 ? (
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card className="border-border/80">
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <UserAvatar
            name={displayName}
            image={user.image}
            className="size-12"
          />
          <div className="flex-1">
            <CardTitle>Welcome back, {displayName}</CardTitle>
            <CardDescription>
              Your GitHub account is connected. Repo browsing and review
              triggers arrive in Phase 2.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            Connected
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {user.username ? (
            <p>
              Signed in as{" "}
              <Link
                href={githubProfileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-link hover:underline"
              >
                @{user.username}
              </Link>
            </p>
          ) : null}
          <p>
            PR link input, repository browser, and review history will appear
            here in the next phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
