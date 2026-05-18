import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// ─── Itens do menu ────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { label: 'Validações', to: '/admin/validacoes', icon: '✓' },
  { label: 'Denúncias',  to: '/admin/denuncias',  icon: '⚑' },
  { label: 'Usuários',   to: '/admin/usuarios',   icon: '👤' },
]

// ─── Estilos ──────────────────────────────────────────────────────────────────

const CSS = `
  .al-layout {
    display: flex;
    min-height: 100vh;
    font-family: 'Nunito', system-ui, sans-serif;
  }

  /* ── Sidebar ── */
  .al-sidebar {
    width: 240px;
    min-height: 100vh;
    background: var(--paper);
    border-right: 1.5px solid var(--line);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    flex-shrink: 0;
    transition: width 0.2s ease;
    z-index: 20;
  }

  .al-sidebar--collapsed {
    width: 68px;
  }

  /* ── Cabeçalho da sidebar ── */
  .al-sidebar-header {
    height: 68px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1.5px solid var(--line);
    flex-shrink: 0;
    gap: 10px;
    overflow: hidden;
  }

  .al-sidebar--collapsed .al-sidebar-header {
    padding: 0;
    justify-content: center;
  }

  .al-logo {
    display: flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
    overflow: hidden;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .al-logo-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--blue);
    display: grid;
    place-items: center;
    font-size: 16px;
    box-shadow: 0 3px 0 var(--blue-700);
    transform: rotate(-6deg);
    flex-shrink: 0;
  }

  .al-logo-text {
    font-family: 'Baloo 2', system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: var(--ink);
    letter-spacing: -0.02em;
    transition: opacity 0.15s, width 0.2s;
    overflow: hidden;
  }

  .al-logo-text span { color: var(--orange); }

  .al-sidebar--collapsed .al-logo-text {
    opacity: 0;
    width: 0;
  }

  .al-collapse-btn {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1.5px solid var(--line);
    background: var(--cream);
    color: var(--ink-2);
    font-size: 12px;
    cursor: pointer;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }

  .al-collapse-btn:hover {
    background: var(--blue-50);
    border-color: var(--blue-100);
    color: var(--blue);
  }

  .al-sidebar--collapsed .al-collapse-btn {
    margin: 0 auto;
  }

  /* ── Badge admin ── */
  .al-admin-badge {
    margin: 12px 16px 4px;
    padding: 4px 10px;
    background: var(--blue-50);
    border: 1.5px solid var(--blue-100);
    border-radius: 8px;
    font-size: 0.68rem;
    font-weight: 800;
    color: var(--blue);
    letter-spacing: .06em;
    text-transform: uppercase;
    text-align: center;
    transition: opacity 0.15s;
    overflow: hidden;
    white-space: nowrap;
  }

  .al-sidebar--collapsed .al-admin-badge {
    opacity: 0;
    margin: 0;
    padding: 0;
    height: 0;
    border: none;
  }

  /* ── Navegação ── */
  .al-nav {
    flex: 1;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .al-nav-link {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
    border-radius: 12px;
    text-decoration: none;
    color: var(--ink-2);
    font-size: 0.88rem;
    font-weight: 700;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
  }

  .al-nav-link:hover {
    background: var(--blue-50);
    color: var(--blue);
  }

  .al-nav-link.active {
    background: var(--blue-50);
    color: var(--blue);
  }

  .al-nav-link.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--blue);
  }

  .al-nav-icon {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: var(--cream);
    border: 1.5px solid var(--line);
    display: grid;
    place-items: center;
    font-size: 14px;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s;
  }

  .al-nav-link:hover .al-nav-icon,
  .al-nav-link.active .al-nav-icon {
    background: var(--blue-100);
    border-color: var(--blue-100);
  }

  .al-nav-label {
    transition: opacity 0.15s, width 0.2s;
    overflow: hidden;
  }

  .al-sidebar--collapsed .al-nav-label {
    opacity: 0;
    width: 0;
  }

  .al-sidebar--collapsed .al-nav-link {
    padding: 10px;
    justify-content: center;
  }

  /* ── Divisor ── */
  .al-divider {
    height: 1.5px;
    background: var(--line);
    margin: 0 10px;
  }

  /* ── Footer da sidebar ── */
  .al-sidebar-footer {
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* Botão de tema */
  .al-theme-btn {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
    border-radius: 12px;
    border: none;
    background: none;
    color: var(--ink-2);
    font-family: 'Nunito', system-ui, sans-serif;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    transition: background 0.15s, color 0.15s;
  }

  .al-theme-btn:hover {
    background: var(--cream);
    color: var(--ink);
  }

  .al-sidebar--collapsed .al-theme-btn {
    padding: 10px;
    justify-content: center;
  }

  /* Usuário */
  .al-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    overflow: hidden;
    cursor: default;
  }

  .al-avatar {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--blue);
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }

  .al-user-info {
    flex: 1;
    overflow: hidden;
    transition: opacity 0.15s, width 0.2s;
  }

  .al-sidebar--collapsed .al-user-info {
    opacity: 0;
    width: 0;
  }

  .al-user-name {
    font-size: 0.82rem;
    font-weight: 800;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .al-logout-btn {
    background: none;
    border: none;
    font-family: 'Nunito', system-ui, sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--ink-3);
    cursor: pointer;
    padding: 0;
    text-align: left;
    transition: color 0.15s;
    display: block;
  }

  .al-logout-btn:hover { color: var(--orange); }

  /* ── Main ── */
  .al-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  /* Topbar */
  .al-topbar {
    height: 68px;
    padding: 0 32px;
    background: var(--paper);
    border-bottom: 1.5px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
    gap: 16px;
  }

  .al-topbar-title {
    font-family: 'Baloo 2', system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .al-topbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .al-topbar-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    background: var(--blue-50);
    border: 1.5px solid var(--blue-100);
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--blue);
    letter-spacing: .04em;
  }

  /* Conteúdo */
  .al-content {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
  }

  /* ── Responsivo ── */
  @media (max-width: 768px) {
    .al-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 100;
      transform: translateX(-100%);
      transition: transform 0.25s ease, width 0.2s ease;
      box-shadow: 4px 0 24px rgba(0,0,0,0.12);
    }

    .al-sidebar--mobile-open {
      transform: translateX(0);
    }

    .al-topbar {
      padding: 0 20px;
    }

    .al-content {
      padding: 20px 16px;
    }

    .al-mobile-btn {
      display: grid !important;
    }
  }

  .al-mobile-btn {
    display: none;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1.5px solid var(--line);
    background: var(--cream);
    color: var(--ink);
    font-size: 16px;
    cursor: pointer;
    place-items: center;
  }

  .al-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 90;
  }

  @media (max-width: 768px) {
    .al-overlay--show { display: block; }
  }
`

