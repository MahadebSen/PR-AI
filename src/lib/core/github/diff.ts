import type { Octokit } from "@octokit/rest";

import { mapGitHubError } from "./errors";

export type PullRequestFileDiff = {
  filename: string;
  status: string;
  patch?: string;
  additions: number;
  deletions: number;
};

const FILES_PER_PAGE = 100;

export async function fetchPullRequestFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<PullRequestFileDiff[]> {
  try {
    const files: PullRequestFileDiff[] = [];
    let page = 1;

    while (true) {
      const response = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
        per_page: FILES_PER_PAGE,
        page,
      });

      for (const file of response.data) {
        files.push({
          filename: file.filename,
          status: file.status,
          patch: file.patch ?? undefined,
          additions: file.additions,
          deletions: file.deletions,
        });
      }

      if (response.data.length < FILES_PER_PAGE) {
        break;
      }

      page += 1;
    }

    return files;
  } catch (error) {
    mapGitHubError(error);
  }
}
