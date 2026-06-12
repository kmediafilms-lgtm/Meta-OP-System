import { PENDING_APPROVALS } from '@/lib/mock-data'

const RISK_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: '#7f1d1d', text: '#fca5a5', border: '#991b1b' },
  medium: { bg: '#451a03', text: '#fcd34d', border: '#78350f' },
  low:    { bg: '#1c1c1c', text: '#6ee7b7', border: '#2a2a2a' },
}

const ACTION_LABELS: Record<string, string> = {
  message_reply: 'Respuesta de mensaje',
  campaign_change: 'Cambio de campaña',
  lead_followup: 'Seguimiento de lead',
}

export default function ApprovalsPage() {
  const pending = PENDING_APPROVALS.filter(a => a.status === 'pending')
  const highRisk = pending.filter(a => a.risk_level === 'high')

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>Aprobaciones</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>
          {pending.length} pendientes · {highRisk.length} de alto riesgo
        </p>
      </div>

      {highRisk.length > 0 && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#1c0505', border: '1px solid #7f1d1d', borderRadius: 8, fontSize: 13, color: '#fca5a5' }}>
          ⚠ {highRisk.length} acción(es) de alto riesgo requieren revisión inmediata
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PENDING_APPROVALS.map(ap => {
          const rs = RISK_STYLE[ap.risk_level] ?? RISK_STYLE.low
          return (
            <div key={ap.id} style={{ background: '#1a1a1a', border: `1px solid ${rs.border}`, borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: rs.bg, color: rs.text, fontWeight: 600 }}>
                    {ap.risk_level.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{ap.brand_name}</span>
                  <span style={{ fontSize: 12, color: '#666' }}>{ACTION_LABELS[ap.action_type] ?? ap.action_type}</span>
                </div>
                <span style={{ fontSize: 11, color: '#555' }}>{new Date(ap.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>{ap.reason}</p>

              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ fontSize: 12, padding: '6px 16px', borderRadius: 6, background: '#064e3b', color: '#6ee7b7', border: '1px solid #065f46', cursor: 'pointer' }}>
                  ✓ Aprobar
                </button>
                <button style={{ fontSize: 12, padding: '6px 16px', borderRadius: 6, background: '#1c1c1c', color: '#f87171', border: '1px solid #7f1d1d', cursor: 'pointer' }}>
                  ✕ Rechazar
                </button>
                <button style={{ fontSize: 12, padding: '6px 16px', borderRadius: 6, background: '#1c1c1c', color: '#aaa', border: '1px solid #2a2a2a', cursor: 'pointer' }}>
                  Ver detalle
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, padding: '12px 16px', background: '#111', borderRadius: 8, border: '1px solid #1e1e1e', fontSize: 12, color: '#444' }}>
        MOCK MODE — Los botones no ejecutan acciones reales. El flujo de aprobación real requiere integración Supabase + n8n.
      </div>
    </div>
  )
}
