/** GitHub REST discovery (Phase 2) and comment/Git Data API (Phase 4–5). */

export { createGitHubClient } from "./client";
export {
  fetchPullRequestFiles,
  type PullRequestFileDiff,
} from "./diff";
export {
  getAuthenticatedOctokit,
  getPullRequest,
  listOpenPulls,
  listUserRepos,
  type PullRequestSummary,
  type RepoSummary,
} from "./discovery";
export {
  GitHubApiError,
  GitHubAuthError,
  GitHubForbiddenError,
  GitHubNotFoundError,
  GitHubRateLimitError,
  PullRequestUrlError,
  mapGitHubError,
  toApiErrorResponse,
} from "./errors";
export {
  isValidPullRequestUrl,
  parsePullRequestUrl,
  type ParsedPullRequestUrl,
} from "./parse-pr-url";
