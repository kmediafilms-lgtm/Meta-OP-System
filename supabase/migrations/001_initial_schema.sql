-- WEDO Meta OS — Initial Schema
-- Migration: 001_initial_schema
-- Safe to run multiple times (IF NOT EXISTS guards)

-- ─── EXTENSIONS ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── BRANDS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brands (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id                TEXT UNIQUE NOT NULL,           -- e.g. "ana", "drivip"
  brand_name              TEXT NOT NULL,
  business_unit           TEXT,
  active_status           BOOLEAN DEFAULT TRUE,
  facebook_page_id        TEXT,
  instagram_business_id   TEXT,
  meta_ad_account_id      TEXT,
  whatsapp_waba_id        TEXT,
  whatsapp_phone_number_id TEXT,
  default_language        TEXT DEFAULT 'es',
  timezone                TEXT DEFAULT 'America/Panama',
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CONTACTS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contacts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        TEXT NOT NULL REFERENCES brands(brand_id),
  external_id     TEXT,                    -- Meta sender ID
  channel         TEXT NOT NULL,           -- instagram | whatsapp | facebook
  display_name    TEXT,
  username        TEXT,
  phone_number    TEXT,
  opt_in          BOOLEAN DEFAULT FALSE,
  do_not_contact  BOOLEAN DEFAULT FALSE,
  first_seen_at   TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (brand_id, external_id, channel)
);

-- ─── CONVERSATIONS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        TEXT NOT NULL REFERENCES brands(brand_id),
  contact_id      UUID REFERENCES contacts(id),
  channel         TEXT NOT NULL,
  status          TEXT DEFAULT 'open'
                    CHECK (status IN ('open','pending_human','closed','spam')),
  thread_id       TEXT,                    -- Meta thread/conversation ID
  last_message_at TIMESTAMPTZ,
  opened_at       TIMESTAMPTZ DEFAULT NOW(),
  closed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        TEXT NOT NULL REFERENCES brands(brand_id),
  conversation_id UUID REFERENCES conversations(id),
  contact_id      UUID REFERENCES contacts(id),
  direction       TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  channel         TEXT NOT NULL,
  message_id      TEXT,                    -- Meta message ID
  content         TEXT,
  intent          TEXT,                    -- classified by agent
  sentiment       TEXT,
  requires_human  BOOLEAN DEFAULT FALSE,
  sent_by_human   BOOLEAN DEFAULT FALSE,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LEADS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        TEXT NOT NULL REFERENCES brands(brand_id),
  contact_id      UUID REFERENCES contacts(id),
  conversation_id UUID REFERENCES conversations(id),
  lead_score      INTEGER DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100),
  temperature     TEXT DEFAULT 'cold' CHECK (temperature IN ('cold','warm','hot')),
  intent          TEXT,
  status          TEXT DEFAULT 'new'
                    CHECK (status IN ('new','contacted','qualified','quoted','reserved','lost','won')),
  source          TEXT,
  notes           TEXT,
  next_followup_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CAMPAIGNS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS campaigns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        TEXT NOT NULL REFERENCES brands(brand_id),
  meta_campaign_id TEXT,
  name            TEXT NOT NULL,
  objective       TEXT,
  status          TEXT DEFAULT 'unknown'
                    CHECK (status IN ('active','paused','archived','unknown')),
  daily_budget    NUMERIC,
  lifetime_budget NUMERIC,
  start_date      DATE,
  end_date        DATE,
  last_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CAMPAIGN METRICS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS campaign_metrics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        TEXT NOT NULL REFERENCES brands(brand_id),
  campaign_id     UUID REFERENCES campaigns(id),
  date_preset     TEXT,                    -- last_7d, last_30d, etc.
  period_start    DATE,
  period_end      DATE,
  spend           NUMERIC DEFAULT 0,
  impressions     INTEGER DEFAULT 0,
  reach           INTEGER DEFAULT 0,
  clicks          INTEGER DEFAULT 0,
  ctr             NUMERIC,
  cpc             NUMERIC,
  cpm             NUMERIC,
  conversations   INTEGER DEFAULT 0,
  leads           INTEGER DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  bookings        INTEGER DEFAULT 0,
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── APPROVALS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS approvals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        TEXT NOT NULL REFERENCES brands(brand_id),
  action_type     TEXT NOT NULL,           -- message_reply | campaign_change | quote | etc.
  risk_level      TEXT DEFAULT 'medium'
                    CHECK (risk_level IN ('low','medium','high','critical')),
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','edited','rejected','expired')),
  payload         JSONB,
  draft_response  TEXT,
  reason          TEXT,
  requested_at    TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,
  resolved_by     TEXT,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FOLLOWUPS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS followups (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        TEXT NOT NULL REFERENCES brands(brand_id),
  lead_id         UUID REFERENCES leads(id),
  contact_id      UUID REFERENCES contacts(id),
  day_number      INTEGER,                 -- D0, D1, D3, D7
  status          TEXT DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','sent','skipped','completed')),
  scheduled_at    TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  message_draft   TEXT,
  outcome         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── EVENTS LOG ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        TEXT REFERENCES brands(brand_id),
  event_type      TEXT NOT NULL,
  channel         TEXT,
  source_id       TEXT,                    -- Meta page_id, ig_id, etc.
  routing_method  TEXT,
  payload         JSONB,
  processed       BOOLEAN DEFAULT FALSE,
  error           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LEARNING NOTES ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS learning_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        TEXT REFERENCES brands(brand_id),
  pattern         TEXT,
  learning_note   TEXT NOT NULL,
  recommendation  TEXT,
  confidence      NUMERIC DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
  source          TEXT,                    -- campaign | conversation | lead
  source_id       UUID,
  validated       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_contacts_brand ON contacts(brand_id);
CREATE INDEX IF NOT EXISTS idx_conversations_brand ON conversations(brand_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_brand ON messages(brand_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_leads_brand ON leads(brand_id);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_approvals_brand ON approvals(brand_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_events_log_brand ON events_log(brand_id);
CREATE INDEX IF NOT EXISTS idx_events_log_type ON events_log(event_type);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['brands','contacts','conversations','leads','campaigns','approvals','followups'] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON %I;
      CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
    ', t, t);
  END LOOP;
END $$;

-- ─── RLS SETUP (permissive for now — tighten before production) ───────────────

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_notes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all rows (tighten per-brand before production)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'brands','contacts','conversations','messages','leads',
    'campaigns','campaign_metrics','approvals','followups',
    'events_log','learning_notes'
  ] LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS allow_authenticated_read ON %I;
      CREATE POLICY allow_authenticated_read ON %I
        FOR SELECT TO authenticated USING (true);
    ', t, t);
    EXECUTE format('
      DROP POLICY IF EXISTS allow_service_role_all ON %I;
      CREATE POLICY allow_service_role_all ON %I
        FOR ALL TO service_role USING (true) WITH CHECK (true);
    ', t, t);
  END LOOP;
END $$;
