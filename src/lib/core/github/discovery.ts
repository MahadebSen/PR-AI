import type { Octokit } from "@octokit/rest";

import { getGitHubAccessToken } from "@/lib/auth/tokens";

import { createGitHubClient } from "./client";
import { GitHubAuthError, mapGitHubError } from "./errors";

export type RepoSummary = {
  fullName: string;
  owner: string;
  name: string;
  openIssuesCount: number;
  private: boolean;
  updatedAt: string;
};

export type PullRequestSummary = {
  number: number;
  title: string;
  author: string | null;
  headRef: string;
  createdAt: string;
  htmlUrl: string;
};

export async function getAuthenticatedOctokit(
  userId: string,
): Promise<Octokit> {
  const token = await getGitHubAccessToken(userId);

  if (!token) {
    throw new GitHubAuthError();
  }

  return createGitHubClient(token);
}

export async function listUserRepos(
  octokit: Octokit,
  page = 1,
  perPage = 30,
): Promise<{ repos: RepoSummary[]; page: number; hasNext: boolean }> {
  try {
    const response = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      direction: "desc",
      per_page: perPage,
      page,
    });

    const repos: RepoSummary[] = response.data.map((repo) => ({
      fullName: repo.full_name,
      owner: repo.owner.login,
      name: repo.name,
      openIssuesCount: repo.open_issues_count,
      private: repo.private,
      updatedAt: repo.updated_at ?? new Date().toISOString(),
    }));

    return {
      repos,
      page,
      hasNext: repos.length === perPage,
    };
  } catch (error) {
    mapGitHubError(error);
  }
}

export async function listOpenPulls(
  octokit: Octokit,
  owner: string,
  repo: string,
  page = 1,
  perPage = 30,
): Promise<{ pulls: PullRequestSummary[]; page: number; hasNext: boolean }> {
  try {
    const response = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "open",
      sort: "updated",
      direction: "desc",
      per_page: perPage,
      page,
    });

    const pulls: PullRequestSummary[] = response.data.map((pull) => ({
      number: pull.number,
      title: pull.title,
      author: pull.user?.login ?? null,
      headRef: pull.head.ref,
      createdAt: pull.created_at,
      htmlUrl: pull.html_url,
    }));

    return {
      pulls,
      page,
      hasNext: pulls.length === perPage,
    };
  } catch (error) {
    mapGitHubError(error);
  }
}

export async function getPullRequest(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<PullRequestSummary> {
  try {
    const response = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    const pull = response.data;

    return {
      number: pull.number,
      title: pull.title,
      author: pull.user?.login ?? null,
      headRef: pull.head.ref,
      createdAt: pull.created_at,
      htmlUrl: pull.html_url,
    };
  } catch (error) {
    mapGitHubError(error);
  }
}
