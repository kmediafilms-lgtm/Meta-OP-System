const assert = require('assert');
const audit = require('../scripts/audit-agent-contracts');

const report = audit.run();
assert(['PASS', 'WARN', 'FAIL'].includes(report.status), 'agent audit returns a status');
assert(Array.isArray(report.findings), 'agent audit returns findings');
assert(report.findings.length > 0, 'current agents should produce actionable contract findings until contracts are added');

console.log('PASS agent-contracts.test.js');
