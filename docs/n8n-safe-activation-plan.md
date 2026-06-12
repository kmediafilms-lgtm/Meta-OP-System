# WEDO Meta OS — n8n Safe Activation Plan

All n8n workflows start INACTIVE. This document is the step-by-step activation plan for when Ricardo is ready to go live.

## Current Status

| Workflow | Status | Description |
|----------|--------|-------------|
| WEDO - Router Test Only | INACTIVE | Brand routing + intent classification test |
| WEDO - Meta Webhook Router | INACTIVE | Production webhook routing |
| WEDO - Instagram Inbound Draft Only | INACTIVE | IG DM → draft reply (no send) |
| WEDO - Ads Read Only Reporter | INACTIVE | Ads metrics pull |
| WEDO - Human Approval | INACTIVE | Approval queue |
| WEDO - Error Monitor | INACTIVE | Error alerting |
| WEDO - Weekly Brand Report | INACTIVE | Weekly summary |

## Prerequisites Before Any Activation

1. **Ricardo sets these variables in n8n Settings → Variables:**
   - `META_ACCESS_TOKEN` — long-lived token from Meta Business Suite
   - `WHATSAPP_TOKEN` — WhatsApp Cloud API token (separate from Meta token)
   - `SUPABASE_URL` — project URL from Supabase dashboard
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase Settings → API
   - `N8N_WEBHOOK_SECRET` — random string for webhook signature validation

2. **Claude Code never has access to these values** — they live only in n8n's encrypted variable store

3. **Supabase migration applied** — run `001_initial_schema.sql` and `001_brands.sql`

4. **Meta webhook configured** — Verify Token and endpoint URL set in Meta Developer App

## Activation Order

### Phase A: Read-Only (Safe)

**Step A1: Activate WEDO - Router Test Only**
- Purpose: Validate brand routing with live test payloads
- Risk: Zero — no Meta API calls, no message sends
- Test: Run manual trigger, verify all 5 brands route correctly

**Step A2: Activate WEDO - Ads Read Only Reporter**
- Purpose: Pull campaign metrics (GET only)
- Risk: Low — read-only Meta API calls
- Test: Verify metrics appear for Ana and DRIVIP ad accounts

**Step A3: Activate WEDO - Error Monitor**
- Purpose: Alert when workflows fail
- Risk: Zero — reads internal n8n execution logs
- Test: Trigger a deliberate test error, verify alert fires

### Phase B: Inbound Monitoring (No Sends)

**Step B1: Activate WEDO - Meta Webhook Router**
- Purpose: Route incoming Meta events to brand-specific flows
- Risk: Low — reads events, routes, logs to Supabase. No sends.
- Prerequisites: Supabase connected, webhook endpoint live in Meta App settings
- Test: Send test DM to each brand's Instagram. Verify events logged in Supabase.

**Step B2: Activate WEDO - Instagram Inbound Draft Only**
- Purpose: Classify intents and generate draft replies (NOT sent)
- Risk: Low — output is a draft stored in Supabase approvals table
- Test: Verify draft appears in dashboard /approvals. Verify nothing is sent.

### Phase C: Human-Gated Actions

**Step C1: Activate WEDO - Human Approval**
- Purpose: Surface pending approvals to Ricardo for action
- Risk: Medium — Ricardo can approve a send from this workflow
- Prerequisites: B1 and B2 running cleanly for ≥48h
- Test: Approve one test reply in staging. Verify exactly one message sent.

### Phase D: Reporting

**Step D1: Activate WEDO - Weekly Brand Report**
- Purpose: Auto-generate weekly summaries
- Risk: Low — reads data, sends summary to Ricardo only (not to leads)
- Test: Trigger manually, verify report format

## Safety Checks Before Each Activation

Run before activating any workflow:
```bash
node scripts/check-no-secrets.js
node scripts/check-no-dangerous-actions.js
node scripts/validate-brand-configs.js
```

## Emergency Stop

If anything behaves unexpectedly:
1. Deactivate the workflow immediately in n8n
2. Check execution logs in n8n
3. Check events_log in Supabase
4. Do NOT re-activate until root cause is understood

Ricardo is the only person who activates or deactivates production workflows. Claude Code can propose changes but never activates.

## Credentials Protocol

- Tokens are NEVER in the repo
- Tokens are NEVER in `.env` files committed to git
- Tokens live in n8n Settings → Variables (encrypted)
- Tokens live in Vercel Environment Variables (server-only, encrypted)
- If a token is accidentally committed: rotate it immediately, then remove from git history
