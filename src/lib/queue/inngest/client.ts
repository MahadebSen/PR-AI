import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "pr-ai",
});

export type ReviewStartEvent = {
  name: "review/start";
  data: {
    jobId: string;
  };
};
