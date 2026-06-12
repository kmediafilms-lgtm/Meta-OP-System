# WEDO Meta OS — Control Plane Roadmap

## v1 — Control Plane Foundation (Current)

**Goal:** Build the full system skeleton with all safety guarantees before any live traffic.

### Completed ✓

- [x] Multi-brand config for 3 current products (validated)
- [x] Supabase schema — 11 tables, brand_id on all, RLS
- [x] 8 agent contracts with safety constants
- [x] 24 agent files (contract.json + prompt.md + tests.json)
- [x] 6 n8n workflow stubs (all inactive)
- [x] Next.js dashboard with 7 routes (mock data)
- [x] 5 validation scripts
- [x] 6 operational docs
- [x] Real Meta IDs for KMediaFilms, Ana, DRIVIP

### In Progress

- [ ] Ricardo sets n8n credentials

### Ready to Activate (with Ricardo approval)

- [ ] Phase A: Read-only n8n workflows
- [ ] Phase B: Inbound monitoring (no sends)
- [ ] Phase C: Human-gated sends

---

## v1.1 — Supabase Integration

**Goal:** Connect the dashboard to real Supabase data.

- [ ] Replace mock-data.ts imports with Supabase queries
- [ ] Add Supabase client to `apps/dashboard/lib/supabase.ts`
- [ ] Dashboard reads live data from events_log, leads, approvals
- [ ] Approval buttons trigger n8n webhook (still requires human click)
- [ ] Auth — protect dashboard behind Supabase Auth (Magic Link)

---

## v1.2 — n8n Live Routing

**Goal:** Route real Meta events end-to-end in draft/approval mode.

- [ ] Phase B workflows activated and stable
- [ ] Incoming DMs appear in /inbox with intent classification
- [ ] Lead scores auto-calculated and visible in /leads
- [ ] Draft replies visible in /approvals (not sent until Ricardo approves)

---

## v1.3 — Campaign Analytics

**Goal:** Ads metrics visible in dashboard, weekly reports running.

- [ ] Ads Read Only Reporter activated
- [ ] /campaigns shows real Meta Ads data
- [ ] Weekly Brand Report workflow active
- [ ] campaign-analyst agent integrated into report generation

### Adding New Products

New client products are onboarded via the Product Registry — no roadmap item needed:
1. Create `brands/<slug>/brand-config.json`
2. Insert row in Supabase `brands` table
3. Run `node scripts/run-offline-audit.js`
4. Follow `docs/product-onboarding-model.md`

---

## v2 — Multi-Agent Orchestration

**Goal:** Agents coordinate, system learns, ROI visible.

- [ ] learning-agent captures patterns from approved vs rejected suggestions
- [ ] lead-scoring improves from outcome data in Supabase
- [ ] Brand-specific tone calibration for copy-conversion
- [ ] A/B testing infrastructure for copy variants
- [ ] WhatsApp integration for DRIVIP and Ana (after Meta review)

---

## Not in Scope (by design)

- Auto-sending messages without human approval — **never**
- Auto-modifying ad campaigns — **never**
- Scraping competitor accounts — **never**
- Cold DMs — **never**
- DRIVIP Booking Operations automation — **excluded per Ricardo**
- WhatsApp Business API without explicit Meta App Review — **excluded**
