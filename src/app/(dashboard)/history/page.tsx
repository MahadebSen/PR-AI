import {
  ReviewHistoryTable,
  type ReviewJobItem,
} from "@/components/discovery/ReviewHistoryTable";
import { requireSession } from "@/lib/auth/session";
import { listReviewJobs } from "@/lib/db/reviews";
import type { ReviewJobStatus } from "@/types/review";

function serializeJob(job: {
  id: string;
  repoOwner: string;
  repoName: string;
  prNumber: number;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}): ReviewJobItem {
  return {
    id: job.id,
    repoOwner: job.repoOwner,
    repoName: job.repoName,
    prNumber: job.prNumber,
    status: job.status as ReviewJobStatus,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
  };
}

export default async function HistoryPage() {
  const session = await requireSession();
  const { jobs } = await listReviewJobs(session.user.id, { limit: 50 });

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Review history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Past review jobs with live status updates.
        </p>
      </div>
      <ReviewHistoryTable initialJobs={jobs.map(serializeJob)} />
    </div>
  );
}
