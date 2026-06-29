export class GitHubAuthError extends Error {
  readonly code = "GITHUB_REAUTH" as const;

  constructor(message = "Re-authenticate GitHub") {
    super(message);
    this.name = "GitHubAuthError";
  }
}

export class GitHubForbiddenError extends Error {
  readonly code = "GITHUB_FORBIDDEN" as const;

  constructor(message = "You don't have access to this repository") {
    super(message);
    this.name = "GitHubForbiddenError";
  }
}

export class GitHubNotFoundError extends Error {
  readonly code = "GITHUB_NOT_FOUND" as const;

  constructor(message = "Pull request not found") {
    super(message);
    this.name = "GitHubNotFoundError";
  }
}

export class GitHubApiError extends Error {
  readonly code = "GITHUB_API_ERROR" as const;

  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export class GitHubRateLimitError extends Error {
  readonly code = "GITHUB_RATE_LIMIT" as const;

  constructor(message = "GitHub API rate limit exceeded. Try again in a few minutes.") {
    super(message);
    this.name = "GitHubRateLimitError";
  }
}

export class PullRequestUrlError extends Error {
  readonly code = "INVALID_PR_URL" as const;

  constructor(message: string) {
    super(message);
    this.name = "PullRequestUrlError";
  }
}

function isRequestError(
  error: unknown,
): error is {
  status?: number;
  message?: string;
  response?: { headers?: Record<string, string | undefined> };
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  );
}

function isRateLimitError(error: {
  status?: number;
  message?: string;
  response?: { headers?: Record<string, string | undefined> };
}): boolean {
  if (error.status === 429) {
    return true;
  }

  if (error.status !== 403) {
    return false;
  }

  const message = (error.message ?? "").toLowerCase();
  if (message.includes("rate limit")) {
    return true;
  }

  const remaining = error.response?.headers?.["x-ratelimit-remaining"];
  return remaining === "0";
}

export function mapGitHubError(error: unknown): never {
  if (
    error instanceof GitHubAuthError ||
    error instanceof GitHubForbiddenError ||
    error instanceof GitHubRateLimitError
  ) {
    throw error;
  }

  if (error instanceof GitHubNotFoundError || error instanceof PullRequestUrlError) {
    throw error;
  }

  if (isRequestError(error)) {
    switch (error.status) {
      case 401:
        throw new GitHubAuthError();
      case 403:
        if (isRateLimitError(error)) {
          throw new GitHubRateLimitError();
        }
        throw new GitHubForbiddenError(
          error.message?.toLowerCase().includes("saml")
            ? "Your organization requires SSO authorization for this repository"
            : "You don't have access to this repository",
        );
      case 404:
        throw new GitHubNotFoundError();
      default:
        throw new GitHubApiError(
          error.message ?? "GitHub API request failed",
          error.status,
        );
    }
  }

  throw error;
}

export function toApiErrorResponse(error: unknown): {
  status: number;
  body: { error: string; code?: string };
} {
  if (error instanceof GitHubAuthError) {
    return { status: 401, body: { error: error.message, code: error.code } };
  }

  if (error instanceof GitHubForbiddenError) {
    return { status: 403, body: { error: error.message, code: error.code } };
  }

  if (error instanceof GitHubRateLimitError) {
    return { status: 429, body: { error: error.message, code: error.code } };
  }

  if (error instanceof GitHubNotFoundError) {
    return { status: 404, body: { error: error.message, code: error.code } };
  }

  if (error instanceof PullRequestUrlError) {
    return { status: 400, body: { error: error.message, code: error.code } };
  }

  if (error instanceof GitHubApiError) {
    return {
      status: error.status ?? 502,
      body: { error: error.message, code: error.code },
    };
  }

  return { status: 500, body: { error: "Something went wrong" } };
}
