#!/usr/bin/env node
// Scans agent contracts, n8n workflow code, and scripts for dangerous automated actions.
// Exits 1 if any unguarded dangerous pattern is found.

const fs = require('fs')
const path = require('path')

// Patterns that must never appear in agents or automated code without human approval guard
const DANGEROUS_PATTERNS = [
  { pattern: /sendMessage\s*\(/,           label: 'sendMessage() call' },
  { pattern: /send_message\s*\(/,          label: 'send_message() call' },
  { pattern: /sendWhatsApp\s*\(/i,         label: 'WhatsApp send call' },
  { pattern: /graphs?\.facebook\.com.*POST/i, label: 'Facebook Graph POST' },
  { pattern: /pauseCampaign\s*\(/i,        label: 'pauseCampaign() call' },
  { pattern: /modifyCampaign\s*\(/i,       label: 'modifyCampaign() call' },
  { pattern: /deleteCampaign\s*\(/i,       label: 'deleteCampaign() call' },
  { pattern: /deleteAdSet\s*\(/i,          label: 'deleteAdSet() call' },
  { pattern: /createCampaign\s*\(/i,       label: 'createCampaign() call' },
  { pattern: /axios\.post.*graph\.facebook/i, label: 'axios POST to Graph API' },
  { pattern: /fetch\s*\(\s*['"`]https:\/\/graph\.facebook/i, label: 'fetch to Graph API' },
  { pattern: /ACCESS_TOKEN\s*=\s*['"`][^'"` ]{10,}/i, label: 'ACCESS_TOKEN hardcoded value' },
]

// Lines matching these are never flagged (documentation/prohibition context)
const SAFE_CONTEXT_PATTERNS = [
  /no.*cold.?dm/i,
  /block.*cold/i,
  /cold.*bloquear/i,
  /BLOQUEAR/,
  /nunca.*cold/i,
  /process\.env\./,
  /\$\{.*TOKEN/,
  /blocked_actions/,
  /no_cold_dm/,
  /prohibited/i,
  /prohibido/i,
]

// Directories to scan
const SCAN_DIRS = [
  path.join(__dirname, '..', 'agents'),
  path.join(__dirname, '..', '.claude', 'agents'),
  path.join(__dirname),
]

// Files/dirs to skip
const SKIP_PATTERNS = [
  'node_modules', '.git', '.next', 'check-no-dangerous-actions.js',
  'check-no-secrets.js',
]

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some(p => filePath.includes(p))
}

function scanFile(filePath) {
  const findings = []
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')

  for (const { pattern, label } of DANGEROUS_PATTERNS) {
    lines.forEach((line, i) => {
      if (pattern.test(line)) {
        // Check if the line has a guard (requires_human, approval, mock) or safe context
        const context = [lines[i - 1] ?? '', line, lines[i + 1] ?? ''].join(' ')
        const hasGuard = /requires_human|approval_required|human.?approval|MOCK|mock/i.test(context)
        const isSafeContext = SAFE_CONTEXT_PATTERNS.some(p => p.test(context))
        if (!hasGuard && !isSafeContext) {
          findings.push({ line: i + 1, label, text: line.trim() })
        }
      }
    })
  }
  return findings
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (shouldSkip(fullPath)) continue

    if (entry.isDirectory()) {
      scanDir(fullPath)
    } else if (entry.isFile() && /\.(js|ts|json|md)$/.test(entry.name)) {
      const findings = scanFile(fullPath)
      if (findings.length > 0) {
        const rel = path.relative(path.join(__dirname, '..'), fullPath)
        results.push({ file: rel, findings })
      }
    }
  }
}

const results = []

for (const dir of SCAN_DIRS) {
  scanDir(dir)
}

if (results.length === 0) {
  console.log('✅ No dangerous unguarded actions found')
  process.exit(0)
}

console.error('❌ Dangerous action patterns detected:\n')
for (const { file, findings } of results) {
  console.error(`  ${file}`)
  for (const f of findings) {
    console.error(`    Line ${f.line}: [${f.label}] ${f.text.slice(0, 100)}`)
  }
}

console.error(`\n${results.length} file(s) with issues. Add human approval guard or move to mock mode.`)
process.exit(1)
