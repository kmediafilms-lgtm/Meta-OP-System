# Codex Offline Audit Report - PR #6

Date: 2026-06-12
PR: #6 - `feat: WEDO Meta OS Control Plane v1`
Branch: `feature/wedo-control-plane-v1`
Mode: offline repo audit only. No n8n, Supabase, Vercel, Meta Graph, tokens, `.env`, merge, real messages, campaign changes, or production webhooks were used.

## Result

Overall: **FAIL**

Merge decision: **PR #6 remains blocked**

Reason: the core local checks pass and the current product tree is limited to the 3 real products, but PR #6 still contains operational docs that describe a 5-brand scope and does not explicitly mark workflow exports as inactive while webhook, WhatsApp, and send-message nodes exist.

## Commands Run

```bash
node scripts/run-offline-audit.js
node scripts/check-no-dangerous-actions.js
node scripts/check-no-secrets.js
node scripts/validate-agent-contracts.js
```

Results:

| Command | Result | Notes |
| --- | --- | --- |
| `node scripts/run-offline-audit.js` | **PASS** | Brand configs, route tests, webhook payload listing, no-secrets, and dangerous-action scan passed. |
| `node scripts/check-no-dangerous-actions.js` | **PASS** | No unsafe dangerous actions detected by the repo scanner. |
| `node scripts/check-no-secrets.js` | **PASS** | No obvious secrets/tokens found. No `.env` files found. |
| `node scripts/validate-agent-contracts.js` | **WARN** | Exited 0, but reported 4 warnings for missing suggested blocked actions. |

Agent-contract warnings:

- `brand-router`: consider adding `send_whatsapp`.
- `lead-scoring`: consider adding `send_whatsapp`.
- `copy-conversion`: consider adding `send_whatsapp` and `call_meta_api`.

## Product Scope

Status: **WARN/FAIL**

Good findings:

- Current `HEAD` contains only these product config directories:
  - `brands/kmediafilms`
  - `brands/en-la-galeria-de-ana`
  - `brands/drivip`
- `git diff --name-status origin/main...HEAD` shows `brands/jardinero-davis/*` and `brands/fc-guia-panama/*` as **deleted**, not active.
- `supabase/seed/001_brands.sql` seeds only `kmediafilms`, `ana`, and `drivip`.
- `apps/dashboard/lib/mock-data.ts` has only KMediaFilms, En la Galeria de Ana, and DRIVIP in `BRANDS`.
- Historical references to removed products were moved to `docs/archive/n8n-activation-results.md`, with an explicit note that they are not active products.

Blocking findings:

| File | Line | Finding |
| --- | ---: | --- |
| `docs/wedo-os-operating-model.md` | 5 | Says WEDO manages 5 client brands. |
| `docs/control-plane-roadmap.md` | 9 | Says multi-brand config for all 5 brands is validated. |
| `docs/production-readiness-checklist.md` | 54 | Says seed `001_brands.sql` applied with 5 brands. |
| `docs/n8n-safe-activation-plan.md` | 39 | Says verify all 5 brands route correctly. |

Historical references reviewed:

| File | Lines | Finding |
| --- | ---: | --- |
| `docs/archive/n8n-activation-results.md` | 4, 85-86, 119-120, 181 | Contains Jardinero/FC references, but the file is archived and explicitly says they are not active products. |

Conclusion: **not clean enough**. The code tree removes the non-current products, but PR #6 still presents a 5-brand scope in active operational docs.

## Product Registry

Status: **WARN**

Good findings:

- `lib/product-registry.js` reads dynamically from `brands/<slug>/brand-config.json`.
- No rigid product-name `if/else` or `switch` was found in `lib/product-registry.js`.
- `tests/fixtures/products/new-product-example.json` documents a future product entering through config/fixture.
- `schemas/product.schema.json` defines `active_status`, `activation_status`, `routing_rules`, and conditional Meta ID requirements.
- `scripts/validate-brand-configs.js` validates all directories under `brands/` automatically.
- `node scripts/route-test-events.js` covers KMedia, Ana, DRIVIP, unknown escalation, missing IDs, and a future fixture.

Risks:

