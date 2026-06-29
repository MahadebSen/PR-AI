export type ApiErrorBody = {
  error: string;
  code?: string;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  const data = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    throw new ApiRequestError(
      data.error ?? "Request failed",
      response.status,
      data.code,
    );
  }

  return data;
}

export function isReauthError(error: unknown): boolean {
  return (
    error instanceof ApiRequestError &&
    (error.code === "GITHUB_REAUTH" || error.status === 401)
  );
}

export const GITHUB_SIGN_IN_URL = "/api/auth/signin?callbackUrl=/dashboard";
