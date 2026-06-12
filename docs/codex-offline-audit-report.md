# Codex Offline Audit Report - PR #6

Date: 2026-06-12
Repo: `kmediafilms-lgtm/Meta-OP-System`
PR: #6 - `feat: WEDO Meta OS Control Plane v1`
Branch audited: `feature/wedo-control-plane-v1`
Head audited: `cc6ef1a`
Mode: offline repo audit only. No n8n, Supabase, Vercel, Meta Graph, tokens, `.env`, merge, real messages, campaign changes, or production webhooks were used.

## Result

Overall: **FAIL**

Merge decision: **PR #6 is not unblocked for merge yet**

Most previous blockers were fixed: active docs no longer say "5 brands", Jardinero/FC references are archived only, workflow exports now have `active: false`, send nodes were converted to disabled/no-op nodes, and draft/paused routing tests were added.

Remaining blocker: Product Registry routing now gates on `activation_status in ["active", "testing"]`, but it does **not** gate on `meta_connection_status` being verified/connected/live. Current brand configs also do not define `activation_status` or `meta_connection_status` explicitly, so the requested rule "only active/testing + verified/connected can route" is not fully enforced.

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
| `node scripts/run-offline-audit.js` | **PASS** | Offline audit passed. Route tests now include draft and paused negative cases. |
| `node scripts/check-no-dangerous-actions.js` | **PASS** | No unsafe dangerous actions detected. |
| `node scripts/check-no-secrets.js` | **PASS** | No obvious secrets found. |
| `node scripts/validate-agent-contracts.js` | **WARN** | Exit 0, with 4 non-fatal suggested blocked-action warnings. |
| `node scripts/validate-brand-configs.js` | **PASS** | 3 products validated. |
| `node scripts/route-test-events.js` | **PASS** | 12 route tests passed, including draft and paused escalation. |
| `node scripts/test-webhook-payloads.js` | **PASS** | Fixture listing ran successfully. |

## Blocker Closure

| Prior blocker | Status | Evidence |
| --- | --- | --- |
| Active docs saying "5 brands" | **PASS** | No matches outside `docs/archive/` and this report. |
| Jardinero Davis / FC Guia Panama outside archive | **PASS** | References only found in `docs/archive/n8n-activation-results.md` and archived reports. |
| Workflows missing explicit inactive state | **PASS** | Every `workflows/*.json` has `active: false`. |
| Productive WhatsApp/send nodes active | **PASS** | Send/WhatsApp output nodes are disabled/no-op in inactive workflow exports. |
| Productive webhook active | **PASS** | Webhook workflow export has `active: false`. |
| Draft product with IDs routes | **PASS** | Route test shows draft product with IDs returns `unidentified`. |
| Paused product routes | **PASS** | Route test shows paused product returns `unidentified`. |
| Unknown product routes | **PASS** | Unknown and missing IDs return `unidentified` and require human review. |
| Active/testing + verified/connected required to route | **FAIL** | Registry checks only activation status, not `meta_connection_status`; current brand configs omit that field. |

## Scope

Status: **PASS**

- Active product directories are only:
  - `brands/kmediafilms`
  - `brands/en-la-galeria-de-ana`
  - `brands/drivip`
- `supabase/seed/001_brands.sql` seeds only `kmediafilms`, `ana`, and `drivip`.
- `apps/dashboard/lib/mock-data.ts` exposes only KMediaFilms, En la Galeria de Ana, and DRIVIP in `BRANDS`.
- Jardinero Davis and FC Guia Panama references are confined to `docs/archive/`, where the n8n activation file states they are not active products.

## Product Registry

Status: **FAIL**

Pass:

- `lib/product-registry.js` reads products dynamically from `brands/<slug>/brand-config.json`.
- No rigid `if brand === "jardinero-davis"` or `if brand === "fc-guia-panama"` logic was found.
- Central registry routing uses `ROUTABLE_STATUSES = ["active", "testing"]`.
- `route-test-events.js` confirms `unknown`, `draft`, `paused`, and missing IDs escalate to human review.
- Future product onboarding is represented by `tests/fixtures/products/new-product-example.json`.

Fail:

- `buildRoutingMap()` does not check `meta_connection_status`.
- Current brand configs report `activation_status=undefined` and `meta_connection_status=undefined`; routing infers active from `active_status: true`.
- There is no negative test for `activation_status: active` with `meta_connection_status: not_configured` or missing.
- Archived/inactive handling is correct by status logic, but the verified/connected requirement is not implemented.

Required fix:

- Add explicit lifecycle and connection fields to current brand configs.
- Add registry gating such as `activation_status in ["active", "testing"]` **and** `meta_connection_status in ["verified", "connected", "live"]` or the repo's chosen equivalent.
- Add route tests for active/testing products with unverified/missing connection status to confirm they escalate.

## Workflows

Status: **PASS with minor caution**

Pass:

- All workflow exports have `active: false`.
- WhatsApp send/report nodes are disabled/no-op.
- Instagram reply and WhatsApp send nodes are marked disabled/future phase.
- No `active: true` workflow export was found.

Minor caution:

- Some trigger/read nodes are not individually disabled, for example `Webhook Receiver`, `WhatsApp Trigger`, Facebook trigger, and campaign read nodes. Because every workflow export is explicitly `active: false`, they are not productively active. Keep this invariant enforced before importing to n8n.

## Meta Safety

Status: **PASS**

- No Puppeteer, Playwright, Selenium, Chromium automation, browserless, `navigator.webdriver`, `page.click`, or `page.goto` implementation was found.
- No Meta UI automation for `business.facebook.com` or `adsmanager.facebook.com` was found.
- Scraping/browser automation terms appear only in prohibition docs, archived notes, and scanner code.
- Ads are read-only by default.
- Campaign Analyst has `do_not_execute: const true`.
- Campaign mutation checks pass and campaign changes require human approval.

## Agents

Status: **PASS with validator warnings**

All 8 agents include:

- `browser_automation`
- `scraping`
- `campaign_mutation_without_approval`
- `budget_change_without_approval`
- `whatsapp_send_without_opt_in`

`validate-agent-contracts.js` still reports 4 non-fatal warnings about adding `send_whatsapp` / `call_meta_api` in some agents. These are not failures for the required five blocked actions.

## Secrets And Local Files

Status: **PASS**

- No real `.env`, `.env.*`, or `*.env` files found.
- `check-no-secrets.js` passed.
- No token-like secrets detected.

## Critical Findings

1. Product Registry does not enforce the requested verified/connected connection gate before routing.
2. Current brand configs omit explicit `activation_status` and `meta_connection_status`.

## Medium Findings

1. Workflow exports are inactive, but some trigger/read nodes remain structurally enabled inside inactive exports. This is acceptable for merge only if `active: false` remains mandatory.
2. `validate-agent-contracts.js` still emits 4 non-fatal warnings.

## Residues Found

- Jardinero/FC references remain only in `docs/archive/`.
- Browser automation/scraping terms remain only in prohibition docs, archive, and scanner code.
- Disabled/no-op WhatsApp/send nodes remain as future-phase workflow templates.

## Recommendation

Do **not** merge PR #6 yet if the merge bar requires "only products active/testing + verified/connected can route."

Before merge:

1. Add explicit `activation_status` and `meta_connection_status` to current brand configs.
2. Update `lib/product-registry.js` to require both routable lifecycle status and verified/connected/live connection status.
3. Add route tests proving active/testing but unverified/missing connection status escalates to human review.
4. Rerun this offline audit.

If the verified/connected requirement is intentionally deferred, document that exception explicitly and keep PR #6 as **WARN**, not PASS.
