import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";

type ReviewPageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  await requireSession();
  const { jobId } = await params;

  return (
    <div className="px-6 py-8 md:px-10">
      <Card>
        <CardHeader>
          <CardTitle>Review results</CardTitle>
          <CardDescription>
            Job <code className="font-mono text-foreground">{jobId}</code> —
            staged comments and diff viewer arrive in Phase 4.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This route is protected for AUTH-5. Review workspace UI will display
          AI findings here once the review engine is live.
        </CardContent>
      </Card>
    </div>
  );
}
