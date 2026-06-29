const LOCKFILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "composer.lock",
  "Gemfile.lock",
  "Cargo.lock",
  "poetry.lock",
]);

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".svg",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp4",
  ".mp3",
  ".wasm",
]);

function basename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

function extension(path: string): string {
  const name = basename(path);
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

function matchesGlob(path: string, pattern: string): boolean {
  const regex = new RegExp(
    `^${pattern
      .replace(/\./g, "\\.")
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")
      .replace(/\?/g, ".")}$`,
  );
  return regex.test(path);
}

export function shouldIgnoreFile(filename: string): boolean {
  const base = basename(filename);
  const ext = extension(filename);

  if (LOCKFILES.has(base)) {
    return true;
  }

  if (base.startsWith(".env")) {
    return true;
  }

  if (matchesGlob(filename, "*.config.js") || matchesGlob(filename, "*.config.ts")) {
    return true;
  }

  if (ext === ".md" || ext === ".markdown") {
    return true;
  }

  if (BINARY_EXTENSIONS.has(ext)) {
    return true;
  }

  return false;
}
