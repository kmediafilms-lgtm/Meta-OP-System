# WEDO Meta OS — Product Onboarding Model

How to add a new client product without changing any code.

## Core principle

The system uses a **dynamic Product Registry**. Routing, validation, dashboard, and agents all read from this registry at runtime. Adding a product = creating a config entry. Removing a product = setting `activation_status: archived`.

No changes needed to:
- Router logic
- n8n workflow code
- Dashboard components
- Agent prompts
- Test suites

---

## Step 1 — Create the product config

Create a new folder: `brands/<product-slug>/`

Copy the example fixture: `tests/fixtures/products/new-product-example.json`

Create `brands/<product-slug>/brand-config.json` with:

```json
{
  "brand_id": "<product-slug>",
  "product_name": "Client Product Name",
  "slug": "<product-slug>",
  "business_unit": "Industry / category",
  "active_status": true,
  "activation_status": "draft",
  "facebook_page_id": "REPLACE_WITH_REAL",
  "instagram_business_id": "REPLACE_WITH_REAL",
  "meta_ad_account_id": "REPLACE_WITH_REAL",
  "whatsapp_phone_number_id": "",
  "default_language": "es",
  "tone_profile": "professional_friendly",
  "services": ["Service 1", "Service 2"],
  "responsible_users": ["ricardo"],
  "human_approval_required_for": ["precio", "cotizacion", "reclamo"]
}
```

Set `activation_status: "draft"` until Meta IDs are confirmed.

---

## Step 2 — Load Meta IDs

Ricardo obtains the real IDs from Meta Business Suite:

| Field | Where to find it |
|-------|-----------------|
| `facebook_page_id` | Business Suite → Pages → About |
| `instagram_business_id` | Business Suite → Instagram → Account ID |
| `meta_ad_account_id` | Business Suite → Ad Accounts (format: `act_XXXXXXXX`) |
| `whatsapp_phone_number_id` | Meta Developer → WhatsApp → Phone Numbers |

Update the brand-config.json with real values. Change `activation_status` to `"testing"`.

---

## Step 3 — Define tone and services

Create supporting files in `brands/<product-slug>/`:

- `tone-guide.md` — Voice, examples, what to avoid
- `services.md` — Full service catalog with descriptions
- `response-rules.md` — Brand-specific escalation rules

The copy-conversion agent reads `brand_context.tone_guide` from the input — no agent code changes needed.

---

## Step 4 — Run validation

```bash
node scripts/validate-brand-configs.js
```

Expected: product listed as `[testing]`, all Meta ID fields validated.

```bash
node scripts/route-test-events.js
```

The self-test builds dynamically from the registry. The new product will auto-appear in the test output.

```bash
node scripts/run-offline-audit.js
```

All 5 checks must pass (exit 0) before proceeding.

---

## Step 5 — Test routing with real payload

Use a real IG DM from the product's account:

```bash
node scripts/route-test-events.js --ig_id <real-instagram-business-id>
```

Expected output: `✅ Producto detectado: <product-slug> (método: ig_id_match)`

---

## Step 6 — Seed in Supabase

Run in Supabase SQL editor:

```sql
INSERT INTO brands (brand_id, brand_name, business_unit, active_status,
  facebook_page_id, instagram_business_id, meta_ad_account_id,
  default_language, timezone)
VALUES (
  '<product-slug>',
  'Product Name',
  'Industry',
  true,
  '<facebook_page_id>',
  '<instagram_business_id>',
  '<meta_ad_account_id>',
  'es',
  'America/Panama'
);
```

---

## Step 7 — Activate in n8n (human approval required)

Ricardo reviews the checklist in `docs/production-readiness-checklist.md` and activates the n8n routing workflow for the new product. Follow the phase order in `docs/n8n-safe-activation-plan.md`.

Change `activation_status` to `"active"` only after Ricardo approves.

---

## Product Lifecycle States

```
draft → testing → active → paused → archived
```

| State | Meta IDs | Routing | Messages | n8n |
|-------|----------|---------|----------|-----|
| draft | placeholder | no | no | no |
| testing | confirmed | yes (test only) | no | no |
| active | confirmed | yes | draft → human approval | inactive until Ricardo activates |
| paused | confirmed | no | no | deactivated |
| archived | any | no | no | deactivated |

---

## What does NOT require code changes

| Change | How |
|--------|-----|
| Add new product | Create brand-config.json + Supabase row |
| Change product name | Update brand_config.json + Supabase |
| Change tone | Update tone-guide.md |
| Change services | Update services.md |
| Pause a product | Set `activation_status: paused` |
| Archive a product | Set `activation_status: archived` |
| Add new Meta account | Update IDs in brand-config.json + Supabase |
| Enable WhatsApp | Add `whatsapp_phone_number_id` |

## What DOES require human approval (Ricardo)

- Activating n8n routing for a new product
- Approving the first reply sent through the system for a new product
- Changing `activation_status` from `testing` to `active`
