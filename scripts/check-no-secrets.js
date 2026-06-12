#!/usr/bin/env node
// Scans the repo for hardcoded secrets, tokens, or credentials.
// Must exit 0 before any commit.

const fs = require('fs')
const path = require('path')

const SECRET_PATTERNS = [
  { pattern: /EAAl[A-Za-z0-9]{20,}/,              label: 'Meta Access Token (EAAl...)' },
  { pattern: /EAAG[A-Za-z0-9]{20,}/,              label: 'Meta Access Token (EAAG...)' },
  { pattern: /eyJhbGciOiJIUzI1NiJ9\.[A-Za-z0-9]/, label: 'JWT-looking token' },
  { pattern: /sk-[A-Za-z0-9]{32,}/,               label: 'OpenAI-style API key' },
  { pattern: /api[_-]?key\s*[:=]\s*['"`][A-Za-z0-9_\-]{16,}/i, label: 'api_key assignment' },
  { pattern: /access[_-]?token\s*[:=]\s*['"`][A-Za-z0-9_\-]{16,}/i, label: 'access_token assignment' },
  { pattern: /secret\s*[:=]\s*['"`][A-Za-z0-9_\-]{16,}/i, label: 'secret assignment' },
  { pattern: /password\s*[:=]\s*['"`][^\s'"`,]{8,}/i, label: 'password hardcoded' },
  { pattern: /service_role_key\s*[:=]\s*['"`]ey/i, label: 'Supabase service role key' },
  { pattern: /SUPABASE_SERVICE_ROLE\s*=\s*['"`]\S/, label: 'SUPABASE_SERVICE_ROLE value' },
  { pattern: /n8n[_-]api[_-]?key\s*[:=]\s*['"`]\S/i, label: 'n8n API key' },
  // Allowlist: process.env.* references are fine
]

const ALLOWLIST_PATTERNS = [
  /process\.env\./,
  /\$\{.*\}/,
  /YOUR_.*_HERE/i,
  /<.*>/,
  /example/i,
  /placeholder/i,
  /REPLACE_WITH/i,
  /\bxxx\b/i,
  /TOKEN_REAL/i,
  /TOKEN_DE_/i,
  /AQUI_VA/i,
  /TU_TOKEN/i,
  /_TOKEN["'`]\s*#/i,
]

const SKIP_PATHS = [
  'node_modules', '.git', '.next', 'check-no-secrets.js',
  '.env.example', '.env.sample',
]

const SKIP_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2']

function isAllowed(line) {
  return ALLOWLIST_PATTERNS.some(p => p.test(line))
}

function shouldSkip(filePath) {
  const ext = path.extname(filePath)
  return SKIP_PATHS.some(p => filePath.includes(p)) || SKIP_EXTENSIONS.includes(ext)
}

function scanFile(filePath) {
  const findings = []
  let content
  try {
    content = fs.readFileSync(filePath, 'utf8')
  } catch {
    return findings
  }
  const lines = content.split('\n')

  for (const { pattern, label } of SECRET_PATTERNS) {
    lines.forEach((line, i) => {
      if (pattern.test(line) && !isAllowed(line)) {
        findings.push({ line: i + 1, label, text: line.trim().slice(0, 120) })
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
    } else if (entry.isFile()) {
      const findings = scanFile(fullPath)
      if (findings.length > 0) {
        const rel = path.relative(ROOT, fullPath)
        results.push({ file: rel, findings })
      }
    }
  }
}

const ROOT = path.join(__dirname, '..')
const results = []

scanDir(ROOT)

if (results.length === 0) {
  console.log('✅ No hardcoded secrets detected')
  process.exit(0)
}

console.error('🚨 POTENTIAL SECRETS FOUND:\n')
for (const { file, findings } of results) {
  console.error(`  ${file}`)
  for (const f of findings) {
    console.error(`    Line ${f.line}: [${f.label}]`)
    console.error(`    > ${f.text}`)
  }
}

console.error(`\n${results.length} file(s). Remove secrets and use process.env.* instead.`)
console.error('NEVER commit credentials to the repository.')
process.exit(1)
