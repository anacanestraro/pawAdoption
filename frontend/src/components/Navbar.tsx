import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface NavLink {
  label: string
  to: string
}

interface NavbarProps {
  links?: NavLink[]
}

export const Navbar = ({ links }: NavbarProps) => {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const linksAdotante: NavLink[] = [
    { label: 'Animais', to: '/home' },
    { label: 'Contate-nos', to: '/contato' },
    { label: 'Sobre', to: '/sobre' },
  ]

  const linksAbrigo: NavLink[] = [
    { label: 'Meus animais', to: '/home/animais' },
    { label: 'Voluntários', to: '/home/voluntarios' },
    { label: 'Solicitações', to: '/home/solicitacoes' },
  ]

  const defaultLinks = usuario?.tipo_usuario === 'ABRIGO' ? linksAbrigo : linksAdotante
  const navLinks = links ?? defaultLinks

  const initials = usuario?.nome
    ? usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <>
      <style>{`
        .navbar {
          width: 100%;
          background: #E8A87C;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar-container {
          width: 100%;
          max-width: 1200px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
        }
        .navbar-logo {
          font-size: 22px;
          font-weight: 900;
          color: #F5ECD7 !important;
          text-decoration: none;
          letter-spacing: -0.5px;
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 36px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .navbar-links a {
          color: #F5ECD7 !important;
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          transition: opacity 0.15s;
        }
        .navbar-links a:hover { opacity: 0.8; }
        .navbar-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #F5ECD7;
          color: #7B4A2D;
          font-size: 14px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.4);
          transition: transform 0.15s;
          user-select: none;
        }
        .navbar-avatar:hover { transform: scale(1.07); }
        .avatar-wrapper { position: relative; }
        .avatar-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: #F5ECD7;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          min-width: 180px;
          overflow: hidden;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .avatar-dropdown-name {
          padding: 14px 16px 10px;
          font-size: 13px;
          font-weight: 700;
          color: #7B4A2D;
          border-bottom: 1px solid #f0ebfa;
        }
        .avatar-dropdown-name span {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: #7B4A2D;
          margin-top: 2px;
          text-transform: capitalize;
        }
        .avatar-dropdown button {
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: #832e25;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .avatar-dropdown button:hover { background: #fdf2f2; }
        .navbar-btn-entrar {
          background: #fff;
          color: #9C47A9 !important;
          font-weight: 800;
          font-size: 15px;
          padding: 10px 28px;
          border-radius: 50px;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .navbar-btn-entrar:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        @media (max-width: 768px) {
          .navbar-links { display: none; }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">PawAdoption</Link>

          <ul className="navbar-links">
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

          {usuario ? (
            <div className="avatar-wrapper" ref={menuRef}>
              <div className="navbar-avatar" onClick={() => setMenuOpen(v => !v)}>
                {initials}
              </div>
              {menuOpen && (
                <div className="avatar-dropdown">
                  <div className="avatar-dropdown-name">
                    {usuario.nome}
                    <span>{usuario.tipo_usuario?.toLowerCase()}</span>
                  </div>
                  <button onClick={handleLogout}>Sair</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-btn-entrar">Entrar</Link>
          )}
        </div>
      </nav>
    </>
  )
}