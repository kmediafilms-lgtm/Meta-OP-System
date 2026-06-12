# Codex Offline Audit Report - PR #6

Date: 2026-06-12
Repo: `kmediafilms-lgtm/Meta-OP-System`
PR: #6 - `feat: WEDO Meta OS Control Plane v1`
Branch: `feature/wedo-control-plane-v1`
Auditor role: offline repo audit only.

No n8n, Supabase, Vercel, Meta Graph, tokens, `.env`, merge, real messages, campaign changes, or production webhooks were used.

## Result

Overall: **FAIL**

Merge decision: **PR #6 is not unblocked for merge**

Summary: the repo passes the canonical offline scripts and the active product tree is scoped to the 3 real products, but PR #6 still has active operational docs that say "5 brands", Product Registry lifecycle enforcement is incomplete, and workflow exports do not prove inactive state while webhook, WhatsApp, and send-message nodes exist.

## Commands Run

```bash
node scripts/run-offline-audit.js
node scripts/check-no-dangerous-actions.js
node scripts/check-no-secrets.js
node scripts/validate-agent-contracts.js
node scripts/validate-brand-configs.js
node scripts/route-test-events.js
node scripts/test-webhook-payloads.js
```

| Command | Result | Notes |
| --- | --- | --- |
| `node scripts/run-offline-audit.js` | **PASS** | Brand configs, routing tests, payload listing, no-secrets, and dangerous-action scan passed. |
| `node scripts/check-no-dangerous-actions.js` | **PASS** | No unsafe dangerous actions detected by the scanner. |
| `node scripts/check-no-secrets.js` | **PASS** | No obvious secrets/tokens found. |
| `node scripts/validate-agent-contracts.js` | **WARN** | Exit 0, with 4 non-fatal warnings for suggested extra blocked actions. |
| `node scripts/validate-brand-configs.js` | **PASS** | 3 products validated. |
| `node scripts/route-test-events.js` | **PASS** | 11 route tests passed. |
| `node scripts/test-webhook-payloads.js` | **PASS** | Fixture listing ran successfully. |

## Scope

Status: **WARN/FAIL**

Pass:

- Current product config directories are only:
  - `brands/kmediafilms`
  - `brands/en-la-galeria-de-ana`
  - `brands/drivip`
- `git diff --name-status origin/main...HEAD` shows `brands/jardinero-davis/*` and `brands/fc-guia-panama/*` as deleted.
- `supabase/seed/001_brands.sql` seeds only `kmediafilms`, `ana`, and `drivip`.
- `apps/dashboard/lib/mock-data.ts` exposes only KMediaFilms, En la Galeria de Ana, and DRIVIP in `BRANDS`.
- Jardinero Davis and FC Guia Panama references are only in `docs/archive/n8n-activation-results.md`, and that archived file has a header saying they are not active products.

Fail:

| File | Line | Finding |
| --- | ---: | --- |
| `docs/wedo-os-operating-model.md` | 5 | Says WEDO manages 5 client brands. |
| `docs/control-plane-roadmap.md` | 9 | Says multi-brand config for all 5 brands is validated. |
| `docs/production-readiness-checklist.md` | 54 | Says seed `001_brands.sql` applied with 5 brands. |
| `docs/n8n-safe-activation-plan.md` | 39 | Says verify all 5 brands route correctly. |

Conclusion: active code/config is scoped correctly, but active docs still describe a 5-brand system. That is a merge-blocking consistency issue.

## Product Registry

Status: **WARN**

Pass:

- `lib/product-registry.js` reads products from `brands/<slug>/brand-config.json`.
- No rigid `if brand === "jardinero-davis"` or `if brand === "fc-guia-panama"` logic was found.
- No product-specific `switch` was found in central registry logic.
- `tests/fixtures/products/new-product-example.json` documents future product onboarding through config/fixture.
- `scripts/validate-brand-configs.js` scans every directory under `brands/` automatically.
- `route-test-events.js` covers KMedia, Ana, DRIVIP, unknown escalation, missing IDs, and future product fixture.
- `schemas/product.schema.json` requires `facebook_page_id` and `instagram_business_id` only when `activation_status` is `testing` or `active`.

Warn:

- Current brand configs do not explicitly include `activation_status`; status is inferred from `active_status: true`.
- `lib/product-registry.js` says routing only includes active/testing products, but code only skips `archived`. A future `draft` product with real-looking IDs could route.
- `scripts/route-test-events.js` mirrors the same lifecycle behavior, so the current tests do not prove that draft products with IDs are blocked.
- `scripts/validate-brand-configs.js` requires `meta_ad_account_id` for active/testing products, but the JSON schema only requires Facebook Page ID and Instagram Business ID. Align or document this mismatch.

## Meta Safety

Status: **PASS**

Pass:

