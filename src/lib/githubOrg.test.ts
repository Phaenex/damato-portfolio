import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.resolve(__dirname, "..");

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mdx", ".json"]);

function collectFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, out);
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

describe("GitHub org rename (Damatnic -> Phaenex)", () => {
  it("has no github.com/Damatnic references left under src/", () => {
    // The GitHub account this site links to was renamed from Damatnic to
    // Phaenex (2026-09). GitHub redirects the old profile URL for a while,
    // but a redirect isn't a reason to keep shipping a stale link — and a
    // future rename of the *next* org would silently un-redirect this one.
    // This scans every source/doc file under src/ (not just the handful of
    // spots fixed in the initial pass) so a new page that copy-pastes an old
    // link fails CI instead of shipping a dead reference.
    const offenders: { file: string; line: number; text: string }[] = [];

    for (const file of collectFiles(SRC_ROOT)) {
      if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue; // fixtures may reference the old name intentionally
      const lines = fs.readFileSync(file, "utf8").split("\n");
      lines.forEach((line, idx) => {
        if (line.includes("github.com/Damatnic")) {
          offenders.push({ file: path.relative(SRC_ROOT, file), line: idx + 1, text: line.trim() });
        }
      });
    }

    if (offenders.length > 0) {
      const details = offenders
        .map((o) => `  ${o.file}:${o.line}  ${o.text}`)
        .join("\n");
      throw new Error(
        `Found ${offenders.length} github.com/Damatnic reference(s) under src/ — the GitHub ` +
          `account was renamed to Phaenex. Replace with github.com/Phaenex:\n${details}`,
      );
    }

    expect(offenders).toEqual([]);
  });
});
