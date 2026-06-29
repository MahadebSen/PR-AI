import type { CodeChunk } from "@/lib/core/chunker";
import type { AIServiceRouter } from "@/lib/core/router";
import { getAgent1Model } from "@/lib/core/router";

import {
  buildReviewerUserPrompt,
  REVIEWER_SYSTEM_PROMPT,
} from "./prompts";
import { withRetry } from "./retry";
import { parseReviewerOutput, type ReviewerComment } from "./schemas";

export async function runReviewer(
  router: AIServiceRouter,
  chunk: CodeChunk,
): Promise<{ comments: ReviewerComment[]; rawJson: string }> {
  const response = await withRetry(async () => {
    const result = await router.complete({
      model: getAgent1Model(),
      systemPrompt: REVIEWER_SYSTEM_PROMPT,
      userPrompt: buildReviewerUserPrompt(chunk),
    });

    try {
      const parsed = parseReviewerOutput(result.content);
      return { parsed, rawJson: result.content };
    } catch {
      const retryResult = await router.complete({
        model: getAgent1Model(),
        systemPrompt: REVIEWER_SYSTEM_PROMPT,
        userPrompt: `${buildReviewerUserPrompt(chunk)}

Your previous response was invalid JSON. Return ONLY valid JSON matching the schema.`,
      });
      const parsed = parseReviewerOutput(retryResult.content);
      return { parsed, rawJson: retryResult.content };
    }
  });

  return {
    comments: response.parsed.comments,
    rawJson: response.rawJson,
  };
}
