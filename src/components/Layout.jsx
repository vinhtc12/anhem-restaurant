import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/', icon: '🧾', label: 'Hóa Đơn' },
  { to: '/new', icon: '＋', label: 'Tạo Hóa Đơn' },
  { to: '/menu', icon: '🍜', label: 'Quản Lý Món' },
]

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'Playfair Display', fontWeight: 900, fontSize: '1.3rem', color: 'var(--gold)', lineHeight: 1.1 }}>
            Quán Ăn
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: 4, letterSpacing: 2 }}>
            QUẢN LÝ HÓA ĐƠN
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 10px' }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius)',
              textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
              marginBottom: 4, transition: 'var(--transition)',
              background: isActive ? 'var(--gold-dim)' : 'transparent',
              color: isActive ? 'var(--gold)' : 'var(--text2)',
              borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
            })}>
              <span style={{ fontSize: '1rem' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text3)' }}>
          v1.0.0 · Supabase
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {children}
      </main>
    </div>
  )
}
