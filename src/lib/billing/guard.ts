/**
 * Billing boundary — all review-triggering routes pass through here.
 * MVP stub always allows; tier checks land in Phase 7+.
 */

export type GuardResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export async function checkSubscription(userId: string): Promise<GuardResult> {
  void userId;
  return { allowed: true };
}

export const billingGuard = {
  check: checkSubscription,
};
