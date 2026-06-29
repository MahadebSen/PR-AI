import { requireApiSession } from "@/lib/auth/session";
import {
  getAuthenticatedOctokit,
  listOpenPulls,
  toApiErrorResponse,
} from "@/lib/core/github";
import {
  getLatestJobsForPullRequests,
  pullRequestKey,
} from "@/lib/db/reviews";

type RouteContext = {
  params: Promise<{ owner: string; repo: string }>;
};

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await requireApiSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const perPage = Math.min(
    parsePositiveInt(searchParams.get("per_page"), 30),
    100,
  );

  try {
    const octokit = await getAuthenticatedOctokit(session.user.id);
    const result = await listOpenPulls(octokit, owner, repo, page, perPage);

    const jobMap = await getLatestJobsForPullRequests(
      session.user.id,
      result.pulls.map((pull) => ({
        repoOwner: owner,
        repoName: repo,
        prNumber: pull.number,
      })),
    );

    const pulls = result.pulls.map((pull) => ({
      ...pull,
      latestJob: jobMap.get(pullRequestKey(owner, repo, pull.number)) ?? null,
    }));

    return Response.json({ ...result, pulls });
  } catch (error) {
    const { status, body } = toApiErrorResponse(error);
    return Response.json(body, { status });
  }
}
