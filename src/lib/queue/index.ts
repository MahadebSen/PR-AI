import { createReviewJob, type CreateReviewJobInput } from "@/lib/db/reviews";
import { inngest } from "@/lib/queue/inngest/client";

export type EnqueueReviewInput = CreateReviewJobInput;

export async function enqueueReviewJob(input: EnqueueReviewInput): Promise<string> {
  const job = await createReviewJob(input);

  await inngest.send({
    name: "review/start",
    data: { jobId: job.id },
  });

  return job.id;
}
