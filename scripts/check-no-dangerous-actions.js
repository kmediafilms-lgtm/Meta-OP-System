#!/usr/bin/env node

const fs   = require("fs");
const path = require("path");

const ROOT = process.cwd();

// ── Patterns that indicate actual message sends or campaign mutations ─────────
const MUTATION_PATTERNS = [
  { pattern: /sendMessage\s*\(/i,                           label: "sendMessage() call" },
  { pattern: /POST\s+.*\/messages/i,                        label: "POST to /messages endpoint" },
  { pattern: /whatsapp.*\.send\s*\(/i,                      label: "WhatsApp send call" },
  { pattern: /campaign.*\.update\s*\(/i,                    label: "campaign.update() call" },
  { pattern: /adset.*\.update\s*\(/i,                       label: "adset.update() call" },
  { pattern: /budget.*increase/i,                           label: "budget increase reference" },
];

// ── Browser automation / scraping patterns — ALWAYS PROHIBITED ───────────────
const BROWSER_PATTERNS = [
  { pattern: /require\s*\(\s*['"`]puppeteer/i,              label: "puppeteer import" },
  { pattern: /require\s*\(\s*['"`]playwright/i,             label: "playwright import" },
  { pattern: /require\s*\(\s*['"`]selenium/i,               label: "selenium import" },
  { pattern: /from\s+['"`]puppeteer/i,                      label: "puppeteer import (ESM)" },
  { pattern: /from\s+['"`]playwright/i,                     label: "playwright import (ESM)" },
  { pattern: /from\s+['"`]@playwright/i,                    label: "playwright import (ESM)" },
  { pattern: /chromium\.launch/i,                           label: "chromium.launch()" },
  { pattern: /browserless/i,                                label: "browserless reference" },
  { pattern: /navigator\.webdriver/i,                       label: "navigator.webdriver (bot detection bypass)" },
  { pattern: /page\.click\s*\(/i,                           label: "page.click() — browser automation" },
  { pattern: /page\.goto\s*\(/i,                            label: "page.goto() — browser navigation" },
  { pattern: /page\.fill\s*\(/i,                            label: "page.fill() — browser automation" },
  { pattern: /browser\.newPage/i,                           label: "browser.newPage() — browser automation" },
  { pattern: /webdriver\.Chrome/i,                          label: "Selenium WebDriver" },
  { pattern: /business\.facebook\.com/i,                    label: "business.facebook.com URL — UI scraping risk" },
  { pattern: /adsmanager\.facebook\.com/i,                  label: "adsmanager.facebook.com URL — UI scraping risk" },
  { pattern: /scraping/i,                                   label: "scraping reference" },
  { pattern: /\bscrape\b/i,                                 label: "scrape reference" },
];

// ── Files that are documentation or declarations of prohibitions ──────────────
// These are allowed to MENTION banned terms (they define rules, not execute them).
const ALLOWED_IN_DOCS = [
  "docs/",                          // all docs are prohibition/policy text
  "agents/",                        // contract.json blocked_actions lists, prompts
  ".claude/agents/",                // Claude subagent definitions
  "check-no-dangerous-actions.js",  // this file
  "SECURITY.md",
  "AUDIT.md",
];

// ── Files/dirs to skip entirely ───────────────────────────────────────────────
const IGNORE_DIRS  = new Set([".git", "node_modules", ".next", "dist", "build"]);
const SCAN_DIRS    = ["workflows", "agents", "scripts", "apps", "lib", ".claude"];

const SAFE_MARKERS = [
  "SAFE MODE", "DRAFT ONLY", "READ ONLY",
  "HUMAN APPROVAL REQUIRED", "do_not_execute",
];

let failures = [];

function isDocFile(rel) {
  return ALLOWED_IN_DOCS.some(p => rel.startsWith(p) || rel.includes(p));
}

function scanFile(file) {
  const rel  = path.relative(ROOT, file);
  const text = fs.readFileSync(file, "utf8");

  // Mutation patterns: ok if file has a safe marker
  for (const { pattern, label } of MUTATION_PATTERNS) {
    if (pattern.test(text)) {
      const safe = SAFE_MARKERS.some(m => text.includes(m));
      if (!safe) {
        failures.push({ file: rel, label, type: "mutation" });
      }
    }
  }

  // Browser/scraping patterns: never ok in non-doc files
  if (!isDocFile(rel)) {
    for (const { pattern, label } of BROWSER_PATTERNS) {
      if (pattern.test(text)) {
        failures.push({ file: rel, label, type: "browser_automation" });
      }
    }
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    scanFile(full);
  }
}

for (const dir of SCAN_DIRS) {
  walk(path.join(ROOT, dir));
}

if (failures.length) {
  console.error("FAIL: dangerous actions detected:\n");
  const byType = {};
  for (const f of failures) {
    (byType[f.type] = byType[f.type] ?? []).push(f);
  }
  for (const [type, items] of Object.entries(byType)) {
    console.error(`  [${type}]`);
    for (const { file, label } of items) {
      console.error(`    ${file}: ${label}`);
    }
  }
  process.exit(1);
}

console.log("PASS: no unsafe dangerous actions detected.");
