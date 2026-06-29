export type DiffLine = {
  /** 1-indexed position in the unified diff patch (GitHub diff position). */
  diffPosition: number;
  type: "context" | "addition" | "deletion";
  content: string;
  newLineNumber: number | null;
};

export type ParsedDiffHunk = {
  oldStart: number;
  newStart: number;
  lines: DiffLine[];
};

export function parseUnifiedDiff(patch: string): ParsedDiffHunk[] {
  const hunks: ParsedDiffHunk[] = [];
  const lines = patch.split("\n");
  let currentHunk: ParsedDiffHunk | null = null;
  let diffPosition = 0;
  let newLineNumber = 0;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      const match = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (match) {
        newLineNumber = Number.parseInt(match[2] ?? "0", 10);
        currentHunk = {
          oldStart: Number.parseInt(match[1] ?? "0", 10),
          newStart: newLineNumber,
          lines: [],
        };
        hunks.push(currentHunk);
      }
      continue;
    }

    if (!currentHunk) {
      continue;
    }

    diffPosition += 1;

    if (line.startsWith("+")) {
      currentHunk.lines.push({
        diffPosition,
        type: "addition",
        content: line.slice(1),
        newLineNumber,
      });
      newLineNumber += 1;
    } else if (line.startsWith("-")) {
      currentHunk.lines.push({
        diffPosition,
        type: "deletion",
        content: line.slice(1),
        newLineNumber: null,
      });
    } else if (line.startsWith(" ") || line === "") {
      currentHunk.lines.push({
        diffPosition,
        type: "context",
        content: line.startsWith(" ") ? line.slice(1) : line,
        newLineNumber,
      });
      newLineNumber += 1;
    }
  }

  return hunks;
}

export function patchToReviewLines(patch: string): DiffLine[] {
  return parseUnifiedDiff(patch).flatMap((hunk) => hunk.lines);
}

export function rebuildPatchFromLines(lines: DiffLine[], filePath: string): string {
  const additions = lines.filter((line) => line.type === "addition").length;
  const deletions = lines.filter((line) => line.type === "deletion").length;
  const firstNewLine =
    lines.find((line) => line.newLineNumber !== null)?.newLineNumber ?? 1;

  const body = lines
    .map((line) => {
      if (line.type === "addition") {
        return `+${line.content}`;
      }
      if (line.type === "deletion") {
        return `-${line.content}`;
      }
      return ` ${line.content}`;
    })
    .join("\n");

  return [
    `--- a/${filePath}`,
    `+++ b/${filePath}`,
    `@@ -0,0 +${firstNewLine},${additions + deletions} @@`,
    body,
  ].join("\n");
}
