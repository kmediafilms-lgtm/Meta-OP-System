/**
 * Product Registry — dynamic loader for WEDO Meta OS.
 *
 * Reads all brand-config.json files from brands/ directory at runtime.
 * Adding a new product requires only creating a new brands/<slug>/ folder
 * with a brand-config.json — no code changes needed.
 *
 * Activation statuses:
 *   draft    — configured, IDs not yet confirmed
 *   testing  — IDs loaded, routing validated, not yet live
 *   active   — live, routing enabled
 *   paused   — temporarily disabled
 *   archived — retired
 */

const fs   = require('fs')
const path = require('path')

const BRANDS_DIR = path.join(__dirname, '..', 'brands')

/**
 * Load all brand configs and return them as an array.
 * Optionally filter by activation_status.
 */
function loadProducts(filterStatus = null) {
  if (!fs.existsSync(BRANDS_DIR)) return []

  const products = []

  for (const entry of fs.readdirSync(BRANDS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const configPath = path.join(BRANDS_DIR, entry.name, 'brand-config.json')
    if (!fs.existsSync(configPath)) continue

    let config
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    } catch {
      continue
    }

    if (filterStatus && config.activation_status !== filterStatus) continue
    products.push(config)
  }

  return products
}

const ROUTABLE_STATUSES = ['active', 'testing']

/**
 * Build a routing map keyed by Meta IDs → brand_id.
 * Only includes products that are active or testing.
 */
function buildRoutingMap() {
  const products = loadProducts()
  const map = { page_ids: {}, ig_ids: {}, ad_accounts: {}, phone_ids: {} }

  for (const p of products) {
    const status = p.activation_status ?? (p.active_status === true ? 'active' : 'draft')
    if (!ROUTABLE_STATUSES.includes(status)) continue

    const id = p.brand_id

    if (p.facebook_page_id && !p.facebook_page_id.startsWith('PLACEHOLDER')) {
      map.page_ids[p.facebook_page_id] = id
    }
    if (p.instagram_business_id && !p.instagram_business_id.startsWith('PLACEHOLDER')) {
      map.ig_ids[p.instagram_business_id] = id
    }
    if (p.meta_ad_account_id && !p.meta_ad_account_id.startsWith('PLACEHOLDER') && p.meta_ad_account_id !== '') {
      map.ad_accounts[p.meta_ad_account_id] = id
    }
    if (p.whatsapp_phone_number_id && !p.whatsapp_phone_number_id.startsWith('PLACEHOLDER')) {
      map.phone_ids[p.whatsapp_phone_number_id] = id
    }
  }

  return map
}

/**
 * Route a raw event payload to a brand_id.
 * Returns { brand_id, method, requires_human, reason }
 */
function routeEvent({ page_id, ig_id, ad_account_id, phone_id } = {}) {
  const map = buildRoutingMap()

  if (page_id && map.page_ids[page_id]) {
    return { brand_id: map.page_ids[page_id], method: 'page_id_match', requires_human: false }
  }
  if (ig_id && map.ig_ids[ig_id]) {
    return { brand_id: map.ig_ids[ig_id], method: 'ig_id_match', requires_human: false }
  }
  if (ad_account_id && map.ad_accounts[ad_account_id]) {
    return { brand_id: map.ad_accounts[ad_account_id], method: 'ad_account_match', requires_human: false }
  }
  if (phone_id && map.phone_ids[phone_id]) {
    return { brand_id: map.phone_ids[phone_id], method: 'phone_id_match', requires_human: false }
  }

  return {
    brand_id: 'unidentified',
    method: 'no_match',
    requires_human: true,
    reason: 'No active/testing product matched these IDs — escalate to human review',
  }
}

module.exports = { loadProducts, buildRoutingMap, routeEvent }
