import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WEDO Meta OS',
  description: 'Control Plane — WEDO Meta Operating System',
}

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/inbox', label: 'Inbox' },
  { href: '/leads', label: 'Leads' },
  { href: '/approvals', label: 'Approvals' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/brands', label: 'Brands' },
  { href: '/logs', label: 'Logs' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0f0f0f', color: '#e5e5e5' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          <nav style={{ width: 220, background: '#1a1a1a', padding: '24px 16px', borderRight: '1px solid #2a2a2a', flexShrink: 0 }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>WEDO META OS</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Control Plane v1 — MOCK MODE</div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {NAV_LINKS.map(link => (
                <li key={link.href} style={{ marginBottom: 4 }}>
                  <a
                    href={link.href}
                    style={{ display: 'block', padding: '8px 12px', borderRadius: 6, color: '#aaa', textDecoration: 'none', fontSize: 14 }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 'auto', paddingTop: 32, fontSize: 11, color: '#444' }}>
              ⚠️ SAFE MODE<br />No live connections
            </div>
          </nav>
          {/* Main */}
          <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
