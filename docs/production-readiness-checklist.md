# WEDO Meta OS — Production Readiness Checklist

Run this checklist before declaring any component production-ready.

## Mandatory Safety Blocks

These must be confirmed **before any other check**. If any block fails, stop immediately.

- [ ] **No browser automation** — `grep -r "puppeteer\|playwright\|selenium\|page\.click\|page\.goto" scripts/ agents/ apps/ lib/` returns empty
- [ ] **No scraping** — `grep -ri "scraping\|\.scrape(" scripts/ agents/ apps/ lib/` returns empty
- [ ] **No campaign mutations** — no code path modifies campaign/adset/budget without human approval gate
- [ ] **No WhatsApp sends** — no workflow sends WhatsApp messages (Phase C+ only, after Meta review)
- [ ] **No productive webhooks active** — all n8n workflows are INACTIVE until Ricardo approves each phase
- [ ] **Ads read-only first** — campaign-analyst agent confirmed as `do_not_execute: const true`
- [ ] **`node scripts/check-no-dangerous-actions.js` exits 0**
- [ ] **`node scripts/check-no-secrets.js` exits 0**

> Reference: `docs/meta-automation-safety-policy.md`

## System Scripts

```bash
node scripts/validate-brand-configs.js       # 3 products, 0 errors
node scripts/validate-agent-contracts.js     # 8 agents, 0 errors
node scripts/validate-supabase-schema.js     # 11 tables, all constraints
node scripts/check-no-secrets.js             # 0 hardcoded tokens
node scripts/check-no-dangerous-actions.js   # 0 dangerous patterns
node scripts/mock-control-plane-run.js       # 5/5 pass, all require human approval
node scripts/route-test-events.js            # All products route correctly
node scripts/run-offline-audit.js            # Full suite, all exit 0
```

Expected: all exit 0.

## Product Configs (3 active products)

- [ ] `kmediafilms` — real Meta IDs confirmed (fb, ig) ✓
- [ ] `ana` — real Meta IDs confirmed (fb, ig, ads) ✓
- [ ] `drivip` — real Meta IDs confirmed (fb, ig, ads) ✓

Future products are added via the Product Registry onboarding flow. See `docs/product-onboarding-model.md`.

## Agent Contracts

- [ ] All 8 agents have contract.json + prompt.md + tests.json
- [ ] copy-conversion: `do_not_send: const true`
- [ ] campaign-analyst: `do_not_execute: const true`
- [ ] human-approval: `approval_required: const true`
- [ ] All agents have blocked_actions defined

## Supabase

- [ ] Migration `001_initial_schema.sql` applied to project
- [ ] Seed `001_brands.sql` applied (3 products)
- [ ] RLS enabled on all 11 tables
- [ ] Supabase URL and anon key added to Vercel environment variables
- [ ] Service role key added to n8n variables only (never Vercel public)
- [ ] Test: insert a row into `events_log`, verify RLS permits it

## n8n Workflows

- [ ] All workflows start as INACTIVE
- [ ] n8n variables set by Ricardo:
  - [ ] `META_ACCESS_TOKEN`
  - [ ] `WHATSAPP_TOKEN`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `N8N_WEBHOOK_SECRET`
- [ ] Phase A activation complete (read-only) + 24h stable
- [ ] Phase B activation complete (inbound) + 48h stable
- [ ] Phase C activation approved by Ricardo

## Vercel Dashboard

- [ ] Dashboard builds without errors
- [ ] All 7 routes accessible: /dashboard, /inbox, /leads, /approvals, /campaigns, /brands, /logs
- [ ] Mock data displays correctly
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] No API keys in client-side code

## Meta App

- [ ] App is in Development mode (not Live) for initial testing
- [ ] Webhook Verify Token matches n8n variable
- [ ] Webhook URL points to n8n endpoint
- [ ] Subscribed events: `messages`, `messaging_postbacks`
- [ ] Instagram account connected to Facebook Page
- [ ] App Review not required for own accounts (own-page messaging)

## Security

- [ ] `node scripts/check-no-secrets.js` exits 0
- [ ] No `.env` file committed to repo
- [ ] `.gitignore` includes `.env*` (except `.env.example`)
- [ ] No tokens in commit history (`git log --all --full-diff -p | grep -E 'EAA|TOKEN'`)
- [ ] n8n credential values set by Ricardo only — never by Claude Code
- [ ] Human approval required for every send, every campaign change

## Go-Live Sign-Off

Ricardo approves each phase before activation. Claude Code never activates production workflows.

| Phase | Description | Approved By | Date |
|-------|-------------|-------------|------|
| A | Read-only workflows | | |
| B | Inbound monitoring | | |
| C | Human-gated sends | | |
| D | Reporting | | |
