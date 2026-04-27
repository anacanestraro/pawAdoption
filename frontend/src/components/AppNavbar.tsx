/**
 * AppNavbar.tsx
 * Navbar reutilizável no design system v2 (Baloo 2 + CSS vars).
 *
 * Uso básico (links automáticos por tipo de usuário):
 *   <AppNavbar />
 *
 * Uso com links customizados:
 *   <AppNavbar links={[{ label: 'Animais', to: '/home' }]} />
 *
 * Uso com tema escuro:
 *   <AppNavbar theme="dark" />
 */

import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

interface NavLink {
  label: string
  to: string
}

interface AppNavbarProps {
  links?: NavLink[]
  lang?: string
  setLang?: (l: string) => void
}

const LINKS_ADOTANTE: NavLink[] = [
  { label: 'Animais',      to: '/home' },
  { label: 'Contate-nos',  to: '/contato' },
  { label: 'Sobre',        to: '/sobre' },
]

const LINKS_ABRIGO: NavLink[] = [
  { label: 'Meus animais',  to: '/home/animais' },
  { label: 'Voluntários',   to: '/home/voluntarios' },
  { label: 'Solicitações',  to: '/home/solicitacoes' },
]

const LINKS_PUBLICO: NavLink[] = [
  { label: 'Animais',       to: '#pets' },
  { label: 'Abrigos',       to: '#abrigos' },
  { label: 'Como funciona', to: '#how-it-works' },
]

