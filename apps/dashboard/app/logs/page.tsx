import { SYSTEM_LOGS, SYSTEM_STATUS } from '@/lib/mock-data'

export default function LogsPage() {
  const errors = SYSTEM_LOGS.filter(l => l.error)
  const processed = SYSTEM_LOGS.filter(l => l.processed)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>Logs del Sistema</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>
          {processed.length} procesados · {errors.length} errores
        </p>
      </div>

      {/* System status */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 12 }}>Estado del Sistema</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Modo', value: SYSTEM_STATUS.mode.toUpperCase(), color: '#facc15' },
            { label: 'Supabase', value: SYSTEM_STATUS.supabase_connected ? 'Conectado' : 'No conectado', color: SYSTEM_STATUS.supabase_connected ? '#6ee7b7' : '#f87171' },
            { label: 'n8n', value: SYSTEM_STATUS.n8n_connected ? 'Conectado' : 'No conectado', color: SYSTEM_STATUS.n8n_connected ? '#6ee7b7' : '#f87171' },
            { label: 'Meta API', value: SYSTEM_STATUS.meta_connected ? 'Conectado' : 'No conectado', color: SYSTEM_STATUS.meta_connected ? '#6ee7b7' : '#f87171' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 11, color: '#555' }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: s.color, marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Log entries */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, overflow: 'hidden', fontFamily: 'monospace' }}>
        <div style={{ padding: '10px 16px', background: '#161616', borderBottom: '1px solid #1e1e1e', display: 'grid', gridTemplateColumns: '160px 80px 120px 140px 1fr', gap: 12 }}>
          {['Timestamp', 'Status', 'Marca', 'Evento', 'Detalles'].map(h => (
            <span key={h} style={{ fontSize: 10, color: '#444', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
          ))}
        </div>
        {SYSTEM_LOGS.map((log, i) => (
          <div key={log.id} style={{
            padding: '12px 16px',
            borderBottom: i < SYSTEM_LOGS.length - 1 ? '1px solid #1a1a1a' : 'none',
            display: 'grid',
            gridTemplateColumns: '160px 80px 120px 140px 1fr',
            gap: 12,
            alignItems: 'center',
            background: log.error ? '#1a0505' : 'transparent',
          }}>
            <span style={{ fontSize: 11, color: '#555' }}>
              {new Date(log.created_at).toLocaleString('es', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4, textAlign: 'center',
              background: log.processed ? '#064e3b' : log.error ? '#7f1d1d' : '#1c1c1c',
              color: log.processed ? '#6ee7b7' : log.error ? '#fca5a5' : '#666',
            }}>
              {log.processed ? 'OK' : log.error ? 'ERR' : 'SKIP'}
            </span>
            <span style={{ fontSize: 11, color: log.brand_id ? '#93c5fd' : '#555' }}>
              {log.brand_id ?? '—'}
            </span>
            <span style={{ fontSize: 11, color: '#888' }}>{log.event_type}</span>
            <span style={{ fontSize: 11, color: log.error ? '#fca5a5' : '#555' }}>
              {log.error ? `Error: ${log.error}` : `method: ${log.routing_method}`}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: '#444' }}>
        {SYSTEM_LOGS.length} entradas — Datos mock. Los logs reales vienen de la tabla events_log en Supabase.
      </div>
    </div>
  )
}
