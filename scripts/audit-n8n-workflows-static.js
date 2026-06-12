#!/usr/bin/env node
const {
  addFinding,
  listFiles,
  printReport,
  readJson,
  result,
  summarize
} = require('./offline-audit-lib');

function isReadOnlyGraphNode(node) {
  const text = `${node.name || ''} ${JSON.stringify(node.parameters || {})}`;
  return /\bGet\b|read.?only|solo lectura|insights|getCampaigns|GET\s+\//i.test(text)
    && !/POST|DELETE|update|pause|respond|reply|send/i.test(text);
}

function isSendCapableNode(node) {
  const name = node.name || '';
  const type = node.type || '';
  const params = JSON.stringify(node.parameters || {});
  if (/n8n-nodes-base\.whatsApp/i.test(type)) return true;
  if (/n8n-nodes-base\.facebookGraphApi/i.test(type)) return !isReadOnlyGraphNode(node);
  if (/^(Send|Respond|Reply)\b/i.test(name)) return true;
  if (/POST\s+\/messages|whatsapp\s+send/i.test(params)) return true;
  return false;
}

function run() {
  const report = result('n8n-workflows-static');
  const workflows = listFiles('workflows', (file) => file.endsWith('.json'));

  for (const file of workflows) {
    let workflow;
    try {
      workflow = readJson(file);
    } catch (error) {
      addFinding(report, 'FAIL', file, `Invalid workflow JSON: ${error.message}`);
      continue;
    }

    if (workflow.active === true) {
      addFinding(report, 'FAIL', file, 'Workflow is explicitly active.');
    } else if (workflow.active === undefined) {
      addFinding(report, 'WARN', file, 'Workflow does not declare active:false; confirm import defaults before production.');
    }

    for (const node of workflow.nodes || []) {
      const haystack = `${node.name || ''} ${node.type || ''} ${JSON.stringify(node.parameters || {})}`;
      if (isSendCapableNode(node)) {
        if (!/approval|human|template|solo lectura|read.?only|no enviar|requires_human/i.test(haystack)) {
          addFinding(report, 'FAIL', file, `Potential real send node lacks approval/read-only guardrail: ${node.name || node.id}.`);
        } else {
          addFinding(report, 'WARN', file, `Send-capable node found; verify disabled/mocked before import: ${node.name || node.id}.`);
        }
      }
    }
  }

  if (!workflows.length) addFinding(report, 'WARN', 'workflows', 'No workflow JSON files found.');
  return summarize(report);
}

if (require.main === module) {
  const report = run();
  printReport(report);
  process.exit(report.status === 'FAIL' ? 1 : 0);
}

module.exports = { run };
