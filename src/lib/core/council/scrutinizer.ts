import type { CodeChunk } from "@/lib/core/chunker";
import type { AIServiceRouter } from "@/lib/core/router";
import { getAgent2Model } from "@/lib/core/router";

import {
  buildScrutinizerUserPrompt,
  SCRUTINIZER_SYSTEM_PROMPT,
} from "./prompts";
import { withRetry } from "./retry";
import {
  parseScrutinizerOutput,
  type ReviewerComment,
} from "./schemas";

export type ScrutinizerResult = {
  comments: ReviewerComment[];
  verified: boolean;
};

export async function runScrutinizer(
  router: AIServiceRouter,
  chunk: CodeChunk,
  reviewerJson: string,
  fallbackComments: ReviewerComment[],
): Promise<ScrutinizerResult> {
  try {
    const response = await withRetry(async () => {
      const result = await router.complete({
        model: getAgent2Model(),
        systemPrompt: SCRUTINIZER_SYSTEM_PROMPT,
        userPrompt: buildScrutinizerUserPrompt(chunk, reviewerJson),
      });

      try {
        return parseScrutinizerOutput(result.content);
      } catch {
        const retryResult = await router.complete({
          model: getAgent2Model(),
          systemPrompt: SCRUTINIZER_SYSTEM_PROMPT,
          userPrompt: `${buildScrutinizerUserPrompt(chunk, reviewerJson)}

Your previous response was invalid JSON. Return ONLY valid JSON matching the schema.`,
        });
        return parseScrutinizerOutput(retryResult.content);
      }
    });

    return {
      comments: response.comments,
      verified: true,
    };
  } catch {
    return {
      comments: fallbackComments,
      verified: false,
    };
  }
}
