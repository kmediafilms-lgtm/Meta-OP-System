import { RECENT_LEADS } from '@/lib/mock-data'

const TEMP_COLOR: Record<string, { bg: string; text: string }> = {
  hot:  { bg: '#7c2d12', text: '#fb923c' },
  warm: { bg: '#451a03', text: '#fcd34d' },
  cold: { bg: '#1c1c1c', text: '#666' },
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Calificado',
  closed: 'Cerrado',
}

export default function LeadsPage() {
  const hot  = RECENT_LEADS.filter(l => l.temperature === 'hot').length
  const warm = RECENT_LEADS.filter(l => l.temperature === 'warm').length
  const cold = RECENT_LEADS.filter(l => l.temperature === 'cold').length

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>Leads</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>
          Clasificados por temperatura y puntaje de scoring
        </p>
      </div>

      {/* Temp summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Calientes', count: hot, ...TEMP_COLOR.hot },
          { label: 'Tibios', count: warm, ...TEMP_COLOR.warm },
          { label: 'Fríos', count: cold, ...TEMP_COLOR.cold },
        ].map(t => (
          <div key={t.label} style={{ background: t.bg, border: `1px solid ${t.text}22`, borderRadius: 8, padding: '16px 20px', minWidth: 100 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: t.text }}>{t.count}</div>
            <div style={{ fontSize: 12, color: t.text, opacity: 0.8 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
              {['Contacto', 'Marca', 'Intención', 'Score', 'Temp.', 'Estado', 'Canal'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_LEADS.map((lead, i) => {
              const tc = TEMP_COLOR[lead.temperature]
              return (
                <tr key={lead.id} style={{ borderBottom: i < RECENT_LEADS.length - 1 ? '1px solid #222' : 'none' }}>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#e5e5e5', fontWeight: 500 }}>{lead.contact}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#888' }}>{lead.brand_id}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#93c5fd' }}>{lead.intent}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: tc.text }}>{lead.score}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: tc.bg, color: tc.text }}>
                      {lead.temperature.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#aaa' }}>{STATUS_LABEL[lead.status] ?? lead.status}</td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: '#555' }}>{lead.channel}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: '#444' }}>
        Scoring: hot ≥75 · warm ≥40 · cold &lt;40 — powered by lead-scoring-agent (mock)
      </div>
    </div>
  )
}
