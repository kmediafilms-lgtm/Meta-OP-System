#!/usr/bin/env node
// Validates that all 8 agent contracts are present and structurally correct.

const fs = require('fs')
const path = require('path')

const REQUIRED_AGENTS = [
  'brand-router',
  'intent-classifier',
  'lead-scoring',
  'compliance',
  'copy-conversion',
  'campaign-analyst',
  'human-approval',
  'learning',
]

const REQUIRED_FILES = ['contract.json', 'prompt.md', 'tests.json']

const REQUIRED_CONTRACT_FIELDS = [
  'name', 'version', 'description', 'input_schema', 'output_schema',
  'blocked_actions', 'max_tokens',
]

const SAFETY_BLOCKED_PATTERNS = [
  'send_message', 'send_whatsapp', 'modify_campaign', 'pause_campaign',
  'delete_adset', 'call_meta_api', 'execute_action', 'override_policy',
  'create_campaign',
]

let errors = 0
let warnings = 0

function fail(msg) { console.error(`  ✗ ${msg}`); errors++ }
function warn(msg)  { console.warn( `  ⚠ ${msg}`); warnings++ }
function ok(msg)    { console.log(  `  ✓ ${msg}`) }

const agentsDir = path.join(__dirname, '..', 'agents')

for (const agentName of REQUIRED_AGENTS) {
  console.log(`\n[${agentName}]`)
  const agentDir = path.join(agentsDir, agentName)

  if (!fs.existsSync(agentDir)) {
    fail(`Directory missing: agents/${agentName}`)
    continue
  }

  for (const file of REQUIRED_FILES) {
    const filePath = path.join(agentDir, file)
    if (!fs.existsSync(filePath)) {
      fail(`Missing file: agents/${agentName}/${file}`)
    } else {
      ok(`${file} present`)
    }
  }

  // Validate contract.json structure
  const contractPath = path.join(agentDir, 'contract.json')
  if (!fs.existsSync(contractPath)) continue

  let contract
  try {
    contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'))
  } catch (e) {
    fail(`contract.json parse error: ${e.message}`)
    continue
  }

  for (const field of REQUIRED_CONTRACT_FIELDS) {
    if (contract[field] === undefined) {
      fail(`contract.json missing field: ${field}`)
    }
  }

  if (contract.name !== agentName) {
    fail(`contract.json name mismatch: expected "${agentName}", got "${contract.name}"`)
  }

  // Validate blocked_actions
  if (!Array.isArray(contract.blocked_actions)) {
    fail('contract.json blocked_actions must be an array')
  } else if (contract.blocked_actions.length === 0) {
    warn('blocked_actions is empty — agent has no safety constraints')
  } else {
    ok(`blocked_actions: [${contract.blocked_actions.join(', ')}]`)
  }

  // Safety check: dangerous actions must be blocked in agents that could send messages
  if (['brand-router', 'intent-classifier', 'copy-conversion'].includes(agentName)) {
    for (const dangerous of SAFETY_BLOCKED_PATTERNS) {
      if (!contract.blocked_actions.includes(dangerous)) {
        // Not all agents need all blocks — just warn if the most critical ones are missing
        if (['send_message', 'send_whatsapp', 'call_meta_api'].includes(dangerous)) {
          warn(`"${dangerous}" not in blocked_actions (consider adding)`)
        }
      }
    }
  }

  // do_not_send / do_not_execute const checks
  if (agentName === 'copy-conversion') {
    const doNotSend = contract.output_schema?.properties?.do_not_send
    if (!doNotSend || doNotSend.const !== true) {
      fail('copy-conversion: output_schema.do_not_send must have const: true')
    } else {
      ok('do_not_send const:true confirmed')
    }
  }
  if (agentName === 'campaign-analyst') {
    const doNotExec = contract.output_schema?.properties?.do_not_execute
    if (!doNotExec || doNotExec.const !== true) {
      fail('campaign-analyst: output_schema.do_not_execute must have const: true')
    } else {
      ok('do_not_execute const:true confirmed')
    }
  }
  if (agentName === 'human-approval') {
    const approvalRequired = contract.output_schema?.properties?.approval_required
    if (!approvalRequired || approvalRequired.const !== true) {
      fail('human-approval: output_schema.approval_required must have const: true')
    } else {
      ok('approval_required const:true confirmed')
    }
  }
}

console.log(`\n${'─'.repeat(50)}`)
console.log(`Agents: ${REQUIRED_AGENTS.length} | Errors: ${errors} | Warnings: ${warnings}`)

if (errors > 0) {
  console.error(`\n❌ FAILED — ${errors} error(s) found`)
  process.exit(1)
} else if (warnings > 0) {
  console.warn(`\n⚠ PASSED with ${warnings} warning(s)`)
} else {
  console.log(`\n✅ All agent contracts valid`)
}
