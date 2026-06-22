"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ExternalLink, LogOut, Settings } from "lucide-react";

import { UserAvatar } from "@/components/dashboard/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserMenuProps = {
  name?: string | null;
  username?: string | null;
  image?: string | null;
};

export function UserMenu({ name, username, image }: UserMenuProps) {
  const router = useRouter();
  const displayName = username ?? name ?? "User";
  const githubProfileUrl = username ? `https://github.com/${username}` : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open account menu"
      >
        <UserAvatar name={displayName} image={image} className="size-9" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">{displayName}</p>
              {username ? (
                <p className="text-xs text-muted-foreground">@{username}</p>
              ) : null}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {githubProfileUrl ? (
          <DropdownMenuItem
            onClick={() => window.open(githubProfileUrl, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink />
            GitHub profile
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
