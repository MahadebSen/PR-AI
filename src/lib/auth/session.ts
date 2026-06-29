import { redirect } from "next/navigation";

import { auth } from "./config";

export async function requireSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return session;
}

/** For API routes — returns JSON-friendly null instead of redirecting. */
export async function requireApiSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session;
}

export async function getSessionUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}
