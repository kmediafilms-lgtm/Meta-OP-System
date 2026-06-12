#!/usr/bin/env node
// End-to-end mock run of the WEDO Meta OS control plane.
// Simulates: webhook → brand-router → intent-classifier → lead-scoring → copy-conversion → human-approval
// Zero real API calls. Validates the logic chain is wired correctly.

// WEDO Meta OS — SAFE MODE
// Product registry loaded dynamically. Add new products via brands/ folder — no code change needed.
const { loadProducts } = require('../lib/product-registry')

const _products = loadProducts()
const BRANDS = Object.fromEntries(_products.map(p => [p.brand_id, {
  brand_id: p.brand_id,
  brand_name: p.brand_name,
  meta_ig_id: p.instagram_business_id ?? null,
  meta_page_id: p.facebook_page_id ?? null,
}]))

const TEST_EVENTS = [
  { id: 'evt-001', channel: 'instagram_dm', recipient_id: '17841450875047591', sender: 'user_abc', text: 'Hola, quiero información para mi boda en noviembre' },
  { id: 'evt-002', channel: 'instagram_dm', recipient_id: '17841447217470964', sender: 'user_xyz', text: 'Necesito traslado al aeropuerto mañana a las 6am' },
  { id: 'evt-003', channel: 'instagram_dm', recipient_id: '17841400348662832', sender: 'user_co',  text: 'Cuánto cuesta un video corporativo para empresa mediana' },
  { id: 'evt-004', channel: 'instagram_dm', recipient_id: 'unknown_ig_id',     sender: 'user_unk', text: 'Hola' },
  { id: 'evt-005', channel: 'ad_account',   ad_account_id: 'act_2189268925168947', event: 'lead_form_submit', lead_name: 'María González' },
]

// Step 1: Brand Router — uses Product Registry dynamically
const { routeEvent } = require('../lib/product-registry')

function brandRouter(event) {
  const r = routeEvent({
    ig_id: event.recipient_id,
    ad_account_id: event.ad_account_id,
  })

  return {
    brand_id: r.brand_id === 'unidentified' ? null : r.brand_id,
    confidence: r.brand_id === 'unidentified' ? 0 : 1.0,
    source: r.method,
    requires_human: r.requires_human,
    reason: r.reason ?? `Matched via ${r.method}`,
  }
}

// Step 2: Intent Classifier (mock)
function intentClassifier(text) {
  if (!text) return { intent: 'unknown', confidence: 0, sentiment: 'neutral', requires_human: false }

  const lower = text.toLowerCase()
  let intent = 'general_inquiry'
  let confidence = 0.7
  let sentiment = 'neutral'

  if (/boda|noviembre|casamiento|matrimon/.test(lower))    { intent = 'paquetes_boda';    confidence = 0.92; sentiment = 'positive' }
  else if (/traslado|aeropuerto|transfer/.test(lower))      { intent = 'traslado';         confidence = 0.88; sentiment = 'neutral' }
  else if (/video|corporativo|empresa/.test(lower))         { intent = 'video_corporativo';confidence = 0.85; sentiment = 'neutral' }
  else if (/precio|costo|cuánto|cuanto/.test(lower))        { intent = 'precio';           confidence = 0.80; sentiment = 'neutral' }
  else if (/tour|guía|visita/.test(lower))                  { intent = 'tour_inquiry';     confidence = 0.78; sentiment = 'positive' }
  else if (/jardín|jardinería|poda|césped/.test(lower))     { intent = 'jardineria_inquiry'; confidence = 0.82; sentiment = 'neutral' }

  return {
    intent,
    confidence,
    sentiment,
    requires_human: confidence < 0.5,
    reason: `Pattern match on text`,
  }
}

// Step 3: Lead Scoring (mock)
function leadScoring(intent, channel) {
  const baseScores = {
    paquetes_boda:     85,
    traslado:          72,
    video_corporativo: 60,
    precio:            35,
    tour_inquiry:      65,
    jardineria_inquiry:55,
    general_inquiry:   25,
    unknown:           10,
  }
  const channelBonus = { instagram: 5, whatsapp: 10, facebook: 3 }

  const score = Math.min(100, (baseScores[intent] ?? 20) + (channelBonus[channel] ?? 0))
  const temperature = score >= 75 ? 'hot' : score >= 40 ? 'warm' : 'cold'

  return {
    lead_score: score,
    temperature,
    reason: `Intent "${intent}" on ${channel}`,
    next_action: temperature === 'hot' ? 'immediate_followup' : temperature === 'warm' ? 'schedule_followup_24h' : 'add_to_nurture',
    followup_day: temperature === 'hot' ? 0 : temperature === 'warm' ? 1 : 7,
  }
}