- Current `brand-config.json` files do not explicitly include `activation_status`; validator/router infer `active` from `active_status: true`.
- `lib/product-registry.js` documents "Only includes products that are active or testing", but implementation only skips `archived`. A `draft` product with real-looking IDs could route.
- `scripts/route-test-events.js` duplicates the same status behavior, so tests may not catch that lifecycle bug.
- `schemas/product.schema.json` requires `facebook_page_id` and `instagram_business_id` for `testing`/`active`; `scripts/validate-brand-configs.js` also requires `meta_ad_account_id` for those statuses. That mismatch should be aligned or documented.

Required before unblock:

- Add explicit `activation_status` to the 3 current brand configs.
- Change routing to include only `activation_status in ["testing", "active"]`.
- Add a negative test proving a draft product with IDs does not route.

## Meta Safety

Status: **PASS with docs-only warnings**

Good findings:

- No implementation code found for Puppeteer, Playwright, Selenium, Chromium, browserless, `navigator.webdriver`, `page.click`, or `page.goto`.
- No Meta browser automation implementation found.
- `scripts/check-no-dangerous-actions.js` scans for browser automation, scraping, Meta UI URLs, message sends, and campaign mutations.
- `docs/meta-automation-safety-policy.md` explicitly prohibits browser automation, scraping, Meta UI scraping, automated clicks, `business.facebook.com`, and `adsmanager.facebook.com` automation.
- Ads reads are documented as GET/read-only.
- `agents/campaign-analyst/contract.json` has `do_not_execute: const true`.
- `agents/campaign-analyst/prompt.md` says READ ONLY and forbids POST/PUT/PATCH/DELETE.
- `apps/dashboard/app/campaigns/page.tsx` says READ ONLY and requires human approval.
- `agents/human-approval/tests.json` covers campaign changes requiring human approval.

Allowed docs-only hits:

- `docs/meta-setup-checklist.md` mentions `business.facebook.com` as manual setup, not automation.
- Policy/docs mention scraping and browser automation in prohibition text.
- `scripts/check-no-dangerous-actions.js` contains banned terms as scanner patterns.

## Prohibitions

Status: **FAIL**

| Requirement | Result | Evidence |
| --- | --- | --- |
| No WhatsApp active | **FAIL/WARN** | Workflow JSON exports have `active=undefined`; WhatsApp nodes exist in `workflows/whatsapp-inbound.json`, `workflows/human-approval.json`, `workflows/weekly-report.json`, `workflows/campaign-reporting.json`, `workflows/meta-webhook-router.json`, and `workflows/brand-onboarding.json`. |
| No real messages | **FAIL/WARN** | Send nodes exist in workflow templates; they may be intended as inactive, but exports do not prove `active: false` or disabled/no-send mode. |
| No production webhooks | **FAIL/WARN** | `workflows/meta-webhook-router.json` has a webhook node and `active=undefined`. |
| No secrets | **PASS** | `node scripts/check-no-secrets.js` passed and no `.env` files were found. |
| No tokens | **PASS** | Secret scanner passed; no token-like secrets detected. |

Specific workflow audit:

- All workflow JSON files currently report `active=undefined`.
- `workflows/whatsapp-inbound.json` includes `n8n-nodes-base.whatsAppTrigger` and WhatsApp send nodes.
- `workflows/meta-webhook-router.json` includes a webhook node and WhatsApp alert node.
- `workflows/instagram-inbound.json` includes `Send Instagram Reply`.
- `workflows/weekly-report.json`, `workflows/human-approval.json`, and `workflows/campaign-reporting.json` include WhatsApp send/report nodes.

Required before unblock:

- Add explicit `active: false` or equivalent disabled metadata to workflow exports.
- Mark send nodes as disabled/template-only/dry-run until approved.
- Ensure production webhook exports cannot be activated accidentally.

## Final Decision

PR #6 is **not unblocked for merge**.

It can move toward unblock after Claude Code fixes:

1. Remove or rewrite all operational references to 5 brands and removed products.
2. Add explicit product lifecycle state and enforce `testing`/`active` routing only.
3. Add a draft-with-IDs negative routing test.
4. Mark all workflow exports explicitly inactive.
5. Disable or clearly template-gate WhatsApp/send/webhook nodes.
