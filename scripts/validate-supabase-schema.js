#!/usr/bin/env node
// Validates that the Supabase migration SQL contains all required tables and constraints.

const fs = require('fs')
const path = require('path')

const MIGRATION_FILE = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql')
const SEED_FILE      = path.join(__dirname, '..', 'supabase', 'seed', '001_brands.sql')

const REQUIRED_TABLES = [
  'brands', 'contacts', 'conversations', 'messages', 'leads',
  'campaigns', 'campaign_metrics', 'approvals', 'followups',
  'events_log', 'learning_notes',
]

const TABLES_NEEDING_BRAND_ID = [
  'contacts', 'conversations', 'messages', 'leads',
  'campaigns', 'campaign_metrics', 'approvals', 'followups',
  'events_log', 'learning_notes',
]

// Only the 3 active products are required in the seed.
// Future products are added via Supabase INSERT — no code change needed.
const REQUIRED_BRANDS = [
  'kmediafilms', 'ana', 'drivip',
]

let errors = 0
let warnings = 0

function fail(msg) { console.error(`  ✗ ${msg}`); errors++ }
function warn(msg)  { console.warn( `  ⚠ ${msg}`); warnings++ }
function ok(msg)    { console.log(  `  ✓ ${msg}`) }

// Check migration file
console.log('[Migration SQL]')
if (!fs.existsSync(MIGRATION_FILE)) {
  fail(`Missing: ${MIGRATION_FILE}`)
  process.exit(1)
}

const sql = fs.readFileSync(MIGRATION_FILE, 'utf8').toLowerCase()

for (const table of REQUIRED_TABLES) {
  if (sql.includes(`create table ${table}`) || sql.includes(`create table if not exists ${table}`)) {
    ok(`Table defined: ${table}`)
  } else {
    fail(`Table missing: ${table}`)
  }
}

// brand_id references
console.log('\n[brand_id constraints]')
for (const table of TABLES_NEEDING_BRAND_ID) {
  // Look for brand_id column in context of the table
  const tableRegex = new RegExp(`create table[\\s\\S]*?${table}[\\s\\S]*?brand_id`)
  if (tableRegex.test(sql)) {
    ok(`${table} has brand_id`)
  } else {
    fail(`${table} missing brand_id column`)
  }
}

// RLS check
console.log('\n[Row Level Security]')
for (const table of REQUIRED_TABLES) {
  if (sql.includes(`enable row level security on ${table}`) || sql.includes(`alter table ${table} enable row level security`)) {
    ok(`RLS enabled: ${table}`)
  } else {
    warn(`RLS not found for: ${table} (check manually)`)
  }
}

// uuid check
console.log('\n[UUIDs]')
if (sql.includes('uuid_generate_v4()') || sql.includes('gen_random_uuid()')) {
  ok('UUID generation function present')
} else {
  warn('No UUID generation function found')
}

// updated_at trigger
if (sql.includes('updated_at') && sql.includes('trigger')) {
  ok('updated_at trigger present')
} else {
  warn('updated_at trigger not found')
}

// Seed file
console.log('\n[Seed File]')
if (!fs.existsSync(SEED_FILE)) {
  fail(`Missing: ${SEED_FILE}`)
} else {
  const seed = fs.readFileSync(SEED_FILE, 'utf8')
  for (const brandId of REQUIRED_BRANDS) {
    if (seed.includes(brandId)) {
      ok(`Brand seeded: ${brandId}`)
    } else {
      fail(`Brand missing from seed: ${brandId}`)
    }
  }
  if (seed.toLowerCase().includes('on conflict')) {
    ok('ON CONFLICT idempotent seed')
  } else {
    warn('Seed may not be idempotent (no ON CONFLICT)')
  }
}

console.log(`\n${'─'.repeat(50)}`)
console.log(`Errors: ${errors} | Warnings: ${warnings}`)

if (errors > 0) {
  console.error(`\n❌ FAILED — ${errors} error(s)`)
  process.exit(1)
} else if (warnings > 0) {
  console.warn(`\n⚠ PASSED with ${warnings} warning(s)`)
} else {
  console.log(`\n✅ Supabase schema valid`)
}
