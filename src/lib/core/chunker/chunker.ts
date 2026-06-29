import type { PullRequestFileDiff } from "@/lib/core/github/diff";

import { shouldIgnoreFile } from "./ignore-patterns";
import {
  parseUnifiedDiff,
  patchToReviewLines,
  rebuildPatchFromLines,
  type DiffLine,
} from "./parse-diff";
import { computeTokenMetrics, type TokenMetrics } from "./token-metrics";

export type CodeChunk = {
  filePath: string;
  contextHeader: string;
  patch: string;
  /** Reviewable lines with GitHub diff positions. */
  lines: DiffLine[];
  startLine: number;
  endLine: number;
};

export type ProcessDiffResult = {
  chunks: CodeChunk[];
  metrics: TokenMetrics;
};

const MIN_CHUNK_LINES = 150;
const MAX_CHUNK_LINES = 200;

const BOUNDARY_PATTERNS = [
  /^\s*(export\s+)?(async\s+)?function\s+/,
  /^\s*(export\s+)?class\s+/,
  /^\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s*)?\(/,
  /^\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*(\{|\[)/,
  /^\s*(public|private|protected)\s+/,
  /^\s*@\w+/,
];

function findEnclosingSymbol(lines: DiffLine[], index: number): string {
  for (let i = index; i >= 0; i -= 1) {
    const content = lines[i]?.content ?? "";
    for (const pattern of BOUNDARY_PATTERNS) {
      if (pattern.test(content)) {
        return content.trim().slice(0, 80);
      }
    }
  }

  return "module scope";
}

function isStructuralBoundary(line: DiffLine): boolean {
  if (line.type === "deletion") {
    return false;
  }

  return BOUNDARY_PATTERNS.some((pattern) => pattern.test(line.content));
}

function splitLinesIntoChunks(lines: DiffLine[]): DiffLine[][] {
  if (lines.length <= MAX_CHUNK_LINES) {
    return [lines];
  }

  const chunks: DiffLine[][] = [];
  let start = 0;

  while (start < lines.length) {
    const remaining = lines.length - start;

    if (remaining <= MAX_CHUNK_LINES) {
      chunks.push(lines.slice(start));
      break;
    }

    const end = Math.min(start + MAX_CHUNK_LINES, lines.length);
    let splitAt = end;

    for (let i = end; i > start + MIN_CHUNK_LINES; i -= 1) {
      if (isStructuralBoundary(lines[i]!)) {
        splitAt = i;
        break;
      }
    }

    chunks.push(lines.slice(start, splitAt));
    start = splitAt;
  }

  return chunks;
}

function buildContextHeader(
  filePath: string,
  lines: DiffLine[],
  symbol: string,
): string {
  const startLine =
    lines.find((line) => line.newLineNumber !== null)?.newLineNumber ?? 1;
  const endLine =
    [...lines].reverse().find((line) => line.newLineNumber !== null)
      ?.newLineNumber ?? startLine;

  return [
    `File: ${filePath}`,
    `Symbol: ${symbol}`,
    `Lines: ${startLine}-${endLine}`,
  ].join("\n");
}

function processFile(file: PullRequestFileDiff): CodeChunk[] {
  if (!file.patch) {
    return [];
  }

  const allLines = patchToReviewLines(file.patch);
  const lineGroups = splitLinesIntoChunks(allLines);
  const fileChunks: CodeChunk[] = [];

  for (const group of lineGroups) {
    if (group.length === 0) {
      continue;
    }

    const symbol = findEnclosingSymbol(group, group.length - 1);
    const contextHeader = buildContextHeader(file.filename, group, symbol);
    const patch = rebuildPatchFromLines(group, file.filename);
    const startLine =
      group.find((line) => line.newLineNumber !== null)?.newLineNumber ?? 1;
    const endLine =
      [...group].reverse().find((line) => line.newLineNumber !== null)
        ?.newLineNumber ?? startLine;

    fileChunks.push({
      filePath: file.filename,
      contextHeader,
      patch,
      lines: group,
      startLine,
      endLine,
    });
  }

  return fileChunks;
}

export function processPullRequestDiff(
  files: PullRequestFileDiff[],
): ProcessDiffResult {
  const rawText = files
    .map((file) => file.patch ?? "")
    .filter(Boolean)
    .join("\n");

  const reviewableFiles = files.filter(
    (file) => file.patch && !shouldIgnoreFile(file.filename),
  );

  const filteredText = reviewableFiles.map((file) => file.patch ?? "").join("\n");

  const chunks = reviewableFiles.flatMap((file) => processFile(file));
  const chunkedTexts = chunks.map(
    (chunk) => `${chunk.contextHeader}\n\n${chunk.patch}`,
  );

  return {
    chunks,
    metrics: computeTokenMetrics(rawText, filteredText, chunkedTexts),
  };
}

/** Expose filtered file count for empty-diff detection. */
export function getReviewableFiles(files: PullRequestFileDiff[]) {
  return files.filter((file) => file.patch && !shouldIgnoreFile(file.filename));
}

export { parseUnifiedDiff };
