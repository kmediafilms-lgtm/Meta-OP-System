import { BRANDS } from '@/lib/mock-data'

const CHANNEL_ICONS: Record<string, string> = {
  instagram: 'IG',
  facebook: 'FB',
  whatsapp: 'WA',
  ads: 'ADS',
}

const CHANNEL_COLOR: Record<string, { bg: string; text: string }> = {
  instagram: { bg: '#4c1d95', text: '#c4b5fd' },
  facebook:  { bg: '#1e3a5f', text: '#93c5fd' },
  whatsapp:  { bg: '#064e3b', text: '#6ee7b7' },
  ads:       { bg: '#451a03', text: '#fcd34d' },
}

export default function BrandsPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>Marcas</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>
          {BRANDS.filter(b => b.active).length} marcas activas en el sistema WEDO Meta OS
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {BRANDS.map(brand => (
          <div key={brand.brand_id} style={{ background: '#1a1a1a', border: `1px solid ${brand.active ? '#2a2a2a' : '#1e1e1e'}`, borderRadius: 10, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{brand.brand_name}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2, fontFamily: 'monospace' }}>{brand.brand_id}</div>
              </div>
              <span style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 99,
                background: brand.active ? '#064e3b' : '#1c1c1c',
                color: brand.active ? '#6ee7b7' : '#555',
                border: `1px solid ${brand.active ? '#065f46' : '#2a2a2a'}`,
                fontWeight: 600,
              }}>
                {brand.active ? 'ACTIVA' : 'INACTIVA'}
              </span>
            </div>

            <div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Canales</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {brand.channels.map(ch => {
                  const cs = CHANNEL_COLOR[ch] ?? { bg: '#1c1c1c', text: '#666' }
                  return (
                    <span key={ch} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: cs.bg, color: cs.text, fontWeight: 600 }}>
                      {CHANNEL_ICONS[ch] ?? ch.toUpperCase()}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '20px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#888' }}>Estructura de separación</h3>
        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8 }}>
          <div>• Cada marca tiene brand_id único en Supabase</div>
          <div>• Todos los mensajes, leads y campañas tienen brand_id requerido</div>
          <div>• Los agents filtran por brand_id en cada operación</div>
          <div>• Los workflows n8n tienen rutas separadas por marca</div>
          <div>• Ningún dato cruza entre marcas</div>
        </div>
      </div>
    </div>
  )
}
