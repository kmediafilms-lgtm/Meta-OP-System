import { INBOX_MESSAGES } from '@/lib/mock-data'

const INTENT_LABELS: Record<string, string> = {
  paquetes_boda: 'Boda',
  traslado: 'Traslado',
  video_corporativo: 'Video Corp.',
  precio: 'Precio',
  tour_inquiry: 'Tour',
  jardineria_inquiry: 'Jardinería',
}

export default function InboxPage() {
  const requiresHuman = INBOX_MESSAGES.filter(m => m.requires_human)
  const automated = INBOX_MESSAGES.filter(m => !m.requires_human)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>Bandeja de Entrada</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>
          {requiresHuman.length} requieren revisión humana · {automated.length} automatizables
        </p>
      </div>

      <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
        <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b' }}>
          ⚠ Revisión humana: {requiresHuman.length}
        </span>
        <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: '#1a1a1a', color: '#555', border: '1px solid #2a2a2a' }}>
          Auto: {automated.length}
        </span>
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {INBOX_MESSAGES.map(msg => (
          <div key={msg.id} style={{
            background: '#1a1a1a',
            border: `1px solid ${msg.requires_human ? '#7f1d1d' : '#2a2a2a'}`,
            borderRadius: 10,
            padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{msg.sender}</span>
                <span style={{ fontSize: 11, color: '#555' }}>via {msg.channel} · {msg.brand_name}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#1e3a5f', color: '#93c5fd' }}>
                  {INTENT_LABELS[msg.intent] ?? msg.intent}
                </span>
                {msg.requires_human && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#7f1d1d', color: '#fca5a5' }}>
                    Revisión
                  </span>
                )}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>{msg.text}</p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, background: '#1e3a5f', color: '#93c5fd', border: '1px solid #1d4ed8', cursor: 'pointer' }}>
                Ver contexto
              </button>
              {msg.requires_human && (
                <button style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, background: '#064e3b', color: '#6ee7b7', border: '1px solid #065f46', cursor: 'pointer' }}>
                  Aprobar respuesta
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: '12px 16px', background: '#111', borderRadius: 8, border: '1px solid #1e1e1e', fontSize: 12, color: '#444' }}>
        MOCK MODE — Las respuestas no se envían. Todas las acciones requieren aprobación humana.
      </div>
    </div>
  )
}
