import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { User } from "next-auth";
import GitHub from "next-auth/providers/github";

const protectedPrefixes = [
  "/dashboard",
  "/history",
  "/pr",
  "/review",
  "/settings",
];

function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: { params: { scope: "repo" } },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return `${baseUrl}/dashboard`;
    },
    authorized({
      auth,
      request,
    }: {
      auth: Session | null;
      request: NextRequest;
    }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      if ((pathname === "/" || pathname === "/sign-in") && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      if (isProtectedPath(pathname) && !isLoggedIn) {
        const signInUrl = new URL("/sign-in", request.nextUrl);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(signInUrl);
      }

      return true;
    },
    jwt({
      token,
      user,
      profile,
    }: {
      token: JWT;
      user?: User;
      profile?: unknown;
    }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      if (profile && typeof profile === "object" && "login" in profile) {
        token.username = (profile as { login?: string }).login ?? null;
      }

      return token;
    },
    session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = (token.username as string | null) ?? null;
      }

      return session;
    },
  },
};
