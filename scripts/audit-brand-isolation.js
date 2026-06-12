#!/usr/bin/env node
const {
  addFinding,
  buildBrandIndex,
  listFiles,
  printReport,
  readJson,
  resolveBrand,
  result,
  summarize
} = require('./offline-audit-lib');

function run() {
  const report = result('brand-isolation');
  const index = buildBrandIndex();
  const fixtures = listFiles('tests/fixtures/meta', (file) => file.endsWith('.json'));

  for (const file of fixtures) {
    const payload = readJson(file);
    const resolved = resolveBrand(payload, index);
    if (payload.expected_action === 'escalate_to_human') {
      if (resolved.action !== 'escalate_to_human') {
        addFinding(report, 'FAIL', file, `Expected human escalation, got ${resolved.action}.`);
      }
      continue;
    }
    if (resolved.brand_id !== payload.expected_brand_id) {
      addFinding(report, 'FAIL', file, `Expected ${payload.expected_brand_id}, got ${resolved.brand_id || 'unresolved'}.`);
    }
  }

  if (!fixtures.length) addFinding(report, 'FAIL', 'tests/fixtures/meta', 'No Meta routing fixtures found.');
  return summarize(report);
}

if (require.main === module) {
  const report = run();
  printReport(report);
  process.exit(report.status === 'FAIL' ? 1 : 0);
}

module.exports = { run };
