# Codex Offline Audit Report - PR #6

Date: 2026-06-12
Scope: WEDO Meta OS Control Plane v1 (`feature/wedo-control-plane-v1`)
Mode: Offline repo audit only. No n8n, Supabase, Vercel, Meta Graph, tokens, `.env`, merge, messages, campaigns, or production webhooks were used.

## Executive Summary

Overall result: **FAIL - PR #6 remains blocked**

The Control Plane has a useful dynamic Product Registry foundation and the local validators pass, but PR #6 is not clean enough to unblock because it still contains operational documentation that treats non-current products as part of the active/pending system, still references a 5-brand scope, and does not explicitly prove workflow exports are inactive.

Current real products found in code/config are only:

- `kmediafilms` - KMediaFilms
- `ana` - En la Galeria de Ana
- `drivip` - DRIVIP

No `brands/jardinero-davis` or `brands/fc-guia-panama` product directories were found. They also do not appear in dashboard mock cards or Supabase seeds. However, they do appear in an operational activation report and should be removed or rewritten as historical context before PR #6 is considered unblocked.

## PASS/FAIL

| Area | Result | Notes |
| --- | --- | --- |
| Current Product Registry limited to KMedia, Ana, DRIVIP | **PASS** | `brands/` contains only 3 product configs. |
| Supabase seed limited to KMedia, Ana, DRIVIP | **PASS** | `scripts/validate-supabase-schema.js` reports seed brands: `kmediafilms`, `ana`, `drivip`. |
| Dashboard product cards limited to KMedia, Ana, DRIVIP | **PASS** | `apps/dashboard/lib/mock-data.ts` has only the 3 current products. |
| Future product support | **WARN** | `tests/fixtures/products/new-product-example.json` exists and routing escalates it, but registry status gating is weaker than documented. |
| Removed products absent as real products | **FAIL** | `jardinero-davis` and `fc-guia-panama` still appear in `docs/n8n-activation-results.md` as pending/current activation rows. |
| "5 brands" scope removed | **FAIL** | Multiple docs still say "5 brands" or "all 5 brands". |
| Browser automation/scraping for Meta | **PASS** | No Puppeteer, Playwright, Selenium, Chromium, browserless, `page.goto`, `page.click`, or automation code found. |
| Meta Business URLs | **WARN** | `business.facebook.com` appears only in manual setup docs, not automation code. |
| Ads read-only by default | **PASS** | Campaign Analyst contract has `do_not_execute: const true`; dashboard labels Campaigns as READ ONLY. |
| Campaign mutations require human approval | **PASS** | Campaign changes are represented as approvals; agent contracts/tests block direct execution. |
| WhatsApp active | **WARN/FAIL** | WhatsApp workflows and send nodes exist, and workflow JSON does not include explicit `active: false`. |
| Real messages | **WARN/FAIL** | Send-message nodes exist in workflow JSON; local mocks say no sends, but exports are not explicitly inactive. |
| Productive webhooks active | **WARN/FAIL** | Webhook workflow exports have `active=undefined`; require explicit inactive/dry-run marker before activation. |
| Secrets/tokens | **PASS** | `scripts/check-no-secrets.js` passed. |

## Commands Run

```bash
node scripts/validate-brand-configs.js
node scripts/route-test-events.js
node scripts/validate-agent-contracts.js
node scripts/validate-supabase-schema.js
node scripts/check-no-secrets.js
node scripts/check-no-dangerous-actions.js
node scripts/mock-control-plane-run.js
```

All commands above exited successfully.

Notable validator output:

- Product configs: 3 products validated.
- Routing tests: 11 passed, 0 failed.
- Route coverage includes DRIVIP, Ana, KMedia, unknown escalation, missing IDs escalation, and a future product fixture that stays unidentified.
- Agent contract validation passed with warnings about missing blocked actions in some agents.
- Supabase schema validation passed with 11 tables, brand_id constraints, RLS enabled, and 3 seed brands.
- Secret scan passed.
- Dangerous-action scan passed.
- Mock control-plane run sent zero real messages, made zero API calls, and required human approval for actions.

## Removed Product References Found

These references should be removed or rewritten so they do not present Jardinero Davis or FC Guia Panama as real current products, seeds, tests, readiness requirements, dashboard cards, or activation requirements.

