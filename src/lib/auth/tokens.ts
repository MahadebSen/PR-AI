import { encrypt, decrypt } from "./encryption";
import { prisma } from "@/lib/db";

/**
 * Persists an encrypted GitHub OAuth access token for server-side API calls.
 * This is the only storage path for plaintext tokens — never expose to clients.
 */
export async function saveGitHubToken(
  userId: string,
  accessToken: string,
  expiresAt?: Date | null,
): Promise<void> {
  const encryptedToken = encrypt(accessToken);

  await prisma.gitHubToken.upsert({
    where: { userId },
    create: {
      userId,
      encryptedToken,
      expiresAt,
    },
    update: {
      encryptedToken,
      expiresAt,
    },
  });
}

/**
 * Returns the decrypted GitHub access token for server-side use only.
 * Phase 2 GitHub API routes must use this — never read from session.
 */
export async function getGitHubAccessToken(userId: string): Promise<string | null> {
  const record = await prisma.gitHubToken.findUnique({
    where: { userId },
  });

  if (!record) {
    return null;
  }

  return decrypt(record.encryptedToken);
}
