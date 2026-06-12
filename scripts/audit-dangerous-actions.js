#!/usr/bin/env node
const {
  addFinding,
  allRepoTextFiles,
  printReport,
  readText,
  result,
  summarize
} = require('./offline-audit-lib');

const DANGEROUS_PATTERNS = [
  /sendMessage/i,
  /\bmessages\b/i,
  /POST\s+\/messages/i,
  /campaign\s+update/i,
  /\bbudget\b/i,
  /adset\s+update/i,
  /whatsapp\s+send/i,
  /active\s*[:=]\s*true/i,
  /production\s+webhook/i
];

const GUARDRAILS = [
  /approval/i,
  /human/i,
  /readonly|read-only|solo lectura/i,
  /blocked|no enviar|do not send/i,
  /requires_human/i,
  /manual/i
];

function hasGuardrail(text, index) {
  const window = text.slice(Math.max(0, index - 260), Math.min(text.length, index + 260));
  return GUARDRAILS.some((pattern) => pattern.test(window));
}

function run() {
  const report = result('dangerous-actions');
  for (const file of allRepoTextFiles()) {
    if (/^scripts\/audit-|^scripts\/offline-audit-lib\.js|^scripts\/run-offline-audit\.js/.test(file)) continue;
    const text = readText(file);
    for (const pattern of DANGEROUS_PATTERNS) {
      const match = text.match(pattern);
      if (match && !hasGuardrail(text, match.index || 0)) {
        addFinding(report, 'WARN', file, `Potential dangerous action without nearby guardrail: ${match[0]}.`);
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
