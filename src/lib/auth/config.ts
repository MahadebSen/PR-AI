import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import { prisma } from "@/lib/db";
import { authConfig } from "./auth.config";
import { saveGitHubToken } from "./tokens";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ user, account, profile }) {
      if (
        account?.provider !== "github" ||
        !account.access_token ||
        !user.id
      ) {
        return;
      }

      const githubProfile = profile as { id?: number; login?: string } | null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId: githubProfile?.id?.toString() ?? undefined,
          username: githubProfile?.login ?? undefined,
        },
      });

      const expiresAt = account.expires_at
        ? new Date(account.expires_at * 1000)
        : null;

      await saveGitHubToken(user.id, account.access_token, expiresAt);

      await prisma.account.updateMany({
        where: {
          userId: user.id,
          provider: "github",
        },
        data: {
          access_token: null,
        },
      });
    },
  },
});
