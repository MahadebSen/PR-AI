/** Review job lifecycle — see docs/PR-AI-PRD.md §5 */
export type ReviewJobStatus =
  | "queued"
  | "chunking"
  | "reviewing"
  | "scrutinizing"
  | "completed"
  | "failed";

/** Comment review axes — see docs/PR-AI-PRD.md §5 */
export type CommentAxis =
  | "security"
  | "performance"
  | "code-quality"
  | "test-suggestions";

/** Comment severity levels — see docs/PR-AI-PRD.md §5 */
export type CommentSeverity = "critical" | "warning" | "info";
