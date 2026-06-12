#!/usr/bin/env node

const { spawnSync } = require("child_process");

const checks = [
  "node scripts/validate-brand-configs.js",
  "node scripts/route-test-events.js",
  "node scripts/test-webhook-payloads.js",
  "node scripts/check-no-secrets.js",
  "node scripts/check-no-dangerous-actions.js"
];

let failed = false;

for (const check of checks) {
  console.log(`\n> ${check}`);
  const result = spawnSync(check, {
    stdio: "inherit",
    shell: true
  });

  if (result.status !== 0) {
    failed = true;
  }
}

if (failed) {
  console.error("\nFAIL: offline audit failed.");
  process.exit(1);
}

console.log("\nPASS: offline audit passed.");