- No implementation code found for Puppeteer, Playwright, Selenium, Chromium automation, browserless, `navigator.webdriver`, `page.click`, or `page.goto`.
- No Meta UI automation implementation found for `business.facebook.com` or `adsmanager.facebook.com`.
- `scripts/check-no-dangerous-actions.js` scans for browser automation, scraping, Meta UI URLs, message sends, and campaign mutations.
- `docs/meta-automation-safety-policy.md` explicitly prohibits browser automation, scraping, Meta UI scraping, automated clicks, `business.facebook.com`, and `adsmanager.facebook.com` automation.
- Ads reads are documented as GET/read-only.
- `agents/campaign-analyst/contract.json` has `do_not_execute: const true`.
- `agents/campaign-analyst/prompt.md` says READ ONLY and forbids POST/PUT/PATCH/DELETE.
- `apps/dashboard/app/campaigns/page.tsx` says READ ONLY and requires human approval.
- `agents/human-approval/tests.json` covers campaign changes requiring human approval.

Allowed residues:

- `docs/meta-setup-checklist.md` mentions `business.facebook.com` as a manual setup step, not automation.
- Prohibition docs mention scraping/browser automation terms intentionally.
- `scripts/check-no-dangerous-actions.js` contains banned terms as scanner patterns.

## Agent Audit

Status: **PASS with validator warnings**

All 8 agents include the required blocked actions:

- `browser_automation`
- `scraping`
- `campaign_mutation_without_approval`
- `budget_change_without_approval`
- `whatsapp_send_without_opt_in`

Verified agents:

- `brand-router`
- `campaign-analyst`
- `compliance`
- `copy-conversion`
- `human-approval`
- `intent-classifier`
- `lead-scoring`
- `learning`

`validate-agent-contracts.js` still reports 4 non-fatal warnings for suggested `send_whatsapp` / `call_meta_api` additions, but the five user-required blocked actions are present in all 8 agents.

Campaign Analyst: **PASS**. It recommends only and does not execute changes.

## Risk Audit

Status: **FAIL**

| Risk | Result | Evidence |
| --- | --- | --- |
| Tokens | **PASS** | `check-no-secrets.js` passed. |
| Real `.env` file | **PASS** | No `.env`, `.env.*`, or `*.env` files found. |
| Secrets | **PASS** | Secret scanner passed. |
| WhatsApp active | **WARN/FAIL** | Workflow exports have `active=undefined`; WhatsApp trigger/send nodes exist. |
| Real messages | **WARN/FAIL** | Send nodes exist in templates; exports do not prove inactive/disabled/no-send mode. |
| Productive webhooks | **WARN/FAIL** | `workflows/meta-webhook-router.json` has webhook node and `active=undefined`. |
| Campaign mutation | **PASS** | Dangerous-action scan passes; Campaign Analyst is read-only; changes require approval. |
| Dangerous active workflows | **WARN/FAIL** | No `active:true` found, but `active` is undefined in all workflow JSON exports. |

Workflow residues:

- `workflows/whatsapp-inbound.json`: WhatsApp trigger and WhatsApp send nodes.
- `workflows/meta-webhook-router.json`: webhook node and WhatsApp alert node.
- `workflows/instagram-inbound.json`: `Send Instagram Reply` node.
- `workflows/facebook-page-inbound.json`: `Facebook Graph API: Respond` node.
- `workflows/human-approval.json`: WhatsApp approval/timeout nodes.
- `workflows/weekly-report.json`: WhatsApp send node.
- `workflows/campaign-reporting.json`: Meta campaign reads and WhatsApp report node.
- `workflows/brand-onboarding.json`: WhatsApp onboarding checklist node.

## Critical Findings

1. Active operational docs still claim 5 brands, which conflicts with the required 3-product scope.
2. Workflow exports are not explicitly inactive (`active=undefined`) while webhook and send nodes exist.
3. Product Registry lifecycle gating is weaker than documented because draft products are not explicitly excluded from routing.

## Medium Findings

1. Current brand configs rely on inferred lifecycle state instead of explicit `activation_status`.
2. Schema and validator differ on whether `meta_ad_account_id` is mandatory for active/testing products.
3. Agent validation exits 0 but still reports 4 suggested blocked-action warnings.
4. Historical Jardinero/FC references remain in `docs/archive/`; this is acceptable only because the header clearly marks them as not active products.

## Residues Found

- Four non-archived docs still say "5 brands".
- Workflow JSON exports use `active=undefined`.
- WhatsApp/send/webhook nodes remain in workflow templates.
- Browser automation/scraping terms remain only in prohibition docs and scanner code.
- Jardinero/FC references remain only in archived historical documentation.

## Production Recommendations

Before production:

1. Replace all active-doc "5 brands" statements with "3 current products" plus future-product registry language.
2. Add explicit `activation_status` to all current brand configs.
3. Change `buildRoutingMap()` to route only `testing` and `active` products.
4. Add a negative test proving a draft product with IDs does not route.
5. Add `active: false` or equivalent disabled metadata to every workflow export.
6. Disable or clearly template-gate WhatsApp, send-message, webhook, and response nodes.
7. Align schema and validator behavior for `meta_ad_account_id`.
8. Resolve or intentionally document the 4 agent-contract warnings.

## Final Decision

PR #6 is **not ready for merge** from security, scope, and consistency review.

Merge can be reconsidered after the critical findings are fixed and this offline audit is rerun.
