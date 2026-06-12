import { CAMPAIGN_METRICS } from '@/lib/mock-data'

function CtrBar({ ctr }: { ctr: number }) {
  const pct = Math.min(ctr / 5, 1) * 100
  const color = ctr >= 2 ? '#6ee7b7' : ctr >= 1 ? '#facc15' : '#f87171'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, background: '#111', borderRadius: 99, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, color, minWidth: 40, textAlign: 'right' }}>{ctr}%</span>
    </div>
  )
}

export default function CampaignsPage() {
  const totalSpend = CAMPAIGN_METRICS.reduce((s, c) => s + c.spend, 0)
  const totalLeads = CAMPAIGN_METRICS.reduce((s, c) => s + c.leads, 0)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>Campañas</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>
          Métricas solo lectura — no se modifican campañas desde este panel
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Gasto total', value: `$${totalSpend}`, color: '#818cf8' },
          { label: 'Leads totales', value: totalLeads, color: '#6ee7b7' },
          { label: 'Campañas activas', value: CAMPAIGN_METRICS.length, color: '#facc15' },
        ].map(c => (
          <div key={c.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '18px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Campaign cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {CAMPAIGN_METRICS.map(c => (
          <div key={`${c.brand_id}-${c.campaign}`} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{c.campaign}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{c.brand_name}</div>
              </div>
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, background: '#064e3b', color: '#6ee7b7', border: '1px solid #065f46' }}>
                Activa
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Gasto', value: `$${c.spend}` },
                { label: 'Impresiones', value: c.impressions.toLocaleString() },
                { label: 'Leads', value: c.leads },
                { label: 'Calificados', value: c.qualified },
                { label: 'Reservas', value: c.bookings },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#e5e5e5' }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>CTR</div>
              <CtrBar ctr={c.ctr} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: '12px 16px', background: '#111', borderRadius: 8, border: '1px solid #1e1e1e', fontSize: 12, color: '#444' }}>
        READ ONLY — campaign-analyst-agent genera recomendaciones, nunca ejecuta cambios. Aprobación humana requerida.
      </div>
    </div>
  )
}
