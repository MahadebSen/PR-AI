import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";

export default async function PRDetailsPage() {
  await requireSession();
  return (
    <div className="px-6 py-8 md:px-10">
      <Card>
        <CardHeader>
          <CardTitle>PR details</CardTitle>
          <CardDescription>
            Pull request metadata and diff workspace — coming in Phase 2–4.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This view will show PR title, branch info, file changes, and links to
          review results.
        </CardContent>
      </Card>
    </div>
  );
}
