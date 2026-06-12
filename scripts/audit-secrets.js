#!/usr/bin/env node
const {
  addFinding,
  allRepoTextFiles,
  printReport,
  readText,
  result,
  summarize
} = require('./offline-audit-lib');

const SECRET_PATTERNS = [
  { name: 'Meta token', pattern: /\bEAAG[A-Za-z0-9_-]{20,}|\bEAA[A-Za-z0-9_-]{40,}/g },
  { name: 'Slack token', pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}/g },
  { name: 'OpenAI-style key', pattern: /\bsk-[A-Za-z0-9_-]{20,}/g },
  { name: 'Anthropic env assignment', pattern: /ANTHROPIC_API_KEY\s*=\s*["']?[^"'\s]+/g },
  { name: 'Meta env assignment', pattern: /META_ACCESS_TOKEN\s*=\s*["']?[^"'\s]+/g },
  { name: 'Supabase service role', pattern: /SUPABASE_SERVICE_ROLE(?:_KEY)?\s*=\s*["']?[^"'\s]+|SUPABASE_SERVICE_ROLE[A-Za-z0-9_.-]{20,}/g },
  { name: 'n8n API key', pattern: /N8N_API_KEY\s*=\s*["']?[^"'\s]+/g }
];

function isSafePlaceholder(value) {
  return /PLACEHOLDER|your_|TOKEN_REAL|example|dummy|mock|optional|REDACTED/i.test(value);
}

function run() {
  const report = result('secrets');
  for (const file of allRepoTextFiles()) {
    if (file === 'scripts/audit-secrets.js') continue;
    const text = readText(file);
    for (const { name, pattern } of SECRET_PATTERNS) {
      for (const match of text.matchAll(pattern)) {
        const sample = match[0];
        if (!isSafePlaceholder(sample)) {
          addFinding(report, 'FAIL', file, `Probable secret detected: ${name}.`, { sample: sample.slice(0, 12) + '...' });
        }
      }
    }
  }
  return summarize(report);
}

if (require.main === module) {
  const report = run();
  printReport(report);
  process.exit(report.status === 'FAIL' ? 1 : 0);
}

module.exports = { run };
