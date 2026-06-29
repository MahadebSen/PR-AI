import type { CommentAxis, CommentSeverity } from "@/types/review";
import { prisma } from "./client";
import { getReviewJob } from "./reviews";

export type ReviewCommentInput = {
  filePath: string;
  diffPosition: number;
  axis: CommentAxis;
  severity: CommentSeverity;
  body: string;
  verified?: boolean;
};

function toPrismaAxis(axis: CommentAxis) {
  switch (axis) {
    case "security":
      return "security" as const;
    case "performance":
      return "performance" as const;
    case "code-quality":
      return "code_quality" as const;
    case "test-suggestions":
      return "test_suggestions" as const;
  }
}

function toPrismaSeverity(severity: CommentSeverity) {
  return severity;
}

export function fromPrismaAxis(
  axis: "security" | "performance" | "code_quality" | "test_suggestions",
): CommentAxis {
  switch (axis) {
    case "security":
      return "security";
    case "performance":
      return "performance";
    case "code_quality":
      return "code-quality";
    case "test_suggestions":
      return "test-suggestions";
  }
}

export async function saveReviewComments(
  jobId: string,
  comments: ReviewCommentInput[],
) {
  if (comments.length === 0) {
    return [];
  }

  await prisma.reviewComment.createMany({
    data: comments.map((comment) => ({
      jobId,
      filePath: comment.filePath,
      diffPosition: comment.diffPosition,
      axis: toPrismaAxis(comment.axis),
      severity: toPrismaSeverity(comment.severity),
      body: comment.body,
      postedToGitHub: false,
      verified: comment.verified ?? true,
    })),
  });

  return prisma.reviewComment.findMany({
    where: { jobId },
    orderBy: { createdAt: "asc" },
  });
}

export async function listReviewComments(jobId: string, userId: string) {
  const job = await getReviewJob(jobId, userId);

  if (!job) {
    return null;
  }

  const comments = await prisma.reviewComment.findMany({
    where: { jobId },
    orderBy: [{ filePath: "asc" }, { diffPosition: "asc" }],
  });

  return comments.map((comment) => ({
    id: comment.id,
    filePath: comment.filePath,
    diffPosition: comment.diffPosition,
    axis: fromPrismaAxis(comment.axis),
    severity: comment.severity as CommentSeverity,
    body: comment.body,
    postedToGitHub: comment.postedToGitHub,
    verified: comment.verified,
    createdAt: comment.createdAt.toISOString(),
  }));
}
