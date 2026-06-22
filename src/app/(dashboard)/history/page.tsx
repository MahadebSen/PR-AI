import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <div className="px-6 py-8 md:px-10">
      <Card>
        <CardHeader>
          <CardTitle>Review history</CardTitle>
          <CardDescription>
            Past review jobs with status tracking — coming in Phase 2.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You&apos;ll see queued, in-progress, completed, and failed reviews
          here once the GitHub discovery flow is implemented.
        </CardContent>
      </Card>
    </div>
  );
}
