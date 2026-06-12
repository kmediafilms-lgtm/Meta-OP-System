# WEDO Meta OS — Meta Automation Safety Policy

**Effective from:** Control Plane v1  
**Applies to:** All code, agents, workflows, scripts, and operators in this system

---

## Core principle

> WEDO Meta OS operates exclusively through **official Meta APIs and MCP servers**. Browser automation, scraping, and UI simulation are permanently prohibited.

---

## What is PROHIBITED

| Category | Examples | Risk |
|----------|---------|------|
| Browser automation | Puppeteer, Playwright, Selenium, Chromium, Browserless | Account ban, ToS violation, detection evasion |
| UI scraping | Navigating business.facebook.com, adsmanager.facebook.com | ToS violation, data integrity risk |
| Visual extraction | Screenshots of Ads Manager parsed by AI | Unreliable, ToS violation |
| Automated clicks | page.click(), fill(), goto() on Meta properties | Bot detection, account restriction |
| navigator.webdriver | Bot detection bypass | Explicit ToS violation |
| Bulk API loops without backoff | Mass campaign reads/writes without rate limit respect | Account flagging |
| Campaign mutations without human approval | Auto-pausing, auto-bidding, auto-budget changes | Revenue loss, client damage |
| WhatsApp sends without opt-in | Any message to a number that hasn't opted in | WhatsApp ban, GDPR/CCPA risk |

---

## What is PERMITTED

| Category | Implementation | Status |
|----------|---------------|--------|
| Read campaign metrics | Meta Marketing API GET /adaccounts/{id}/campaigns | Permitted |
| Read insights | Meta Marketing API GET /insights | Permitted |
| Receive DMs | Instagram Messaging API via Webhooks | Permitted |
| Draft replies | copy-conversion agent → stored in Supabase, not sent | Permitted |
| Human-approved replies | n8n → after Ricardo approves in dashboard | Permitted |
| Read page events | Facebook Graph API via Webhooks | Permitted |
| Read ad leads | Lead Ads Webhook or API | Permitted |
| WhatsApp (future) | WhatsApp Cloud API with confirmed opt-in | Future — Phase C+ |

---

## Why browser automation is high risk

1. **Account ban:** Meta actively detects automated browser sessions. A single detected session can result in immediate account suspension for all connected assets.

2. **ToS violation:** Section 3 of Meta's Platform Policy prohibits unauthorized automation. Violations can result in permanent removal from the Meta ecosystem.

3. **Unreliable data:** Scraped UI values (budgets, status, metrics) can be stale, cached, or incorrectly parsed. API data is authoritative.

4. **Client liability:** WEDO manages client accounts. A ban triggered by automation affects KMediaFilms, Ana, and DRIVIP — not just the WEDO account.

5. **No audit trail:** Browser automation actions leave no proper log. API calls do.

---

## The three-tier action model

```
READ         →  always allowed (GET API calls, webhook event reception)
DRAFT        →  allowed (copy generated, stored in Supabase, NOT sent)
EXECUTE      →  always requires human approval
```

No agent, workflow, or script may cross from DRAFT to EXECUTE without explicit human sign-off.

---

## Human approval rule

Every action that affects external parties requires human approval:

| Action | Approval required |
|--------|-----------------|
| Send any message (IG DM, WhatsApp) | ✅ Always |
| Post any comment or story | ✅ Always |
| Pause a campaign | ✅ Always |
| Modify campaign budget | ✅ Always |
| Create a new ad | ✅ Always |
| Enable/disable an ad set | ✅ Always |
| Export any client data | ✅ Always |

---

## Ads security limits

- **No campaign mutations** without human approval AND documented reason
- **No budget changes** via automation — human sets budget in Ads Manager directly
- **No audience targeting changes** via automation
- **Reads are always safe** — GET /insights, GET /campaigns, GET /adsets
- **Reports are always safe** — generating PDF/dashboard from API data
- **Recommendations are always safe** — campaign-analyst agent outputs analysis, not commands

---

## KMedia client accounts policy

KMediaFilms, En la Galería de Ana, and DRIVIP are **client accounts**, not WEDO accounts.

Rules for client accounts:
1. **No automated access** without explicit written authorization per account
2. **API access only** — never browser, never Ads Manager UI automation
3. **Human approval required** before any change to any client account
4. **Full logging** — all API calls to client accounts must be logged in `events_log` table
5. **No bulk operations** — no looping over all ads to change status or budget
6. **No aggressive retry loops** — if an API call fails, log and escalate, do not retry >3 times
7. **Rollback plan required** — before any mutation, document how to reverse it
8. **Scope limitation** — access only the specific resource needed (e.g., GET on one ad account, not all)

---

## n8n workflow constraints

Workflows in n8n must:
- Use only HTTP Request nodes calling official Meta API endpoints
- Never include Code nodes that import Puppeteer, Playwright, or Selenium
- Never call `business.facebook.com` or `adsmanager.facebook.com` URLs
- Never send messages without a preceding `Human Approval` node
- Never modify campaign status or budget without a preceding `Human Approval` node
- Log every Meta API call to Supabase `events_log` (brand_id, event_type, endpoint, outcome)

---

## Violation response

If a violation of this policy is detected:
1. `check-no-dangerous-actions.js` will exit 1 and block deployment
2. The code must be removed before any commit can proceed
3. If a live workflow violates this policy, Ricardo deactivates it immediately
4. No exception process exists — these rules are not negotiable
