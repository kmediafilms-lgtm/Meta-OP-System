/**
 * validate-brand-configs.js
 * Validates all brand-config.json files in the brands/ directory.
 *
 * Rules by activation_status:
 *   active / testing — all required fields must be present and non-placeholder
 *   draft            — structural fields required; Meta IDs can be placeholders
 *   paused / archived — only structure validated, warns on placeholders
 *
 * New products are validated automatically — no code change needed.
 */

const fs   = require('fs')
const path = require('path')

const BRANDS_DIR = path.join(__dirname, '..', 'brands')

// Fields required for ALL products regardless of status
const ALWAYS_REQUIRED = [
  'brand_id', 'brand_name', 'business_unit', 'active_status',
  'default_language', 'tone_profile', 'services', 'responsible_users',
]

// Meta ID fields — only required for active/testing products
const META_ID_FIELDS = [
  'facebook_page_id', 'instagram_business_id', 'meta_ad_account_id',
]

const brandDirs = fs.existsSync(BRANDS_DIR)
  ? fs.readdirSync(BRANDS_DIR).filter(d => fs.statSync(path.join(BRANDS_DIR, d)).isDirectory())
  : []

let allValid = true

console.log('\n=== VALIDACIÓN DE PRODUCT CONFIGS ===\n')

for (const brandDir of brandDirs) {
  const configPath = path.join(BRANDS_DIR, brandDir, 'brand-config.json')
  console.log(`Producto: ${brandDir}`)

  if (!fs.existsSync(configPath)) {
    console.log('  ❌ brand-config.json no encontrado\n')
    allValid = false
    continue
  }

  let config
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  } catch (e) {
    console.log(`  ❌ JSON inválido: ${e.message}\n`)
    allValid = false
    continue
  }

  // Determine effective status
  const status = config.activation_status
    ?? (config.active_status === true ? 'active' : 'draft')

  console.log(`  Status: ${status}`)

  let productValid = true

  // Check structural fields
  for (const field of ALWAYS_REQUIRED) {
    if (config[field] === undefined || config[field] === null) {
      console.log(`  ❌ Campo faltante: ${field}`)
      productValid = false; allValid = false
    } else {
      console.log(`  ✅ ${field}`)
    }
  }

  // Check Meta ID fields based on status
  for (const field of META_ID_FIELDS) {
    const val = config[field]
    if (val === undefined || val === null) {
      if (['active', 'testing'].includes(status)) {
        console.log(`  ❌ ${field} — requerido para productos ${status}`)
        productValid = false; allValid = false
      } else {
        console.log(`  ⚠️  ${field} — no configurado (ok para status ${status})`)
      }
    } else if (typeof val === 'string' && val.startsWith('PLACEHOLDER')) {
      if (['active', 'testing'].includes(status)) {
        console.log(`  ❌ ${field} — placeholder no permitido para productos ${status}`)
        productValid = false; allValid = false
      } else {
        console.log(`  ⚠️  ${field} — placeholder (ok para status ${status})`)
      }
    } else {
      console.log(`  ✅ ${field}`)
    }
  }

  if (productValid) {
    console.log(`  → Config válida para: ${config.brand_name} [${status}]`)
  }
  console.log('')
}

if (brandDirs.length === 0) {
  console.log('⚠️  No se encontraron brand configs en brands/\n')
  process.exit(0)
}

if (allValid) {
  console.log(`✅ Todas las configuraciones de producto son válidas. (${brandDirs.length} productos)\n`)
  process.exit(0)
} else {
  console.log('❌ Hay problemas en algunas configuraciones. Revisar antes de activar.\n')
  process.exit(1)
}
