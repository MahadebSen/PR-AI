import { createReviewJob, type CreateReviewJobInput } from "@/lib/db/reviews";

export type EnqueueReviewInput = CreateReviewJobInput;

export async function enqueueReviewJob(input: EnqueueReviewInput): Promise<string> {
  const job = await createReviewJob(input);
  // Phase 3: await inngest.send({ name: "review/start", data: { jobId: job.id } });
  return job.id;
}
