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
      let target: string;

      if (url.startsWith("/")) {
        target = `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        target = url;
      } else {
        return `${baseUrl}/dashboard`;
      }

      const pathname = new URL(target).pathname;
      if (pathname === "/" || pathname === "/sign-in") {
        return `${baseUrl}/dashboard`;
      }

      return target;
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
