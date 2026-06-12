import { BRANDS, PENDING_APPROVALS, RECENT_LEADS, INBOX_MESSAGES, SYSTEM_STATUS } from '@/lib/mock-data'

export default function DashboardPage() {
  const hotLeads = RECENT_LEADS.filter(l => l.temperature === 'hot').length
  const pendingCount = PENDING_APPROVALS.filter(a => a.status === 'pending').length
  const unreadMessages = INBOX_MESSAGES.filter(m => m.requires_human).length

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>Panel de Control</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>
          Sistema WEDO Meta OS — {SYSTEM_STATUS.mode.toUpperCase()} MODE
        </p>
      </div>

      {/* Status strip */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Supabase', ok: SYSTEM_STATUS.supabase_connected },
          { label: 'n8n', ok: SYSTEM_STATUS.n8n_connected },
          { label: 'Meta API', ok: SYSTEM_STATUS.meta_connected },
        ].map(s => (
          <span key={s.label} style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 99,
            background: s.ok ? '#064e3b' : '#1c1c1c',
            color: s.ok ? '#6ee7b7' : '#555',
            border: `1px solid ${s.ok ? '#065f46' : '#2a2a2a'}`,
          }}>
            {s.ok ? '✓' : '○'} {s.label}
          </span>
        ))}
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Marcas activas', value: BRANDS.filter(b => b.active).length, color: '#818cf8' },
          { label: 'Aprobaciones pendientes', value: pendingCount, color: pendingCount > 0 ? '#f87171' : '#6ee7b7' },
          { label: 'Leads calientes', value: hotLeads, color: '#fb923c' },
          { label: 'Mensajes con revisión', value: unreadMessages, color: '#facc15' },
        ].map(card => (
          <div key={card.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '20px 16px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#ddd', marginBottom: 12 }}>Aprobaciones pendientes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PENDING_APPROVALS.map(ap => (
            <div key={ap.id} style={{ background: '#1a1a1a', border: `1px solid ${ap.risk_level === 'high' ? '#7f1d1d' : '#2a2a2a'}`, borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: ap.risk_level === 'high' ? '#7f1d1d' : '#1e3a2f', color: ap.risk_level === 'high' ? '#fca5a5' : '#6ee7b7' }}>
                {ap.risk_level.toUpperCase()}
              </span>
              <span style={{ fontSize: 12, color: '#888', minWidth: 120 }}>{ap.brand_name}</span>
              <span style={{ fontSize: 13, color: '#ccc', flex: 1 }}>{ap.reason}</span>
              <span style={{ fontSize: 11, color: '#555' }}>{ap.action_type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent leads */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#ddd', marginBottom: 12 }}>Leads recientes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RECENT_LEADS.map(lead => (
            <div key={lead.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: lead.temperature === 'hot' ? '#7c2d12' : lead.temperature === 'warm' ? '#451a03' : '#1c1c1c', color: lead.temperature === 'hot' ? '#fb923c' : lead.temperature === 'warm' ? '#fcd34d' : '#666' }}>
                {lead.temperature.toUpperCase()}
              </span>
              <span style={{ fontSize: 13, color: '#ccc', minWidth: 140 }}>{lead.contact}</span>
              <span style={{ fontSize: 12, color: '#888', flex: 1 }}>{lead.intent}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: lead.score >= 75 ? '#fb923c' : lead.score >= 40 ? '#facc15' : '#666' }}>{lead.score}pts</span>
              <span style={{ fontSize: 11, color: '#555' }}>{lead.channel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
