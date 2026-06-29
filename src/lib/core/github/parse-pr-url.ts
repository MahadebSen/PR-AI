import { PullRequestUrlError } from "./errors";

const PR_URL_PATTERN =
  /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?(?:[?#].*)?$/i;

export type ParsedPullRequestUrl = {
  owner: string;
  repo: string;
  prNumber: number;
};

export function parsePullRequestUrl(input: string): ParsedPullRequestUrl {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new PullRequestUrlError("Enter a GitHub pull request URL");
  }

  const match = trimmed.match(PR_URL_PATTERN);

  if (!match) {
    throw new PullRequestUrlError(
      "Invalid URL. Use format: https://github.com/owner/repo/pull/123",
    );
  }

  const [, owner, repo, prNumberStr] = match;
  const prNumber = Number.parseInt(prNumberStr, 10);

  if (!Number.isFinite(prNumber) || prNumber <= 0) {
    throw new PullRequestUrlError("Invalid pull request number in URL");
  }

  return { owner, repo, prNumber };
}

export function isValidPullRequestUrl(input: string): boolean {
  try {
    parsePullRequestUrl(input);
    return true;
  } catch {
    return false;
  }
}
