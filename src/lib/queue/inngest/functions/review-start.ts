import { runReviewJob } from "@/lib/core/review/pipeline";

import { inngest } from "../client";

export const reviewStartFunction = inngest.createFunction(
  {
    id: "review-start",
    retries: 3,
    triggers: [{ event: "review/start" }],
  },
  async ({ event, step }) => {
    await step.run("run-review-pipeline", async () => {
      await runReviewJob(event.data.jobId);
    });
  },
);

export const inngestFunctions = [reviewStartFunction];
