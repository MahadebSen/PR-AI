import { z } from "zod";

export const commentAxisSchema = z.enum([
  "security",
  "performance",
  "code-quality",
  "test-suggestions",
]);

export const commentSeveritySchema = z.enum(["critical", "warning", "info"]);

export const reviewerCommentSchema = z.object({
  filePath: z.string().min(1),
  diffPosition: z.number().int().positive(),
  axis: commentAxisSchema,
  severity: commentSeveritySchema,
  body: z.string().min(1),
});

export const reviewerOutputSchema = z.object({
  comments: z.array(reviewerCommentSchema),
});

export const scrutinizerOutputSchema = z.object({
  comments: z.array(reviewerCommentSchema),
});

export type ReviewerComment = z.infer<typeof reviewerCommentSchema>;
export type ReviewerOutput = z.infer<typeof reviewerOutputSchema>;
export type ScrutinizerOutput = z.infer<typeof scrutinizerOutputSchema>;

export function parseJsonFromModel(content: string): unknown {
  const trimmed = content.trim();

  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  const jsonText = fenced?.[1]?.trim() ?? trimmed;

  return JSON.parse(jsonText);
}

export function parseReviewerOutput(content: string): ReviewerOutput {
  const parsed = parseJsonFromModel(content);
  return reviewerOutputSchema.parse(parsed);
}

export function parseScrutinizerOutput(content: string): ScrutinizerOutput {
  const parsed = parseJsonFromModel(content);
  return scrutinizerOutputSchema.parse(parsed);
}
