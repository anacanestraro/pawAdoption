/**
 * AppFooter.tsx
 * Footer reutilizável — visual escuro transparente com patinhas do body visíveis.
 */

import { Link } from 'react-router-dom'
import '../styles/AppFooter.css'

interface AppFooterProps {
  variant?: 'full' | 'compact'
}

export const AppFooter = ({ variant = 'full' }: AppFooterProps) => {
  const year = new Date().getFullYear()

  if (variant === 'compact') {
    return (
      <footer className="appfooter-compact">
        <Link to="/" className="appfooter-compact-logo">
          <div className="appfooter-compact-logo-icon">
            <span>🐾</span>
          </div>
          <span className="appfooter-compact-logo-text">
            Paw<span>Adoption</span>
          </span>
        </Link>
        <div>© {year} PawAdoption · Feito com ❤️ para os animais.</div>
        <div className="appfooter-compact-links">
          <a href="#">Privacidade</a>
          <a href="#">Termos</a>
          <a href="#">Contato</a>
        </div>
      </footer>
    )
  }

  return (
    <footer className="appfooter">
      <div className="appfooter-top">
        <div className="row g-5">

          {/* Coluna 1 — Logo + about */}
          <div className="col-12 col-md-3">
            <Link to="/" className="appfooter-logo">
              <div className="appfooter-logo-icon">🐾</div>
              <span className="appfooter-logo-text">
                Paw<span>Adoption</span>
              </span>
            </Link>
            <p className="appfooter-about">
              Conectando animais que precisam de lar com pessoas que têm amor para dar. Desde 2017. 🐾
            </p>
          </div>

          {/* Coluna 2 — Adotar */}
          <div className="col-6 col-md-2">
            <div className="appfooter-col-title">Adotar</div>
            <ul className="appfooter-links">
              <li><a href="#">Browse pets</a></li>
              <li><a href="#">By breed</a></li>
              <li><a href="#">Senior pets</a></li>
              <li><a href="#">Special needs</a></li>
            </ul>
          </div>

          {/* Coluna 3 — Ajudar */}
          <div className="col-6 col-md-2">
            <div className="appfooter-col-title">Ajudar</div>
            <ul className="appfooter-links">
              <li><a href="#">Donate</a></li>
              <li><a href="#">Volunteer</a></li>
              <li><a href="#">Foster</a></li>
              <li><a href="#">Become a partner</a></li>
            </ul>
          </div>

          {/* Coluna 4 — Empresa */}
          <div className="col-6 col-md-2">
            <div className="appfooter-col-title">Empresa</div>
            <ul className="appfooter-links">
              <li><a href="#">About us</a></li>
              <li><a href="#">How it works</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>

          {/* Coluna 5 — Newsletter */}
          <div className="col-12 col-md-3">
            <div className="appfooter-col-title">Receba abanadas semanais</div>
            <p className="appfooter-newsletter-desc">
              Uma cartinha por semana. Pets em destaque, finais felizes.
            </p>
            <div className="appfooter-newsletter-form">
              <input
                className="appfooter-newsletter-input"
                placeholder="you@email.com"
                type="email"
              />
              <button className="appfooter-newsletter-btn" aria-label="Entrar">
                🐾
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="appfooter-bottom">
        <div>© {year} PawAdoption · Feito com ❤️ para os animais.</div>
        <div className="appfooter-bottom-links">
          <a href="#">Privacidade</a>
          <a href="#">Termos</a>
          <a href="#">Acessibilidade</a>
          <a href="#">Contato</a>
        </div>
      </div>
    </footer>
  )
}

export default AppFooter