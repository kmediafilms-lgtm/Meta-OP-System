const assert = require('assert');
const { buildBrandIndex, listFiles, readJson, resolveBrand } = require('../scripts/offline-audit-lib');

const index = buildBrandIndex();
const fixtures = listFiles('tests/fixtures/meta', (file) => file.endsWith('.json'));

assert(fixtures.length >= 6, 'expected Meta routing fixtures');

for (const file of fixtures) {
  const fixture = readJson(file);
  const resolved = resolveBrand(fixture, index);
  if (fixture.expected_action === 'escalate_to_human') {
    assert.strictEqual(resolved.action, 'escalate_to_human', `${file} should escalate`);
  } else {
    assert.strictEqual(resolved.brand_id, fixture.expected_brand_id, `${file} should resolve brand`);
  }
}

console.log('PASS brand-routing.test.js');
