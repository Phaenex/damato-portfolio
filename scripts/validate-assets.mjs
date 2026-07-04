#!/usr/bin/env node
/**
 * Prebuild asset validation — fails fast when required public files are missing
 * or out of spec. See README.md Assets section for the regen workflow.
 */
import { readFileSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function fail(msg) {
  console.error(`validate-assets: ${msg}`);
  process.exit(1);
}

function assertExists(relPath) {
  const abs = join(root, relPath);
  if (!existsSync(abs)) fail(`missing ${relPath}`);
  return abs;
}

function assertMinBytes(relPath, minBytes) {
  const abs = assertExists(relPath);
  const size = statSync(abs).size;
  if (size <= minBytes) {
    fail(`${relPath} is ${size} bytes (expected > ${minBytes})`);
  }
}

function jpegDimensions(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) break;
    const marker = buf[i + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      return {
        height: buf.readUInt16BE(i + 5),
        width: buf.readUInt16BE(i + 7),
      };
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}

function pngDimensions(buf) {
  const sig = buf.toString("ascii", 1, 4);
  if (sig !== "PNG") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// headshot
{
  const abs = assertExists("public/headshot_1000.jpg");
  const buf = readFileSync(abs);
  const dim = jpegDimensions(buf);
  if (!dim) fail("public/headshot_1000.jpg is not a readable JPEG");
  if (dim.width < 500 || dim.height < 500) {
    fail(
      `public/headshot_1000.jpg is ${dim.width}×${dim.height} (expected ≥ 500×500)`,
    );
  }
}

// resume PDF
assertMinBytes("public/DAmato_Resume_DataAnalyst.pdf", 10 * 1024);

// olympic medals dataset
{
  const abs = assertExists("public/olympic-medals.json");
  const rows = JSON.parse(readFileSync(abs, "utf8"));
  if (!Array.isArray(rows)) fail("public/olympic-medals.json must be a JSON array");
  if (rows.length !== 1343) {
    fail(`public/olympic-medals.json has ${rows.length} rows (expected 1343)`);
  }
}

// car rental ER diagram
assertExists("public/projects/car-rental/er_diagram.png");

// power bi screenshots
const powerBiPages = [
  "public/projects/power-bi/page-1-sales-overview.png",
  "public/projects/power-bi/page-2-sales-details.png",
  "public/projects/power-bi/page-3-salary-analysis.png",
];
for (const rel of powerBiPages) {
  assertMinBytes(rel, 5 * 1024);
  const buf = readFileSync(join(root, rel));
  const dim = pngDimensions(buf);
  if (!dim) fail(`${rel} is not a readable PNG`);
}

console.log("validate-assets: all checks passed");
