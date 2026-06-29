import { requireApiSession } from "@/lib/auth/session";
import { billingGuard } from "@/lib/billing/guard";
import {
  getAuthenticatedOctokit,
  getPullRequest,
  parsePullRequestUrl,
  PullRequestUrlError,
  toApiErrorResponse,
} from "@/lib/core/github";
import { listReviewJobs } from "@/lib/db/reviews";
import { enqueueReviewJob } from "@/lib/queue";

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function serializeJob(job: {
  id: string;
  repoOwner: string;
  repoName: string;
  prNumber: number;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}) {
  return {
    id: job.id,
    repoOwner: job.repoOwner,
    repoName: job.repoName,
    prNumber: job.prNumber,
    status: job.status,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
  };
}

export async function GET(request: Request) {
  const session = await requireApiSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 20), 100);
  const cursor = searchParams.get("cursor") ?? undefined;

  const result = await listReviewJobs(session.user.id, { limit, cursor });

  return Response.json({
    jobs: result.jobs.map(serializeJob),
    nextCursor: result.nextCursor,
  });
}

type ReviewRequestBody = {
  prUrl?: string;
  owner?: string;
  repo?: string;
  prNumber?: number;
};

export async function POST(request: Request) {
  const session = await requireApiSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guard = await billingGuard.check(session.user.id);

  if (!guard.allowed) {
    return Response.json({ error: guard.reason }, { status: 403 });
  }

  let body: ReviewRequestBody;

  try {
    body = (await request.json()) as ReviewRequestBody;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  let owner: string;
  let repo: string;
  let prNumber: number;

  try {
    if (body.prUrl) {
      const parsed = parsePullRequestUrl(body.prUrl);
      owner = parsed.owner;
      repo = parsed.repo;
      prNumber = parsed.prNumber;
    } else if (body.owner && body.repo && body.prNumber) {
      owner = body.owner;
      repo = body.repo;
      prNumber = body.prNumber;
    } else {
      return Response.json(
        {
          error: "Provide prUrl or owner, repo, and prNumber",
          code: "INVALID_REQUEST",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    if (error instanceof PullRequestUrlError) {
      const { status, body: errorBody } = toApiErrorResponse(error);
      return Response.json(errorBody, { status });
    }
    throw error;
  }

  try {
    const octokit = await getAuthenticatedOctokit(session.user.id);
    await getPullRequest(octokit, owner, repo, prNumber);

    const jobId = await enqueueReviewJob({
      userId: session.user.id,
      repoOwner: owner,
      repoName: repo,
      prNumber,
    });

    return Response.json({ jobId }, { status: 201 });
  } catch (error) {
    const { status, body: errorBody } = toApiErrorResponse(error);
    return Response.json(errorBody, { status });
  }
}
