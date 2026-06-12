const assert = require('assert');
const { listFiles, readJson } = require('../scripts/offline-audit-lib');

const campaignFixtures = listFiles('tests/fixtures/campaigns', (file) => file.endsWith('.json'));
assert(campaignFixtures.length >= 2, 'expected campaign fixtures');

for (const file of campaignFixtures) {
  const fixture = readJson(file);
  assert.strictEqual(fixture.readonly, true, `${file} must be readonly`);
  assert.strictEqual(fixture.expected_recommendation_mode, 'analysis_only', `${file} must stay analysis-only`);
  assert(!fixture.action || fixture.action === 'read', `${file} must not define write actions`);
}

console.log('PASS campaign-readonly.test.js');
