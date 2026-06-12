const assert = require('assert');
const audit = require('../scripts/audit-dangerous-actions');

const report = audit.run();
assert(['PASS', 'WARN', 'FAIL'].includes(report.status), 'safety audit returns a status');
assert(Array.isArray(report.findings), 'safety audit returns findings');
for (const finding of report.findings) {
  assert.notStrictEqual(finding.severity, undefined, 'finding has severity');
  assert(finding.file, 'finding has file');
}

console.log('PASS safety-guards.test.js');
