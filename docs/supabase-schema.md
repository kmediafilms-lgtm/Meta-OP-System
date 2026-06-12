# WEDO Meta OS — Supabase Schema

> Migration: `supabase/migrations/001_initial_schema.sql`  
> Seed: `supabase/seed/001_brands.sql`

## Tables

| Table | Purpose | brand_id required |
|-------|---------|:-----------------:|
| `brands` | Master brand registry | — |
| `contacts` | People who've interacted | ✓ |
| `conversations` | Threads per contact per channel | ✓ |
| `messages` | Individual messages within conversations | ✓ |
| `leads` | Qualified intents with scoring | ✓ |
| `campaigns` | Ad campaigns from Meta | ✓ |
| `campaign_metrics` | Daily metric snapshots | ✓ |
| `approvals` | Human approval queue | ✓ |
| `followups` | Scheduled follow-up actions | ✓ |
| `events_log` | System event audit log | ✓ (nullable for errors) |
| `learning_notes` | Agent-generated patterns | ✓ |

## brands

```sql
brand_id        TEXT PRIMARY KEY
brand_name      TEXT NOT NULL
active          BOOLEAN DEFAULT true
meta_page_id    TEXT
meta_ig_id      TEXT
meta_ad_account TEXT
whatsapp_phone  TEXT
created_at      TIMESTAMPTZ
```

## contacts

```sql
id              UUID PRIMARY KEY
brand_id        TEXT → brands(brand_id)
platform        TEXT  -- instagram | facebook | whatsapp
platform_id     TEXT  -- sender PSID or IGSID
name            TEXT
first_seen_at   TIMESTAMPTZ
last_seen_at    TIMESTAMPTZ
do_not_contact  BOOLEAN DEFAULT false
```

## conversations

```sql
id              UUID PRIMARY KEY
brand_id        TEXT → brands(brand_id)
contact_id      UUID → contacts(id)
channel         TEXT  -- instagram_dm | whatsapp | facebook_messenger
status          TEXT  -- open | closed | pending_human
last_message_at TIMESTAMPTZ
```

## messages

```sql
id              UUID PRIMARY KEY
brand_id        TEXT → brands(brand_id)
conversation_id UUID → conversations(id)
direction       TEXT  -- inbound | outbound
content         TEXT
intent          TEXT
sentiment       TEXT
requires_human  BOOLEAN DEFAULT false
sent_at         TIMESTAMPTZ
```

## leads

```sql
id              UUID PRIMARY KEY
brand_id        TEXT → brands(brand_id)
contact_id      UUID → contacts(id)
intent          TEXT
score           INT   -- 0-100
temperature     TEXT  -- cold | warm | hot
status          TEXT  -- new | contacted | qualified | closed
source_channel  TEXT
notes           TEXT
```

## campaigns

```sql
id              UUID PRIMARY KEY
brand_id        TEXT → brands(brand_id)
meta_campaign_id TEXT
name            TEXT
objective       TEXT
status          TEXT  -- active | paused | archived
budget_daily    NUMERIC
start_date      DATE
end_date        DATE
```

## campaign_metrics

```sql
id              UUID PRIMARY KEY
brand_id        TEXT → brands(brand_id)
campaign_id     UUID → campaigns(id)
date            DATE
spend           NUMERIC
impressions     INT
clicks          INT
ctr             NUMERIC
leads_count     INT
```

## approvals

```sql
id              UUID PRIMARY KEY
brand_id        TEXT → brands(brand_id)
action_type     TEXT  -- message_reply | campaign_change | lead_followup
risk_level      TEXT  -- low | medium | high | critical
payload         JSONB
reason          TEXT
status          TEXT  -- pending | approved | rejected | expired
expires_at      TIMESTAMPTZ
resolved_by     TEXT
resolved_at     TIMESTAMPTZ
```

## followups

```sql
id              UUID PRIMARY KEY
brand_id        TEXT → brands(brand_id)
lead_id         UUID → leads(id)
scheduled_for   TIMESTAMPTZ
message_draft   TEXT
status          TEXT  -- pending | sent | cancelled
requires_human  BOOLEAN DEFAULT true
```

## events_log

```sql
id              UUID PRIMARY KEY
brand_id        TEXT  -- nullable (unrouted events)
event_type      TEXT
routing_method  TEXT
raw_payload     JSONB
processed       BOOLEAN DEFAULT false
error           TEXT
```

## learning_notes

```sql
id              UUID PRIMARY KEY
brand_id        TEXT → brands(brand_id)
pattern         TEXT
note            TEXT
recommendation  TEXT
confidence      NUMERIC  -- 0.0–1.0
source_agent    TEXT
applied         BOOLEAN DEFAULT false
```

## Security

- RLS enabled on all tables
- Permissive policies for `authenticated` and `service_role`
- No anon access
- No credentials stored in repo — configure via Supabase project settings

## Connecting

Set in Vercel / environment:
```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable>
SUPABASE_SERVICE_ROLE_KEY=<secret — server only>
```

Run migration:
```bash
supabase db push   # or paste 001_initial_schema.sql in Supabase SQL editor
```

Seed brands:
```bash
supabase db seed   # or paste 001_brands.sql in Supabase SQL editor
```
