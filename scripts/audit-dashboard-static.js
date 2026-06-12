#!/usr/bin/env node
const {
  addFinding,
  listFiles,
  printReport,
  readText,
  result,
  summarize
} = require('./offline-audit-lib');

const PUBLIC_SECRET_PATTERNS = [
  /NEXT_PUBLIC_.*(?:SECRET|TOKEN|SERVICE_ROLE|API_KEY)/i,
  /VITE_.*(?:SECRET|TOKEN|SERVICE_ROLE|API_KEY)/i,
  /SUPABASE_SERVICE_ROLE/i
];

const REAL_ACTION_PATTERNS = [
  /\/messages\b/i,
  /campaigns?\/.*(?:update|pause|delete)/i,
  /adsets?\/.*(?:update|pause|delete)/i,
  /sendMessage|sendWhatsApp|sendInstagram/i
];

function run() {
  const report = result('dashboard-static');
  const dashboardFiles = [
    ...listFiles('app', (file) => /\.(js|jsx|ts|tsx)$/.test(file)),
    ...listFiles('pages', (file) => /\.(js|jsx|ts|tsx)$/.test(file)),
    ...listFiles('src', (file) => /\.(js|jsx|ts|tsx)$/.test(file)),
    ...listFiles('dashboard', (file) => /\.(js|jsx|ts|tsx)$/.test(file))
  ];

  if (!dashboardFiles.length) {
    addFinding(report, 'WARN', 'dashboard', 'No dashboard source files found yet.');
    return summarize(report);
  }

  for (const file of dashboardFiles) {
    const text = readText(file);
    for (const pattern of PUBLIC_SECRET_PATTERNS) {
      if (pattern.test(text)) addFinding(report, 'FAIL', file, `Public env exposes dangerous secret pattern: ${pattern}.`);
    }
    for (const pattern of REAL_ACTION_PATTERNS) {
      if (pattern.test(text) && !/disabled|mock|dryRun|readOnly|approval/i.test(text)) {
        addFinding(report, 'FAIL', file, `Dashboard may call real Meta action without mock/disabled guardrail: ${pattern}.`);
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
