#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const SECRET_PATTERNS = [
  /META_ACCESS_TOKEN\s*=\s*[^\s"']+/i,
  /ANTHROPIC_API_KEY\s*=\s*[^\s"']+/i,
  /SUPABASE_SERVICE_ROLE\s*=\s*[^\s"']+/i,
  /N8N_API_KEY\s*=\s*[^\s"']+/i,
  /EAAG[a-zA-Z0-9_-]{20,}/,
  /EAA[a-zA-Z0-9_-]{20,}/,
  /sk-[a-zA-Z0-9_-]{20,}/
];

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build"
]);

const IGNORE_FILES = new Set([
  ".env.example",
  "outputs/meta-assets.sample.json"
]);

let failures = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;

    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    if (IGNORE_FILES.has(rel)) continue;

    const text = fs.readFileSync(full, "utf8");
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(text)) {
        failures.push(rel);
        break;
      }
    }
  }
}

walk(ROOT);

if (failures.length) {
  console.error("FAIL: possible secrets found:");
  for (const file of failures) console.error(`- ${file}`);
  process.exit(1);
}

console.log("PASS: no obvious secrets found.");