| File | Line | Finding |
| --- | ---: | --- |
| `docs/n8n-activation-results.md` | 72 | `jardinero-davis` listed with test results. |
| `docs/n8n-activation-results.md` | 73 | `fc-guia-panama` listed with test results. |
| `docs/n8n-activation-results.md` | 106 | `jardinero-davis` listed with placeholder Meta IDs pending. |
| `docs/n8n-activation-results.md` | 107 | `fc-guia-panama` listed with placeholder Meta IDs pending. |
| `docs/n8n-activation-results.md` | 168 | "Conectar Jardinero Davis o FC Guia Panama" listed as a blocked action. |

Additional wrong-scope references:

| File | Line | Finding |
| --- | ---: | --- |
| `docs/wedo-os-operating-model.md` | 5 | Says WEDO manages 5 client brands. |
| `docs/control-plane-roadmap.md` | 9 | Says multi-brand config for all 5 brands is validated. |
| `docs/production-readiness-checklist.md` | 54 | Says seed `001_brands.sql` applied with 5 brands. |
| `docs/n8n-safe-activation-plan.md` | 39 | Says verify all 5 brands route correctly. |

## Product Registry Audit

Result: **WARN - dynamic foundation exists, but lifecycle enforcement is incomplete**

Good findings:

- `lib/product-registry.js` dynamically loads product configs from `brands/*/brand-config.json`.
- Adding future products can be done by adding a new product config directory.
- `schemas/product.schema.json` defines `active_status`, `activation_status`, and `routing_rules`.
- The product schema makes `facebook_page_id` and `instagram_business_id` required for `active` or `testing`.
- `tests/fixtures/products/new-product-example.json` represents a future draft product.
- Routing tests confirm future/draft product fixture does not route as a current product.

Risks:

- Current `brand-config.json` files do not include `activation_status`; the validator and registry infer `active` from `active_status: true`.
- `lib/product-registry.js` comments say routing includes only active/testing products, but implementation skips only `archived`, so a `draft` product with IDs could route.
- `meta_ad_account_id` is required by `scripts/validate-brand-configs.js` for active/testing but is not required by `schemas/product.schema.json`; this mismatch should be intentional and documented or aligned.
- Some discovery/mapping logic is current-product-specific. That is acceptable for current Meta mapping, but future product onboarding should depend on registry data wherever possible.

Recommended fixes:

- Add explicit `activation_status` to all current `brand-config.json` files.
- Change `buildRoutingMap()` to route only `activation_status` in `active` or `testing`.
- Keep future/draft products out of routing even if placeholder or accidental IDs are present.
- Align schema and validator behavior for `meta_ad_account_id`, especially if active products may not always have an Ads account.

## Meta Browser Automation / Scraping Audit

Result: **PASS with documentation/script warning**

No code usage was found for:

- `puppeteer`
- `playwright`
- `selenium`
- `chromium`
- `browserless`
- `navigator.webdriver`
- `page.click`
- `page.goto`
- `adsmanager.facebook.com`

Good findings:

- `docs/meta-automation-safety-policy.md` explicitly prohibits browser automation, scraping, Meta UI scraping, automated clicks, `navigator.webdriver`, and calls to `business.facebook.com` / `adsmanager.facebook.com`.
- `scripts/check-no-dangerous-actions.js` includes detector patterns for Puppeteer, Playwright, Selenium, Chromium, browserless, webdriver, browser clicks/navigation, Meta Business URLs, and scraping terms.
- Agent contracts now include browser automation / scraping / campaign mutation / WhatsApp unsafe-send blocked actions in most agents.

The following findings are acceptable because they are docs-only prohibition or manual setup references:

- `scripts/check-no-dangerous-actions.js:18-37` contains the banned terms as scanner patterns, not implementation.
- `docs/meta-asset-discovery.md:163` prohibits browser automation/scraping.
- `docs/ban-prevention-rules.md:12` prohibits scraping.
- `docs/control-plane-roadmap.md:89` says competitor scraping is never allowed.
- `docs/meta-asset-discovery-runbook.md:152` prohibits scraping/browser usage for asset discovery.
- `docs/meta-automation-safety-policy.md:10-118` defines the explicit prohibition policy.
- `docs/meta-setup-checklist.md:12`, `:33`, `:41` mention `business.facebook.com` as manual setup steps, not automation.

