# WEDO Meta OS — Operating Model

## What is WEDO Meta OS?

WEDO Meta OS is a multi-brand marketing operating system built on top of Meta's platforms (Instagram, Facebook, WhatsApp, Ads). It enables the WEDO consultancy to manage 5 client brands from a single automated system, with strict brand separation, human approval gates, and zero accidental message sends.

## System Hierarchy

```
WEDO (consultancy layer — this system)
├── KMediaFilms          — film production studio      [active]
├── En la Galería de Ana — event photography           [active]
└── DRIVIP               — luxury ground transport     [active]
    ... future products added via Product Registry
```

New products are onboarded via `brands/<slug>/brand-config.json` and a Supabase INSERT. No code changes required. See `docs/product-onboarding-model.md`.

## Operational Layers

### 1. Inbound Layer
- Meta webhooks → n8n → brand-router agent
- Every event gets a `brand_id` before anything else happens
- Unidentified events escalate immediately to human review

### 2. Intelligence Layer
- intent-classifier: what does the person want?
- lead-scoring: how valuable is this lead?
- compliance-agent: is the action allowed?

### 3. Action Layer
- copy-conversion: draft reply (never sends)
- campaign-analyst: analyze metrics (never modifies)
- human-approval: queue everything sensitive

### 4. Memory Layer (Supabase)
- All data is brand-scoped
- contacts, conversations, messages, leads, campaigns, approvals, followups, events_log, learning_notes

### 5. Learning Layer
- learning-agent: patterns from success/failure
- Notes stored in `learning_notes` table
- Nothing applied automatically

## Brand Separation Rules

1. Every database row requires `brand_id`
2. Every agent receives `brand_id` as a required input
3. n8n workflows route by `brand_id` before any action
4. Dashboard filters all views by `brand_id`
5. No cross-brand data leakage is architecturally possible

## Human Approval Rules

| Risk Level | Trigger | Timeout |
|-----------|---------|---------|
| CRITICAL | Bulk actions, payment-adjacent | 15 min |
| HIGH | Hot leads, same-day bookings | 2 hours |
| MEDIUM | Warm leads, campaign changes | 24 hours |
| LOW | Cold leads, reports | 24 hours |

All replies, campaign changes, and new messages require human approval. The system never sends a message autonomously.

## What Ricardo Does

- Provides Meta access tokens (never stored in repo)
- Approves pending actions in the dashboard
- Reviews weekly brand reports
- Makes strategic decisions that agents surface but cannot execute

## What Claude Code Does

- Builds and maintains the system
- Runs validation scripts
- Creates n8n workflow structures
- Updates agent contracts
- Never approves or sends anything

## Safe Mode

The system ships in safe mode:
- All n8n workflows are INACTIVE
- Dashboard reads mock data only
- No Meta API credentials loaded
- All actions require explicit human approval

Production activation requires:
1. Ricardo adds real Meta tokens to n8n variables
2. Supabase credentials configured in Vercel
3. Each workflow manually activated one at a time
4. Load test in staging before any live brand traffic
