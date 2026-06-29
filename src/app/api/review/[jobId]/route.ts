import { requireApiSession } from "@/lib/auth/session";
import { getReviewJob, getReviewJobCommentCount } from "@/lib/db/reviews";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireApiSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await context.params;
  const job = await getReviewJob(jobId, session.user.id);

  if (!job) {
    return Response.json({ error: "Review job not found" }, { status: 404 });
  }

  const commentCount = await getReviewJobCommentCount(jobId);

  return Response.json({
    id: job.id,
    repoOwner: job.repoOwner,
    repoName: job.repoName,
    prNumber: job.prNumber,
    status: job.status,
    errorMessage: job.errorMessage,
    rawTokenCount: job.rawTokenCount,
    filteredTokenCount: job.filteredTokenCount,
    chunkedTokenCount: job.chunkedTokenCount,
    commentCount,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
  });
}
