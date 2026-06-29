import type { CodeChunk } from "@/lib/core/chunker";
import type { AIServiceRouter } from "@/lib/core/router";

import { runReviewer } from "./reviewer";
import { runScrutinizer } from "./scrutinizer";
import type { ReviewerComment } from "./schemas";

export type ChunkCouncilResult = {
  comments: Array<ReviewerComment & { verified: boolean }>;
};

export async function runCouncilForChunk(
  router: AIServiceRouter,
  chunk: CodeChunk,
): Promise<ChunkCouncilResult> {
  const { comments: reviewerComments, rawJson } = await runReviewer(router, chunk);
  const scrutinizer = await runScrutinizer(
    router,
    chunk,
    rawJson,
    reviewerComments,
  );

  return {
    comments: scrutinizer.comments.map((comment) => ({
      ...comment,
      verified: scrutinizer.verified,
    })),
  };
}