export const AppNavbar = ({ links, lang = 'pt', setLang }: AppNavbarProps) => {
  const { usuario, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const defaultLinks =
    !usuario           ? LINKS_PUBLICO :
    usuario.tipo_usuario === 'ABRIGO'  ? LINKS_ABRIGO :
    LINKS_ADOTANTE

  const navLinks = links ?? defaultLinks

  const initials = usuario?.nome
    ? usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const isDark = theme === 'dark'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@600;700;800&display=swap');

        :root {
          --blue:       #175EA8;
          --blue-700:   #114a85;
          --blue-100:   #DCE9F7;
          --blue-50:    #F0F6FC;
          --orange:     #D34C25;
          --orange-100: #FBDDD0;
          --cream:      #FFF9F1;
          --paper:      #FFFFFF;
          --ink:        #1A2238;
          --ink-2:      #4A5573;
          --ink-3:      #8090AD;
          --line:       #E6EBF3;
          --shadow-md:  0 8px 24px -6px rgba(23,94,168,0.18), 0 2px 0 rgba(23,94,168,0.06);
          --shadow-orange: 0 6px 0 rgba(181,61,24,0.35), 0 12px 24px -6px rgba(211,76,37,0.4);
        }

        .appnav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: ${isDark ? 'rgba(14,22,38,0.9)' : 'rgba(255,249,241,0.9)'};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 2px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'var(--blue-100)'};
          font-family: 'Nunito', system-ui, sans-serif;
        }

        .appnav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          padding: 0 80px;
          gap: 20px;
        }

        /* Logo */
        .appnav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .appnav-logo-icon {
          width: 38px; height: 38px;
          border-radius: 11px;
          background: var(--blue);
          display: grid; place-items: center;
          font-size: 19px;
          box-shadow: 0 4px 0 var(--blue-700);
          transform: rotate(-6deg);
        }
        .appnav-logo-text {
          font-family: 'Baloo 2', sans-serif;
          font-size: 21px; font-weight: 800;
          color: ${isDark ? '#fff' : 'var(--blue)'};
          letter-spacing: -0.02em;
        }
        .appnav-logo-text span { color: var(--orange); }

        /* Links desktop */
        .appnav-links {
          display: flex;
          align-items: center;
          gap: 2px;
          list-style: none;
          margin: 0; padding: 0;
        }
        .appnav-links a {
          display: block;
          padding: 9px 16px;
          font-size: 14px; font-weight: 700;
          text-decoration: none; border-radius: 999px;
          color: ${isDark ? 'rgba(255,255,255,0.75)' : 'var(--ink-2)'};
          transition: background .15s, color .15s;
        }
        .appnav-links a:hover {
          background: ${isDark ? 'rgba(255,255,255,0.08)' : 'var(--blue-50)'};
          color: ${isDark ? '#fff' : 'var(--blue)'};
        }
        .appnav-links a.active {
          background: var(--blue-100); color: var(--blue);
        }

        /* Controles direita */
        .appnav-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* Botão cadastro */
        .appnav-btn-signup {
          padding: 10px 20px;
          border-radius: 999px; border: none;
          background: var(--orange); color: white;
          font-family: 'Baloo 2', sans-serif;
          font-size: 14px; font-weight: 800;
          cursor: pointer; text-decoration: none;
          box-shadow: var(--shadow-orange);
          white-space: nowrap;
          transition: transform .15s;
        }
        .appnav-btn-signup:hover { transform: translateY(-1px); }

        /* Avatar */
        .appnav-avatar-wrap { position: relative; }
        .appnav-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--blue); color: white;
          font-family: 'Baloo 2', sans-serif;
          font-size: 14px; font-weight: 800;
          display: grid; place-items: center;
          cursor: pointer;
          border: 2px solid var(--blue-100);
          transition: transform .15s; user-select: none;
        }
        .appnav-avatar:hover { transform: scale(1.07); }

        /* Dropdown avatar */
        .appnav-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: var(--paper); border-radius: 16px;
          border: 2px solid var(--blue-100);
          box-shadow: var(--shadow-md);
          min-width: 192px; overflow: hidden;
          z-index: 200;
          animation: navDropIn .15s ease;
        }
        @keyframes navDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .appnav-dropdown-header {
          padding: 14px 16px 10px;
          border-bottom: 1px solid var(--line);
        }
        .appnav-dropdown-name {
          font-size: 13px; font-weight: 700; color: var(--ink);
        }
        .appnav-dropdown-role {
          font-size: 11px; font-weight: 500;
          color: var(--ink-3); margin-top: 2px;
          text-transform: capitalize;
        }
        .appnav-dropdown-link {
          display: block; padding: 11px 16px;
          font-size: 14px; font-weight: 600;
          color: var(--blue); text-decoration: none;
          transition: background .15s;
        }
        .appnav-dropdown-link:hover { background: var(--blue-50); }
        .appnav-dropdown-btn {
          width: 100%; padding: 11px 16px;
          background: none; border: none;
          text-align: left; font-size: 14px; font-weight: 600;
          color: var(--orange); cursor: pointer;
          font-family: 'Nunito', sans-serif;
          transition: background .15s;
          border-top: 1px solid var(--line);
        }
        .appnav-dropdown-btn:hover { background: var(--orange-100); }

        /* Mobile toggle */
        .appnav-mobile-toggle {
          display: none;
          background: none; border: none;
          font-size: 22px; cursor: pointer;
          color: ${isDark ? '#fff' : 'var(--ink-2)'};
          padding: 6px;
        }

        /* Mobile menu */
        .appnav-mobile-menu {
          display: none;
          flex-direction: column;
          padding: 12px 24px 20px;
          border-top: 1px solid var(--line);
          gap: 4px;
        }
        .appnav-mobile-menu.open { display: flex; }
        .appnav-mobile-menu a {
          padding: 11px 14px; border-radius: 12px;
          font-size: 15px; font-weight: 700;
          text-decoration: none;
          color: ${isDark ? 'rgba(255,255,255,0.8)' : 'var(--ink-2)'};
          transition: background .15s, color .15s;
        }
        .appnav-mobile-menu a:hover {
          background: var(--blue-50); color: var(--blue);
        }

        @media (max-width: 991px) {
          .appnav-inner { padding: 0 24px; }
          .appnav-links  { display: none; }
          .appnav-mobile-toggle { display: block; }
        }
        @media (max-width: 575px) {
          .appnav-inner { padding: 0 16px; }
        }
      `}</style>

      <nav className="appnav">
        <div className="appnav-inner">
          {/* Logo */}
          <Link to="/" className="appnav-logo">
            <div className="appnav-logo-icon">🐾</div>
            <span className="appnav-logo-text">
              Paw<span>Adoption</span>
            </span>
          </Link>

          {/* Links desktop */}
          <ul className="appnav-links">
            {navLinks.map(link => (
              <li key={link.to}>
                {link.to.startsWith('#') ? (
                  <a href={link.to}>{link.label}</a>
                ) : (
                  <Link to={link.to}>{link.label}</Link>
                )}
              </li>
            ))}
          </ul>

          {/* Direita: lang + theme + auth + mobile toggle */}
          <div className="appnav-right">
            {/* Lang toggle — só aparece se setLang for passado */}
            {setLang && (
              <div className="d-none d-md-flex" style={{ padding: 3, borderRadius: 999, background: 'var(--paper)', border: '2px solid var(--blue-100)' }}>
                {['pt', 'en'].map(L => (
                  <button key={L} onClick={() => setLang(L)} style={{
                    padding: '4px 10px', borderRadius: 999, border: 'none',
                    fontSize: 11, fontWeight: 800, cursor: 'pointer',
                    background: lang === L ? 'var(--blue)' : 'transparent',
                    color: lang === L ? 'white' : 'var(--ink-2)',
                  }}>{L.toUpperCase()}</button>
                ))}
              </div>
            )}

            {/* Theme toggle — sempre visível, usa useTheme */}
            <button onClick={toggleTheme} style={{
              width: 38, height: 38, borderRadius: 999,
              border: '2px solid var(--blue-100)', background: 'var(--paper)',
              fontSize: 16, cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            {usuario ? (
              <div className="appnav-avatar-wrap" ref={menuRef}>
                <div
                  className="appnav-avatar"
                  onClick={() => setMenuOpen(v => !v)}
                  role="button"
                  aria-label="Menu do usuário"
                >
                  {initials}
                </div>
                {menuOpen && (
                  <div className="appnav-dropdown">
                    <div className="appnav-dropdown-header">
                      <div className="appnav-dropdown-name">{usuario.nome}</div>
                      <div className="appnav-dropdown-role">
                        {usuario.tipo_usuario?.toLowerCase()}
                      </div>
                    </div>
                    <Link to="/home" className="appnav-dropdown-link">
                      Ir para o app →
                    </Link>
                    <button
                      className="appnav-dropdown-btn"
                      onClick={() => { logout(); navigate('/login') }}
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/cadastro" className="appnav-btn-signup">
                Cadastre-se grátis
              </Link>
            )}

            {/* Hamburger mobile */}
            <button
              className="appnav-mobile-toggle"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Abrir menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        <div className={`appnav-mobile-menu ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            link.to.startsWith('#') ? (
              <a
                key={link.to}
                href={link.to}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            )
          ))}
          {!usuario && (
            <Link
              to="/cadastro"
              onClick={() => setMobileOpen(false)}
              style={{
                marginTop: 8,
                background: 'var(--orange)', color: 'white',
                textAlign: 'center', borderRadius: 999,
              }}
            >
              Cadastre-se grátis
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}

export default AppNavbar