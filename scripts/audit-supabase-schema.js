#!/usr/bin/env node
const {
  addFinding,
  listFiles,
  printReport,
  readJson,
  readText,
  result,
  summarize
} = require('./offline-audit-lib');

const OPERATIONAL_TABLES = ['lead', 'message', 'conversation', 'campaign', 'followup', 'approval'];
const TOKEN_COLUMN_PATTERN = /\b(access_token|refresh_token|api_key|secret|service_role|password)\b/i;

function runJsonSchemas(report) {
  for (const file of listFiles('schemas', (entry) => entry.endsWith('.schema.json'))) {
    let schema;
    try {
      schema = readJson(file);
    } catch (error) {
      addFinding(report, 'FAIL', file, `Invalid JSON schema: ${error.message}`);
      continue;
    }
    const lower = file.toLowerCase();
    if (OPERATIONAL_TABLES.some((name) => lower.includes(name))) {
      if (!Array.isArray(schema.required) || !schema.required.includes('brand_id')) {
        addFinding(report, 'FAIL', file, 'Operational schema must require brand_id.');
      }
    }
    for (const prop of Object.keys(schema.properties || {})) {
      if (TOKEN_COLUMN_PATTERN.test(prop)) addFinding(report, 'FAIL', file, `Schema includes token-like column: ${prop}.`);
    }
  }
}

function runSqlFiles(report) {
  const sqlFiles = [
    ...listFiles('supabase', (file) => file.endsWith('.sql')),
    ...listFiles('db', (file) => file.endsWith('.sql')),
    ...listFiles('migrations', (file) => file.endsWith('.sql'))
  ];

  if (!sqlFiles.length) {
    addFinding(report, 'WARN', 'supabase', 'No Supabase SQL schema/migrations found yet; JSON schemas were audited instead.');
    return;
  }

  for (const file of sqlFiles) {
    const text = readText(file);
    if (!/row level security|enable row level security|rls/i.test(text)) {
      addFinding(report, 'FAIL', file, 'RLS is not documented or enabled in SQL.');
    }
    if (TOKEN_COLUMN_PATTERN.test(text)) {
      addFinding(report, 'FAIL', file, 'SQL appears to define or seed token-like fields.');
    }
  }
}

function run() {
  const report = result('supabase-schema');
  runJsonSchemas(report);
  runSqlFiles(report);
  return summarize(report);
}

if (require.main === module) {
  const report = run();
  printReport(report);
  process.exit(report.status === 'FAIL' ? 1 : 0);
}

module.exports = { run };
