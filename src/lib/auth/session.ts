import { redirect } from "next/navigation";

import { auth } from "./config";

export async function requireSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
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
