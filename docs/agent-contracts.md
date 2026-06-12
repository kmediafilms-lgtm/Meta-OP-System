# WEDO Meta OS — Agent Contracts

All 8 agents follow the same contract structure: `contract.json`, `prompt.md`, `tests.json`.

Validate all contracts: `node scripts/validate-agent-contracts.js`

## Contract Format

```jsonc
{
  "name": "agent-name",
  "version": "1.0.0",
  "description": "What this agent does",
  "max_tokens": 512,
  "input_schema": { /* JSON Schema for input */ },
  "output_schema": { /* JSON Schema for output */ },
  "blocked_actions": ["list", "of", "forbidden", "actions"],
  "allowed_actions": ["what", "it", "can", "do"]
}
```

## The 8 Agents

### 1. brand-router
- **Purpose:** Identify which brand owns an incoming Meta event
- **Input:** Raw webhook payload + optional IDs (page_id, ig_id, ad_account_id)
- **Output:** `{ brand_id, confidence, source, channel, requires_human, reason }`
- **Safety:** Never sends messages, never calls Meta API
- **Escalation:** Unidentified events → immediate human review

### 2. intent-classifier
- **Purpose:** Classify the intent of an incoming message
- **Input:** `brand_id`, `message_text`, `channel`
- **Output:** `{ intent, confidence, sentiment, requires_human, reason }`
- **Intents:** paquetes_boda, traslado, video_corporativo, precio, tour_inquiry, jardineria_inquiry, reclamo, descuento, spam, campaign_event, general_inquiry
- **Safety:** Never responds, never modifies CRM

### 3. lead-scoring
- **Purpose:** Score lead 0-100 and classify temperature
- **Input:** `brand_id`, `intent`, `message_text`, `channel`, optional context
- **Output:** `{ lead_score, temperature, reason, next_action, followup_day }`
- **Thresholds:** hot ≥75 · warm ≥40 · cold <40
- **Weights:** urgency 30% · clarity 25% · budget 20% · interaction 15% · channel 10%

### 4. compliance
- **Purpose:** Validate that a proposed action is safe and policy-compliant
- **Input:** `brand_id`, `proposed_action`, `action_params`, `channel`
- **Output:** `{ allowed, requires_human, blocked_reason, policy_flags[] }`
- **Policies:** opt-in, do_not_contact, 24h window, no_cold_dm, anti-spam
- **Safety:** Never executes actions, only validates

### 5. copy-conversion
- **Purpose:** Draft replies in each brand's tone — never sends
- **Input:** `brand_id`, `intent`, `message_text`, optional `lead_temperature`, `contact_name`
- **Output:** `{ draft_reply, tone_used, cta, requires_human, do_not_send: true }`
- **Critical:** `do_not_send` is `const: true` — hardcoded safety guarantee
- **Tones:** KMediaFilms (técnico/creativo), Ana (cálido/artístico), DRIVIP (profesional/premium)

### 6. campaign-analyst
- **Purpose:** Read-only analysis of Meta Ads metrics
- **Input:** `brand_id`, `campaign_metrics`, optional `date_range`
- **Output:** `{ summary, findings[], recommendations[], do_not_execute: true }`
- **Critical:** `do_not_execute` is `const: true` — analysis only, never modifies
- **Blocked:** pause_campaign, modify_budget, create_campaign, delete_adset

### 7. human-approval
- **Purpose:** Format and queue human approval requests
- **Input:** `brand_id`, `action_type`, `proposed_action`, `risk_level`, `context`
- **Output:** `{ approval_required: true, risk_level, reason, suggested_action, expires_in_minutes }`
- **Critical:** `approval_required` is `const: true` — always requires human
- **Timeouts:** critical=15min, high=120min, medium/low=1440min

### 8. learning
- **Purpose:** Generate learning notes from conversation/campaign patterns
- **Input:** `brand_id`, `event_type`, `outcome`, `context`
- **Output:** `{ learning_note, pattern, recommendation, confidence }`
- **Safety:** Notes are stored, never auto-applied
- **Blocked:** auto_apply_learning

## Safety Constants

These fields are hardcoded as `const` in the output schema — they cannot be changed by an LLM:

| Agent | Field | Value |
|-------|-------|-------|
| copy-conversion | `do_not_send` | `true` |
| campaign-analyst | `do_not_execute` | `true` |
| human-approval | `approval_required` | `true` |

## Adding a New Agent

1. Create `agents/<name>/contract.json` with all required fields
2. Create `agents/<name>/prompt.md` with system prompt
3. Create `agents/<name>/tests.json` with ≥3 test cases
4. Run `node scripts/validate-agent-contracts.js`
5. If the agent is a Claude Code subagent, also add `.claude/agents/<name>.md`
