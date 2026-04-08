import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menuItems = [
  { label: 'Validações', to: '/admin/validacoes', icon: '✓' },
  { label: 'Denúncias', to: '/admin/denuncias', icon: '⚑' },
  { label: 'Usuários', to: '/admin/usuarios', icon: '👤' },
]

export const AdminLayout = () => {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = usuario?.nome
    ? usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <>
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f5f3fa;
        }
        .admin-sidebar {
          width: ${collapsed ? '70px' : '220px'};
          min-height: 100vh;
          background: #B6A0C8;
          display: flex;
          flex-direction: column;
          transition: width 0.2s ease;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .sidebar-header {
          padding: ${collapsed ? '24px 0' : '24px 20px'};
          display: flex;
          align-items: center;
          justify-content: ${collapsed ? 'center' : 'space-between'};
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-logo {
          font-size: 18px;
          font-weight: 900;
          color: #fff;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          opacity: ${collapsed ? 0 : 1};
          width: ${collapsed ? 0 : 'auto'};
          transition: opacity 0.15s;
        }
        .sidebar-collapse-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          color: #fff;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .sidebar-collapse-btn:hover { background: rgba(255,255,255,0.25); }
        .sidebar-nav {
          flex: 1;
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sidebar-nav a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: ${collapsed ? '12px 0' : '12px 20px'};
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          border-radius: 0;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          overflow: hidden;
        }
        .sidebar-nav a:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .sidebar-nav a.active {
          background: rgba(255,255,255,0.18);
          color: #fff;
          border-right: 3px solid #fff;
        }
        .sidebar-nav a .nav-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
        .sidebar-nav a .nav-label {
          opacity: ${collapsed ? 0 : 1};
          width: ${collapsed ? 0 : 'auto'};
          transition: opacity 0.15s;
          overflow: hidden;
        }
        .sidebar-footer {
          padding: ${collapsed ? '16px 0' : '16px 20px'};
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
        }
        .sidebar-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sidebar-user-info {
          overflow: hidden;
          opacity: ${collapsed ? 0 : 1};
          width: ${collapsed ? 0 : 'auto'};
          transition: opacity 0.15s;
          flex: 1;
        }
        .sidebar-user-name {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-logout {
          background: none;
          border: none;
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          padding: 0;
          text-align: left;
          transition: color 0.15s;
        }
        .sidebar-logout:hover { color: #fff; }
        .admin-main {
          flex: 1;
          padding: 32px 40px;
          overflow-y: auto;
        }
      `}</style>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-logo">PawAdoption</span>
            <button
              className="sidebar-collapse-btn"
              onClick={() => setCollapsed(v => !v)}
              title={collapsed ? 'Expandir' : 'Recolher'}
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map(item => (
              <NavLink key={item.to} to={item.to}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{usuario?.nome}</div>
              <button className="sidebar-logout" onClick={handleLogout}>Sair</button>
            </div>
          </div>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </>
  )
}