Recommendation: keep manual `business.facebook.com` references only in human setup docs and explicitly state they are manual, not automated.

## Safety Audit

Result: **WARN/FAIL until workflow exports are explicitly inactive**

Good findings:

- `agents/campaign-analyst/contract.json` blocks campaign mutations and requires `do_not_execute`.
- `agents/human-approval/tests.json` covers campaign change approval.
- `apps/dashboard/app/campaigns/page.tsx` labels campaign analytics as read-only and human-approval required.
- `scripts/mock-control-plane-run.js` reports zero real messages, zero API calls, and human approval for actions.
- `scripts/check-no-dangerous-actions.js` passes.

Blocking risks:

- Workflow JSON exports have `active=undefined` instead of explicit `active: false`.
- `workflows/meta-webhook-router.json` contains a webhook node and WhatsApp alert node.
- `workflows/whatsapp-inbound.json` contains WhatsApp trigger/send nodes.
- `workflows/weekly-report.json`, `workflows/human-approval.json`, and `workflows/campaign-reporting.json` include WhatsApp send nodes.
- These may be intended as templates, but PR #6 must make inactive/dry-run/no-send status explicit.

Required fixes before unblock:

- Add explicit inactive metadata to every workflow export if n8n JSON supports it, preferably `active: false`.
- Mark WhatsApp workflows and send nodes as disabled/template-only until approved.
- Ensure real-message nodes cannot execute without a human approval gate and production activation checklist.
- Ensure production webhooks cannot be activated accidentally from exported JSON.

## Required Test Coverage

| Required test | Result |
| --- | --- |
| KMedia routing | **PASS** via `node scripts/route-test-events.js` |
| Ana routing | **PASS** via `node scripts/route-test-events.js` |
| DRIVIP routing | **PASS** via `node scripts/route-test-events.js` |
| Unknown product escalation | **PASS** via `node scripts/route-test-events.js` |
| Future product fixture | **PASS** via `tests/fixtures/products/new-product-example.json` and route self-test |
| No dangerous actions | **PASS** via `node scripts/check-no-dangerous-actions.js` |
| No secrets | **PASS** via `node scripts/check-no-secrets.js` |
| No WhatsApp active | **WARN/FAIL** because WhatsApp workflows exist and `active` is undefined |
| No campaign mutation | **PASS** through agent contracts/tests and dashboard read-only copy |

## Critical Risks

- PR #6 still describes a 5-brand system in operational docs even though WEDO Meta OS currently has only 3 real products.
- Removed products still appear as pending/current activation work in `docs/n8n-activation-results.md`.
- Workflow exports are not explicitly inactive, while webhook and WhatsApp send nodes are present.
- Product routing lifecycle is weaker than documented because draft products are not explicitly excluded by `buildRoutingMap()`.

## Medium Risks

- Current brand configs rely on inferred `activation_status` instead of explicit lifecycle state.
- Product schema and brand-config validator disagree on whether `meta_ad_account_id` is required for active/testing products.
- Manual Meta Business setup docs should clarify they are human-only and must never become browser automation.
- Some agents passed with warnings for missing blocked action coverage.

## Recommendations For Claude Code

1. Remove Jardinero Davis and FC Guia Panama from PR #6 operational docs, seeds, tests, dashboards, readiness requirements, and activation plans.
2. Replace every "5 brands" statement with "3 current products" plus a separate future-product registry statement.
3. Add explicit `activation_status` to all current brand configs.
4. Update `lib/product-registry.js` so only `active` and `testing` products route.
5. Align `schemas/product.schema.json` and `scripts/validate-brand-configs.js` on Meta ID requirements.
6. Add explicit `active: false` or equivalent disabled metadata to workflow JSON exports.
7. Mark WhatsApp workflows as disabled/template-only until Meta App Review, credentials, and human approval are complete.
8. Keep Meta asset discovery API-only; never add browser automation or scraping for Meta.

## Unblock Decision

Decision: **BLOCK PR #6**

PR #6 should not advance until:

- The repo and PR copy reflect only KMediaFilms, En la Galeria de Ana, and DRIVIP as current products.
- Removed products appear nowhere as current or pending operational scope.
- Dynamic Product Registry lifecycle enforcement is corrected.
- Workflow exports are explicitly inactive and cannot accidentally send messages, touch WhatsApp, or activate production webhooks.
