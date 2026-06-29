import { runCouncilForChunk } from "@/lib/core/council";
import { processPullRequestDiff } from "@/lib/core/chunker";
import {
  fetchPullRequestFiles,
  getAuthenticatedOctokit,
} from "@/lib/core/github";
import { createPlatformRouter } from "@/lib/core/router";
import type { ReviewCommentInput } from "@/lib/db/comments";
import { saveReviewComments } from "@/lib/db/comments";
import {
  getReviewJobById,
  updateReviewJobStatus,
} from "@/lib/db/reviews";

function dedupeComments(
  comments: ReviewCommentInput[],
): ReviewCommentInput[] {
  const seen = new Set<string>();
  const result: ReviewCommentInput[] = [];

  for (const comment of comments) {
    const key = `${comment.filePath}:${comment.diffPosition}:${comment.axis}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(comment);
  }

  return result;
}

export async function runReviewJob(jobId: string): Promise<void> {
  const job = await getReviewJobById(jobId);

  if (!job) {
    throw new Error(`Review job not found: ${jobId}`);
  }

  if (job.status === "completed" || job.status === "failed") {
    return;
  }

  try {
    await updateReviewJobStatus(jobId, "chunking");

    const octokit = await getAuthenticatedOctokit(job.userId);
    const files = await fetchPullRequestFiles(
      octokit,
      job.repoOwner,
      job.repoName,
      job.prNumber,
    );

    const { chunks, metrics } = processPullRequestDiff(files);

    await updateReviewJobStatus(jobId, "chunking", {
      tokenCounts: metrics,
    });

    if (chunks.length === 0) {
      await updateReviewJobStatus(jobId, "completed", {
        errorMessage: "No reviewable changes in this pull request",
        completedAt: new Date(),
        tokenCounts: metrics,
      });
      return;
    }

    const router = createPlatformRouter();
    const allComments: ReviewCommentInput[] = [];

    for (const chunk of chunks) {
      await updateReviewJobStatus(jobId, "reviewing");

      const result = await runCouncilForChunk(router, chunk);

      await updateReviewJobStatus(jobId, "scrutinizing");

      for (const comment of result.comments) {
        allComments.push({
          filePath: comment.filePath,
          diffPosition: comment.diffPosition,
          axis: comment.axis,
          severity: comment.severity,
          body: comment.body,
          verified: comment.verified,
        });
      }
    }

    const vetted = dedupeComments(allComments);
    await saveReviewComments(jobId, vetted);

    await updateReviewJobStatus(jobId, "completed", {
      completedAt: new Date(),
      tokenCounts: metrics,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Review job failed unexpectedly";

    await updateReviewJobStatus(jobId, "failed", {
      errorMessage: message,
      completedAt: new Date(),
    });

    throw error;
  }
}
