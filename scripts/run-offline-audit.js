#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');
const { printReport } = require('./offline-audit-lib');

const AUDITS = [
  './audit-brand-isolation',
  './audit-agent-contracts',
  './audit-dangerous-actions',
  './audit-secrets',
  './audit-n8n-workflows-static',
  './audit-dashboard-static',
  './audit-supabase-schema'
];

const TESTS = [
  'tests/brand-routing.test.js',
  'tests/agent-contracts.test.js',
  'tests/safety-guards.test.js',
  'tests/campaign-readonly.test.js',
  'tests/no-secrets.test.js',
  'tests/schema-consistency.test.js'
];

function runAudits() {
  return AUDITS.map((modulePath) => {
    const audit = require(modulePath);
    const report = audit.run();
    printReport(report);
    return report;
  });
}

function runTests() {
  const reports = [];
  for (const test of TESTS) {
    const run = spawnSync(process.execPath, [test], {
      cwd: path.resolve(__dirname, '..'),
      encoding: 'utf8',
      maxBuffer: 1024 * 1024
    });
    const status = run.status === 0 ? 'PASS' : 'FAIL';
    const output = `${run.stdout || ''}${run.stderr || ''}`.trim();
    const report = {
      name: test,
      status,
      summary: status === 'PASS' ? 'test passed' : 'test failed',
      findings: status === 'PASS' ? [] : [{ severity: 'FAIL', file: test, message: output || 'Test failed' }]
    };
    printReport(report);
    reports.push(report);
  }
  return reports;
}

function finalStatus(reports) {
  if (reports.some((report) => report.status === 'FAIL')) return 'FAIL';
  if (reports.some((report) => report.status === 'WARN')) return 'WARN';
  return 'PASS';
}

function main() {
  console.log('=== WEDO Meta OS Offline Audit ===');
  console.log('Mode: offline-only, no external service calls\n');

  const reports = [...runAudits(), ...runTests()];
  const status = finalStatus(reports);
  const counts = reports.reduce((acc, report) => {
    acc[report.status] += 1;
    return acc;
  }, { PASS: 0, WARN: 0, FAIL: 0 });

  console.log('\n=== Summary ===');
  console.log(`PASS: ${counts.PASS}`);
  console.log(`WARN: ${counts.WARN}`);
  console.log(`FAIL: ${counts.FAIL}`);
  console.log(`FINAL: ${status}`);

  process.exit(status === 'FAIL' ? 1 : 0);
}

main();
