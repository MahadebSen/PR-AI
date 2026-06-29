import { requireApiSession } from "@/lib/auth/session";
import { listReviewComments } from "@/lib/db/comments";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireApiSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await context.params;
  const comments = await listReviewComments(jobId, session.user.id);

  if (comments === null) {
    return Response.json({ error: "Review job not found" }, { status: 404 });
  }

  return Response.json({ comments });
}
