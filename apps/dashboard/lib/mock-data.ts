// WEDO Meta OS — Mock Data — SAFE MODE / READ ONLY
// Used until Supabase credentials are configured.
// Replace with real Supabase queries once SUPABASE_URL and keys are set.

export const BRANDS = [
  { brand_id: 'kmediafilms', brand_name: 'KMediaFilms', active: true, channels: ['instagram', 'facebook'] },
  { brand_id: 'ana', brand_name: 'En la Galería de Ana', active: true, channels: ['instagram', 'facebook', 'whatsapp', 'ads'] },
  { brand_id: 'drivip', brand_name: 'DRIVIP', active: true, channels: ['instagram', 'facebook', 'whatsapp', 'ads'] },
  { brand_id: 'jardinero-davis', brand_name: 'Jardinero Davis', active: true, channels: ['instagram', 'facebook'] },
  { brand_id: 'fc-guia-panama', brand_name: 'FC Guía Panamá', active: true, channels: ['instagram', 'facebook', 'whatsapp'] },
]

export const PENDING_APPROVALS = [
  { id: 'ap-001', brand_id: 'ana', brand_name: 'En la Galería de Ana', action_type: 'message_reply', risk_level: 'high', reason: 'Cliente caliente con fecha de boda — cotización requerida', status: 'pending', created_at: '2026-06-12T18:30:00Z' },
  { id: 'ap-002', brand_id: 'drivip', brand_name: 'DRIVIP', action_type: 'message_reply', risk_level: 'medium', reason: 'Traslado aeropuerto — confirmar disponibilidad', status: 'pending', created_at: '2026-06-12T17:45:00Z' },
  { id: 'ap-003', brand_id: 'kmediafilms', brand_name: 'KMediaFilms', action_type: 'campaign_change', risk_level: 'high', reason: 'CTR bajo en campaña — recomendación de pausa para revisión', status: 'pending', created_at: '2026-06-12T16:00:00Z' },
]

export const RECENT_LEADS = [
  { id: 'lead-001', brand_id: 'ana', contact: 'María González', intent: 'paquetes_boda', score: 88, temperature: 'hot', status: 'new', channel: 'instagram', created_at: '2026-06-12T19:00:00Z' },
  { id: 'lead-002', brand_id: 'drivip', contact: 'Carlos Martínez', intent: 'traslado', score: 72, temperature: 'warm', status: 'contacted', channel: 'instagram', created_at: '2026-06-12T18:00:00Z' },
  { id: 'lead-003', brand_id: 'kmediafilms', contact: 'Empresa ABC', intent: 'video_corporativo', score: 55, temperature: 'warm', status: 'new', channel: 'instagram', created_at: '2026-06-12T17:00:00Z' },
  { id: 'lead-004', brand_id: 'ana', contact: 'Laura Pérez', intent: 'precio', score: 30, temperature: 'cold', status: 'new', channel: 'instagram', created_at: '2026-06-12T16:00:00Z' },
]

export const INBOX_MESSAGES = [
  { id: 'msg-001', brand_id: 'ana', brand_name: 'Ana', sender: 'María González', text: 'Hola, quiero información para mi boda en noviembre', intent: 'paquetes_boda', requires_human: true, channel: 'instagram', created_at: '2026-06-12T19:00:00Z' },
  { id: 'msg-002', brand_id: 'drivip', brand_name: 'DRIVIP', sender: 'Carlos M.', text: 'Necesito traslado al aeropuerto mañana a las 6am', intent: 'traslado', requires_human: true, channel: 'instagram', created_at: '2026-06-12T18:30:00Z' },
  { id: 'msg-003', brand_id: 'kmediafilms', brand_name: 'KMediaFilms', sender: 'Empresa XYZ', text: 'Cuánto cuesta un video corporativo', intent: 'video_corporativo', requires_human: false, channel: 'instagram', created_at: '2026-06-12T18:00:00Z' },
]

export const CAMPAIGN_METRICS = [
  { brand_id: 'ana', brand_name: 'Ana', campaign: 'Bodas Nov 2026', spend: 200, impressions: 15000, ctr: 2.8, leads: 10, qualified: 1, bookings: 0 },
  { brand_id: 'drivip', brand_name: 'DRIVIP', campaign: 'Traslados Q2', spend: 450, impressions: 22000, ctr: 1.2, leads: 18, qualified: 12, bookings: 6 },
]

export const SYSTEM_LOGS = [
  { id: 'log-001', brand_id: 'ana', event_type: 'instagram_dm', routing_method: 'ig_id_match', processed: true, created_at: '2026-06-12T19:00:00Z' },
  { id: 'log-002', brand_id: 'drivip', event_type: 'instagram_dm', routing_method: 'ig_id_match', processed: true, created_at: '2026-06-12T18:30:00Z' },
  { id: 'log-003', brand_id: null, event_type: 'instagram_dm', routing_method: 'no_match', processed: false, error: 'unidentified_brand', created_at: '2026-06-12T17:00:00Z' },
]

export const SYSTEM_STATUS = {
  mode: 'mock',
  supabase_connected: false,
  n8n_connected: false,
  meta_connected: false,
  last_updated: '2026-06-12T19:00:00Z',
}
