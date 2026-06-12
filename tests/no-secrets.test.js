const assert = require('assert');
const audit = require('../scripts/audit-secrets');

const report = audit.run();
assert(['PASS', 'WARN', 'FAIL'].includes(report.status), 'secrets audit returns a status');
assert(!report.findings.some((finding) => /outputs\/meta-assets\.local\.json/.test(finding.file)), 'ignored local outputs are not scanned');

console.log('PASS no-secrets.test.js');
