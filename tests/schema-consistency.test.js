const assert = require('assert');
const { listFiles, readJson } = require('../scripts/offline-audit-lib');

const operational = ['lead', 'message', 'conversation', 'campaign', 'followup', 'approval'];
const schemas = listFiles('schemas', (file) => file.endsWith('.schema.json'));
assert(schemas.length >= operational.length, 'expected operational schemas');

for (const file of schemas) {
  const schema = readJson(file);
  const lower = file.toLowerCase();
  if (operational.some((name) => lower.includes(name))) {
    assert(Array.isArray(schema.required), `${file} must define required fields`);
    assert(schema.required.includes('brand_id'), `${file} must require brand_id`);
  }
}

console.log('PASS schema-consistency.test.js');
