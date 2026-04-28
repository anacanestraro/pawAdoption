/**
 * AppFooter.tsx
 * Footer reutilizável no design system v2.
 *
 * Uso simples:
 *   <AppFooter />
 *
 * Uso com variante compacta (para páginas internas):
 *   <AppFooter variant="compact" />
 */

import { Link } from 'react-router-dom'

interface AppFooterProps {
  variant?: 'full' | 'compact'
}

export const AppFooter = ({ variant = 'full' }: AppFooterProps) => {
  const year = new Date().getFullYear()

  if (variant === 'compact') {
    return (
      <>
        <footer className="appfooter-compact">
          <Link to="/" className="appfooter-compact-logo">
            <div className="appfooter-compact-logo-icon">🐾</div>
            <span className="appfooter-compact-logo-text">
              Paw<span>Adoption</span>
            </span>
          </Link>
          <div>© {year} PawAdoption · Feito com 🧡 para os animais.</div>
          <div className="appfooter-compact-links">
            <a href="#">Privacidade</a>
            <a href="#">Termos</a>
            <a href="#">Contato</a>
          </div>
        </footer>
      </>
    )
  }

  return (
    <>
      <footer className="appfooter">
        <div className="appfooter-top">
          <div className="row g-5">

            {/* Coluna 1 — Logo + about */}
            <div className="col-12 col-md-4">
              <Link to="/" className="appfooter-logo">
                <div className="appfooter-logo-icon">🐾</div>
                <span className="appfooter-logo-text">
                  Paw<span>Adoption</span>
                </span>
              </Link>
              <p className="appfooter-about">
                Conectando animais que precisam de lar com pessoas que têm amor para dar. 🐾
              </p>
            </div>

            {/* Coluna 2 — Adotar */}
            <div className="col-6 col-md-2">
              <div className="appfooter-col-title">Adotar</div>
              <ul className="appfooter-links">
                <li><Link to="/home">Ver pets</Link></li>
                <li><a href="#">Por espécie</a></li>
                <li><a href="#">Pets idosos</a></li>
                <li><a href="#">Necessidades especiais</a></li>
              </ul>
            </div>

            {/* Coluna 3 — Ajudar */}
            <div className="col-6 col-md-2">
              <div className="appfooter-col-title">Ajudar</div>
              <ul className="appfooter-links">
                <li><a href="#">Doar</a></li>
                <li><a href="#">Voluntariar</a></li>
                <li><a href="#">Lar temporário</a></li>
                <li><a href="#">Seja parceiro</a></li>
              </ul>
            </div>

            {/* Coluna 4 — Newsletter */}
            <div className="col-12 col-md-4">
              <div className="appfooter-col-title">Receba abanadas semanais</div>
              <p className="appfooter-newsletter-desc">
                Uma cartinha por semana. Pets em destaque, finais felizes.
              </p>
              <div className="appfooter-newsletter-form">
                <input
                  className="appfooter-newsletter-input"
                  placeholder="seu@email.com"
                  type="email"
                />
                <button className="appfooter-newsletter-btn">
                  Entrar 🐾
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="appfooter-bottom">
          <div>© {year} PawAdoption · Feito com 🧡 para os animais.</div>
          <div className="appfooter-bottom-links">
            <a href="#">Privacidade</a>
            <a href="#">Termos</a>
            <a href="#">Acessibilidade</a>
            <a href="#">Contato</a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default AppFooter