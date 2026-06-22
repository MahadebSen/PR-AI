import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth/auth.config";

export const { auth: middlewareAuth } = NextAuth(authConfig);

export default middlewareAuth;

export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/dashboard/:path*",
    "/history/:path*",
    "/pr/:path*",
    "/review/:path*",
    "/settings/:path*",
  ],
};
