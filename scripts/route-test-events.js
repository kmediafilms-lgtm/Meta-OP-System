/**
 * route-test-events.js
 * Simulates brand routing without sending anything real.
 * Uses the Product Registry dynamically — no hardcoded product list.
 *
 * Usage:
 *   node scripts/route-test-events.js                    # self-test mode
 *   node scripts/route-test-events.js --ig_id <ID>       # single event
 *   node scripts/route-test-events.js --page_id <ID>     # single event
 */

const { routeEvent, loadProducts } = require('../lib/product-registry')

const args = process.argv.slice(2)

if (args.length === 0) {
  // Self-test: build cases from the live registry + an unknown case
  const products = loadProducts()
  const testCases = []

  for (const p of products) {
    const status = p.activation_status ?? (p.active_status === true ? 'active' : 'draft')
    if (status === 'archived') continue

    if (p.instagram_business_id && !p.instagram_business_id.startsWith('PLACEHOLDER')) {
      testCases.push({ label: `${p.brand_name} via ig_id`, input: { ig_id: p.instagram_business_id }, expected: p.brand_id })
    }
    if (p.facebook_page_id && !p.facebook_page_id.startsWith('PLACEHOLDER')) {
      testCases.push({ label: `${p.brand_name} via page_id`, input: { page_id: p.facebook_page_id }, expected: p.brand_id })
    }
    if (p.meta_ad_account_id && !p.meta_ad_account_id.startsWith('PLACEHOLDER') && p.meta_ad_account_id !== '') {
      testCases.push({ label: `${p.brand_name} via ad_account`, input: { ad_account_id: p.meta_ad_account_id }, expected: p.brand_id })
    }
  }

  // Unknown product must always escalate
  testCases.push({ label: 'Unknown product (escalate to human)', input: { ig_id: 'unknown_ig_id_000' }, expected: 'unidentified' })
  // Missing IDs must escalate
  testCases.push({ label: 'Missing IDs (escalate to human)', input: {}, expected: 'unidentified' })
  // Future product fixture (demonstrates adding without code change)
  const fixturePath = require('path').join(__dirname, '..', 'tests', 'fixtures', 'products', 'new-product-example.json')
  if (require('fs').existsSync(fixturePath)) {
    const fixture = JSON.parse(require('fs').readFileSync(fixturePath, 'utf8'))
    testCases.push({ label: `Future product fixture (should be unidentified — not in registry)`, input: { ig_id: fixture.instagram_business_id }, expected: 'unidentified' })
  }

  console.log('\n=== ROUTE SELF-TEST ===')
  console.log(`Products in registry: ${products.length}`)
  let passed = 0; let failed = 0

  for (const test of testCases) {
    const result = routeEvent(test.input)
    const ok = result.brand_id === test.expected
    console.log(`  ${ok ? '✅' : '✗'} ${test.label}: ${result.brand_id} (expected: ${test.expected})`)
    ok ? passed++ : failed++
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`)
  if (failed > 0) { process.exit(1) }
  console.log('PASS: all brand routing tests passed.')
  process.exit(0)
}

// Single-event mode
const eventData = {}
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    eventData[args[i].slice(2)] = args[i + 1]
    i++
  }
}

console.log('\n=== ROUTE TEST ===')
console.log('Input:', eventData)

const result = routeEvent(eventData)
console.log('Resultado:', result)

if (result.brand_id === 'unidentified') {
  console.log('⚠️  ALERTA: No se pudo identificar el producto. El evento requiere revisión humana.')
  process.exit(1)
} else {
  console.log(`✅ Producto detectado: ${result.brand_id} (método: ${result.method})`)
  process.exit(0)
}
