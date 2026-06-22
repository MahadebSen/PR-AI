/**
 * AIServiceRouter — sole LLM entry point for the review engine.
 * Implementation arrives in Phase 3; direct provider SDK imports stay outside core/.
 */

export type CompletionRequest = {
  model: string;
  systemPrompt: string;
  userPrompt: string;
};

export type CompletionResponse = {
  content: string;
  inputTokens: number;
  outputTokens: number;
};

export type AIServiceRouter = {
  complete(request: CompletionRequest): Promise<CompletionResponse>;
};
