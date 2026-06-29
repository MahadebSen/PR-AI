import type { ReviewJobStatus } from "@/types/review";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ReviewDisplayStatus =
  | "not-reviewed"
  | "in-progress"
  | "reviewed"
  | "failed";

export function getReviewDisplayStatus(
  status: ReviewJobStatus | null | undefined,
): ReviewDisplayStatus {
  if (!status) return "not-reviewed";

  switch (status) {
    case "queued":
    case "chunking":
    case "reviewing":
    case "scrutinizing":
      return "in-progress";
    case "completed":
      return "reviewed";
    case "failed":
      return "failed";
    default:
      return "not-reviewed";
  }
}

const LABELS: Record<ReviewDisplayStatus, string> = {
  "not-reviewed": "Not reviewed",
  "in-progress": "In progress",
  reviewed: "Reviewed",
  failed: "Failed",
};

const VARIANTS: Record<
  ReviewDisplayStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  "not-reviewed": "outline",
  "in-progress": "secondary",
  reviewed: "default",
  failed: "destructive",
};

type ReviewStatusBadgeProps = {
  status: ReviewJobStatus | null | undefined;
  className?: string;
};

export function ReviewStatusBadge({ status, className }: ReviewStatusBadgeProps) {
  const displayStatus = getReviewDisplayStatus(status);

  return (
    <Badge variant={VARIANTS[displayStatus]} className={cn(className)}>
      {LABELS[displayStatus]}
    </Badge>
  );
}
