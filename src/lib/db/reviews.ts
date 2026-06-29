import type { ReviewJobStatus } from "@/types/review";
import { prisma } from "./client";

export type CreateReviewJobInput = {
  userId: string;
  repoOwner: string;
  repoName: string;
  prNumber: number;
};

export type PullRequestKey = {
  repoOwner: string;
  repoName: string;
  prNumber: number;
};

export async function createReviewJob(input: CreateReviewJobInput) {
  return prisma.reviewJob.create({
    data: {
      userId: input.userId,
      repoOwner: input.repoOwner,
      repoName: input.repoName,
      prNumber: input.prNumber,
      status: "queued",
    },
  });
}

export async function getReviewJob(jobId: string, userId: string) {
  return prisma.reviewJob.findFirst({
    where: { id: jobId, userId },
  });
}

export async function listReviewJobs(
  userId: string,
  options: { limit?: number; cursor?: string } = {},
) {
  const limit = options.limit ?? 20;

  const jobs = await prisma.reviewJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(options.cursor
      ? {
          cursor: { id: options.cursor },
          skip: 1,
        }
      : {}),
  });

  const hasNext = jobs.length > limit;
  const items = hasNext ? jobs.slice(0, limit) : jobs;

  return {
    jobs: items,
    nextCursor: hasNext ? items[items.length - 1]?.id : null,
  };
}

export async function getLatestJobsForPullRequests(
  userId: string,
  prKeys: PullRequestKey[],
) {
  if (prKeys.length === 0) {
    return new Map<string, { id: string; status: ReviewJobStatus }>();
  }

  const jobs = await prisma.reviewJob.findMany({
    where: {
      userId,
      OR: prKeys.map((key) => ({
        repoOwner: key.repoOwner,
        repoName: key.repoName,
        prNumber: key.prNumber,
      })),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      repoOwner: true,
      repoName: true,
      prNumber: true,
    },
  });

  const map = new Map<string, { id: string; status: ReviewJobStatus }>();

  for (const job of jobs) {
    const key = `${job.repoOwner}/${job.repoName}#${job.prNumber}`;
    if (!map.has(key)) {
      map.set(key, { id: job.id, status: job.status as ReviewJobStatus });
    }
  }

  return map;
}

export function pullRequestKey(
  repoOwner: string,
  repoName: string,
  prNumber: number,
): string {
  return `${repoOwner}/${repoName}#${prNumber}`;
}

export type TokenCounts = {
  raw: number;
  filtered: number;
  chunked: number;
};

export type UpdateReviewJobStatusInput = {
  errorMessage?: string | null;
  completedAt?: Date | null;
  tokenCounts?: TokenCounts;
};

export async function getReviewJobById(jobId: string) {
  return prisma.reviewJob.findUnique({
    where: { id: jobId },
  });
}

export async function updateReviewJobStatus(
  jobId: string,
  status: ReviewJobStatus,
  options: UpdateReviewJobStatusInput = {},
) {
  const data: {
    status: ReviewJobStatus;
    errorMessage?: string | null;
    completedAt?: Date | null;
    rawTokenCount?: number;
    filteredTokenCount?: number;
    chunkedTokenCount?: number;
  } = { status };

  if (options.errorMessage !== undefined) {
    data.errorMessage = options.errorMessage;
  }

  if (options.completedAt !== undefined) {
    data.completedAt = options.completedAt;
  }

  if (options.tokenCounts) {
    data.rawTokenCount = options.tokenCounts.raw;
    data.filteredTokenCount = options.tokenCounts.filtered;
    data.chunkedTokenCount = options.tokenCounts.chunked;
  }

  return prisma.reviewJob.update({
    where: { id: jobId },
    data,
  });
}

export async function getReviewJobCommentCount(jobId: string) {
  return prisma.reviewComment.count({
    where: { jobId },
  });
}
