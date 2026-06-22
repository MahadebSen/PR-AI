"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="size-3.5" />
      Sign out
    </Button>
  );
}
