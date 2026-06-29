import { serve } from "inngest/next";

import { inngest } from "@/lib/queue/inngest/client";
import { inngestFunctions } from "@/lib/queue/inngest/functions/review-start";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
