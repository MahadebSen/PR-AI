import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

import type { AIServiceRouter, CompletionRequest, CompletionResponse } from "./index";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function createPlatformRouter(): AIServiceRouter {
  const apiKey = getRequiredEnv("OPENAI_API_KEY");
  const openai = createOpenAI({ apiKey });

  return {
    async complete(request: CompletionRequest): Promise<CompletionResponse> {
      const result = await generateText({
        model: openai(request.model),
        system: request.systemPrompt,
        prompt: request.userPrompt,
        temperature: 0.2,
      });

      return {
        content: result.text,
        inputTokens: result.usage?.inputTokens ?? 0,
        outputTokens: result.usage?.outputTokens ?? 0,
      };
    },
  };
}

export function getAgent1Model(): string {
  return process.env.AGENT1_MODEL ?? "gpt-4o-mini";
}

export function getAgent2Model(): string {
  return process.env.AGENT2_MODEL ?? "gpt-4o";
}