// ─── Mapa de rótulos para a topbar ───────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  '/admin/validacoes': 'Validações de animais',
  '/admin/denuncias':  'Denúncias',
  '/admin/usuarios':   'Usuários',
}

// ─── Componente ──────────────────────────────────────────────────────────────

export const AdminLayout = () => {
  const { usuario, logout }     = useAuth()
  const { theme, toggleTheme }  = useTheme()
  const navigate                = useNavigate()
  const location                = useLocation()

  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = usuario?.nome
    ? usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'AD'

  const pageTitle = ROUTE_LABELS[location.pathname] ?? 'Admin'

  const sidebarClass = [
    'al-sidebar',
    collapsed  ? 'al-sidebar--collapsed'    : '',
    mobileOpen ? 'al-sidebar--mobile-open'  : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <style>{CSS}</style>

      {/* Overlay mobile */}
      <div
        className={`al-overlay${mobileOpen ? ' al-overlay--show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className="al-layout">

        {/* ── Sidebar ── */}
        <aside className={sidebarClass}>

          {/* Header */}
          <div className="al-sidebar-header">
            <a className="al-logo" href="/admin">
              <div className="al-logo-icon">🐾</div>
              <span className="al-logo-text">Paw<span>Adoption</span></span>
            </a>
            <button
              className="al-collapse-btn"
              onClick={() => setCollapsed(v => !v)}
              title={collapsed ? 'Expandir' : 'Recolher'}
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>

          {/* Badge */}
          <div className="al-admin-badge">⚙ Painel Admin</div>

          {/* Nav */}
          <nav className="al-nav">
            {MENU_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `al-nav-link${isActive ? ' active' : ''}`
                }
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <span className="al-nav-icon">{item.icon}</span>
                <span className="al-nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="al-divider" />
          <div className="al-sidebar-footer">

            {/* Toggle tema */}
            <button
              className="al-theme-btn"
              onClick={toggleTheme}
              title={collapsed ? (theme === 'dark' ? 'Modo claro' : 'Modo escuro') : undefined}
            >
              <span className="al-nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span className="al-nav-label">
                {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              </span>
            </button>

            {/* Usuário */}
            <div className="al-user">
              <div className="al-avatar">{initials}</div>
              <div className="al-user-info">
                <div className="al-user-name">{usuario?.nome}</div>
                <button className="al-logout-btn" onClick={handleLogout}>
                  Sair da conta
                </button>
              </div>
            </div>

          </div>
        </aside>

        {/* ── Main ── */}
        <div className="al-main">

          {/* Topbar */}
          <header className="al-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Botão hamburguer — só mobile */}
              <button
                className="al-mobile-btn"
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Abrir menu"
              >
                ☰
              </button>
              <span className="al-topbar-title">{pageTitle}</span>
            </div>

            <div className="al-topbar-right">
              <span className="al-topbar-chip">
                ⚙ Admin
              </span>
            </div>
          </header>

          {/* Conteúdo da rota */}
          <main className="al-content">
            <Outlet />
          </main>
        </div>

      </div>
    </>
  )
}