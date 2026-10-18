/**
 * AuthLayout.tsx — PawAdoption
 * Moldura compartilhada por Login e Cadastro:
 * painel azul da marca (desktop) + barra superior + card do formulário.
 * Estilos em styles/Auth.css.
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import '../styles/Auth.css'

import logo_clara from '../assets/lockup_claro.png'
import logo_escura from '../assets/lockup_original.png'
import icon_lua from '../assets/icon_lua.png'
import icon_sol from '../assets/icon_sol_dark.png'
import cachorro from '../assets/cachorro.png'
import gato from '../assets/gato.png'
import casa from '../assets/casa.png'

// ─── Ícones compartilhados ────────────────────────────────────────────────────

export const IconOlho = ({ aberto }: { aberto: boolean }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {aberto ? (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2" />
        <path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        <path d="M2 2l20 20" />
      </>
    )}
  </svg>
)

export const IconAlerta = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" />
  </svg>
)

export const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
       strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
)

// ─── Layout ───────────────────────────────────────────────────────────────────

interface AuthLayoutProps {
  badge:    string
  titulo:   ReactNode
  texto:    string
  features: string[]
  children: ReactNode
}

export const AuthLayout = ({ badge, titulo, texto, features, children }: AuthLayoutProps) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="auth-page">

      {/* ── Painel da marca (some abaixo de 900px) ── */}
      <aside className="auth-left">
        <Link to="/" className="auth-left-logo" aria-label="PawAdoption — página inicial">
          {/* selo creme fixo: lockup claro em qualquer tema */}
          <img src={logo_clara} alt="" />
        </Link>

        <div className="auth-left-main">
          <span className="auth-left-badge">{badge}</span>
          <h2 className="auth-left-title">{titulo}</h2>
          <p className="auth-left-sub">{texto}</p>
          <ul className="auth-features">
            {features.map(f => (
              <li key={f}>
                <span className="auth-features-check"><IconCheck /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-pets" aria-hidden="true">
          <div className="auth-pet"><img src={cachorro} alt="" /></div>
          <div className="auth-pet"><img src={gato} alt="" /></div>
          <div className="auth-pet"><img src={casa} alt="" /></div>
        </div>
      </aside>

      {/* ── Lado do formulário ── */}
      <main className="auth-right">
        <div className="auth-topbar">
          <Link to="/" className="auth-back">← Voltar ao início</Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="auth-theme-btn"
            aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            <img src={theme === 'dark' ? icon_sol : icon_lua} alt="" />
          </button>
        </div>

        <div className="auth-center">
          <div className="auth-card fade-in">
            <Link to="/" className="auth-mobile-logo" aria-label="PawAdoption — página inicial">
              <img src={theme === 'dark' ? logo_escura : logo_clara} alt="" />
            </Link>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}