// Step 4: Copy Conversion (mock) — draft only, never sends
function copyConversion(brand, intent, text) {
  const drafts = {
    paquetes_boda:     `¡Hola! Gracias por contactar a ${brand.brand_name}. Nos encantaría ayudarte con tu boda. ¿Podrías contarme más sobre la fecha y el número de invitados? 💍`,
    traslado:          `¡Hola! Para tu traslado al aeropuerto, necesito confirmar: ¿a qué hora sería exactamente y desde qué dirección? Tenemos disponibilidad mañana.`,
    video_corporativo: `¡Hola! Gracias por tu interés en nuestros servicios de video corporativo. ¿Podrías contarme más sobre tu empresa y el tipo de video que buscas?`,
    precio:            `¡Hola! Con gusto te informo sobre nuestros precios. ¿Para qué servicio específico te gustaría cotización?`,
    general_inquiry:   `¡Hola! Gracias por contactarnos. ¿En qué te podemos ayudar?`,
  }

  return {
    draft_reply: drafts[intent] ?? drafts.general_inquiry,
    tone_used: 'professional_warm',
    cta: 'request_more_info',
    requires_human: true,
    do_not_send: true, // ALWAYS true — safety constant
  }
}

// Step 5: Human Approval Gate
function humanApprovalGate(leadScore, intent, brandId) {
  const riskLevel = leadScore >= 75 ? 'high' : leadScore >= 40 ? 'medium' : 'low'
  const timeouts = { critical: 15, high: 120, medium: 1440, low: 1440 }

  return {
    approval_required: true, // ALWAYS true
    risk_level: riskLevel,
    reason: `Lead ${leadScore}pts, intent: ${intent}, brand: ${brandId}`,
    suggested_action: 'review_and_send_reply',
    expires_in_minutes: timeouts[riskLevel],
  }
}

// ─── Run the mock pipeline ────────────────────────────────────────────────────

console.log('WEDO Meta OS — Mock Control Plane Run')
console.log('='.repeat(50))
console.log(`Testing ${TEST_EVENTS.length} events\n`)

let passed = 0
let failed = 0
const results = []

for (const event of TEST_EVENTS) {
  console.log(`[${event.id}] ${event.channel} — "${event.text ?? event.event ?? ''}"`)

  // 1. Route
  const routing = brandRouter(event)
  console.log(`  → brand-router:        ${routing.brand_id ?? 'UNIDENTIFIED'} (${routing.source})`)

  if (!routing.brand_id) {
    console.log(`  → ESCALATED TO HUMAN: ${routing.reason}`)
    results.push({ event_id: event.id, status: 'escalated', brand_id: null })
    passed++
    console.log()
    continue
  }

  const brand = BRANDS[routing.brand_id]

  // 2. Classify intent
  const classification = intentClassifier(event.text ?? '')
  console.log(`  → intent-classifier:   ${classification.intent} (${(classification.confidence * 100).toFixed(0)}% confidence, ${classification.sentiment})`)

  // 3. Score lead
  const scoring = leadScoring(classification.intent, event.channel)
  console.log(`  → lead-scoring:        ${scoring.lead_score}pts — ${scoring.temperature.toUpperCase()} — next: ${scoring.next_action}`)

  // 4. Draft copy
  const copy = copyConversion(brand, classification.intent, event.text ?? '')
  console.log(`  → copy-conversion:     draft ready | do_not_send=${copy.do_not_send}`)

  // 5. Approval gate
  const approval = humanApprovalGate(scoring.lead_score, classification.intent, routing.brand_id)
  console.log(`  → human-approval:      ${approval.risk_level.toUpperCase()} risk | expires: ${approval.expires_in_minutes}min`)

  // Safety assertions
  let ok = true
  if (!copy.do_not_send) {
    console.error('  ✗ SAFETY FAIL: do_not_send must be true')
    ok = false
  }
  if (!approval.approval_required) {
    console.error('  ✗ SAFETY FAIL: approval_required must be true')
    ok = false
  }

  if (ok) {
    console.log(`  ✓ Pipeline complete — awaiting human approval`)
    passed++
  } else {
    failed++
  }

  results.push({
    event_id: event.id,
    status: ok ? 'awaiting_approval' : 'safety_failure',
    brand_id: routing.brand_id,
    intent: classification.intent,
    score: scoring.lead_score,
    temperature: scoring.temperature,
    risk_level: approval.risk_level,
  })

  console.log()
}

console.log('='.repeat(50))
console.log(`Results: ${passed} passed | ${failed} failed`)
console.log()
console.log('Pipeline summary:')
for (const r of results) {
  const icon = r.status === 'safety_failure' ? '✗' : '✓'
  console.log(`  ${icon} ${r.event_id}: ${r.status} | brand=${r.brand_id ?? 'none'} | intent=${r.intent ?? 'n/a'} | score=${r.score ?? 'n/a'}`)
}

if (failed > 0) {
  console.error('\n❌ MOCK RUN FAILED — safety violations detected')
  process.exit(1)
} else {
  console.log('\n✅ Mock control plane run complete — all safety checks passed')
  console.log('   Zero real messages sent | Zero API calls made | All actions require human approval')
}
