#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const DANGEROUS_PATTERNS = [
  /sendMessage/i,
  /POST\s+.*\/messages/i,
  /whatsapp.*send/i,
  /campaign.*update/i,
  /adset.*update/i,
  /budget.*increase/i,
  /status\s*[:=]\s*["']ACTIVE["']/i,
  /active\s*[:=]\s*true/i
];

const SAFE_MARKERS = [
  "SAFE MODE",
  "DRAFT ONLY",
  "READ ONLY",
  "HUMAN APPROVAL REQUIRED",
  "do_not_execute"
];

const SCAN_DIRS = [
  "workflows",
  "agents",
  "scripts",
  "apps"
];

let warnings = [];

function scanFile(file) {
  const text = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(text)) {
      const hasSafeMarker = SAFE_MARKERS.some((marker) => text.includes(marker));
      if (!hasSafeMarker) {
        warnings.push(rel);
      }
    }
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    scanFile(full);
  }
}

for (const dir of SCAN_DIRS) {
  walk(path.join(ROOT, dir));
}

if (warnings.length) {
  console.error("FAIL: dangerous actions without safe markers:");
  for (const file of warnings) console.error(`- ${file}`);
  process.exit(1);
}

console.log("PASS: no unsafe dangerous actions detected.");
