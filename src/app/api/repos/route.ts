import { requireApiSession } from "@/lib/auth/session";
import {
  getAuthenticatedOctokit,
  listUserRepos,
  toApiErrorResponse,
} from "@/lib/core/github";

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  const session = await requireApiSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const perPage = Math.min(
    parsePositiveInt(searchParams.get("per_page"), 30),
    100,
  );

  try {
    const octokit = await getAuthenticatedOctokit(session.user.id);
    const result = await listUserRepos(octokit, page, perPage);

    return Response.json(result);
  } catch (error) {
    const { status, body } = toApiErrorResponse(error);
    return Response.json(body, { status });
  }
}
