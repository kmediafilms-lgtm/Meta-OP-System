#!/usr/bin/env node
const {
  addFinding,
  listFiles,
  printReport,
  readText,
  result,
  summarize
} = require('./offline-audit-lib');

const REQUIRED_MARKERS = ['input_schema', 'output_schema', 'allowed_actions', 'blocked_actions', 'failure_modes'];

function run() {
  const report = result('agent-contracts');
  const agents = listFiles('.claude/agents', (file) => file.endsWith('.md'));

  for (const file of agents) {
    const text = readText(file);
    for (const marker of REQUIRED_MARKERS) {
      if (!new RegExp(`\\b${marker}\\b`, 'i').test(text)) {
        addFinding(report, 'FAIL', file, `Missing required contract marker: ${marker}.`);
      }
    }
  }

  if (!agents.length) addFinding(report, 'FAIL', '.claude/agents', 'No agent files found.');
  return summarize(report);
}

if (require.main === module) {
  const report = run();
  printReport(report);
  process.exit(report.status === 'FAIL' ? 1 : 0);
}

module.exports = { run };
