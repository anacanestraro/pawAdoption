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
        <style>{`
          .appfooter-compact {
            padding: 20px 80px;
            border-top: 2px dashed var(--line-2, #D5DCE8);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            font-family: 'Nunito', system-ui, sans-serif;
            font-size: 13px;
            color: var(--ink-3, #8090AD);
            font-weight: 600;
          }
          .appfooter-compact a {
            color: var(--ink-3, #8090AD);
            text-decoration: none;
            transition: color .15s;
          }
          .appfooter-compact a:hover { color: var(--blue, #175EA8); }
          .appfooter-compact-logo {
            display: flex; align-items: center; gap: 8px;
            text-decoration: none;
          }
          .appfooter-compact-logo-icon {
            width: 28px; height: 28px; border-radius: 8px;
            background: var(--blue, #175EA8);
            display: grid; place-items: center; font-size: 14px;
            box-shadow: 0 3px 0 var(--blue-700, #114a85);
            transform: rotate(-6deg);
          }
          .appfooter-compact-logo-text {
            font-family: 'Baloo 2', sans-serif;
            font-size: 16px; font-weight: 800;
            color: var(--blue, #175EA8);
          }
          .appfooter-compact-logo-text span { color: var(--orange, #D34C25); }
          .appfooter-compact-links {
            display: flex; gap: 20px; flex-wrap: wrap;
          }
          @media (max-width: 767px) {
            .appfooter-compact { padding: 16px 24px; flex-direction: column; align-items: flex-start; }
          }
        `}</style>
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@500;600;700;800&display=swap');

        :root {
          --blue:       #175EA8;
          --blue-700:   #114a85;
          --blue-100:   #DCE9F7;
          --orange:     #D34C25;
          --cream:      #FFF9F1;
          --paper:      #FFFFFF;
          --ink:        #1A2238;
          --ink-2:      #4A5573;
          --ink-3:      #8090AD;
          --line:       #E6EBF3;
          --line-2:     #D5DCE8;
        }

        .appfooter {
          font-family: 'Nunito', system-ui, sans-serif;
          padding: 0 80px;
          margin-top: 80px;
          padding-bottom: 48px;
        }

        .appfooter-top {
          padding-bottom: 40px;
          border-bottom: 2px dashed var(--line-2);
        }

        /* Logo + about */
        .appfooter-logo {
          display: flex; align-items: center;
          gap: 10px; text-decoration: none;
          margin-bottom: 14px;
        }
        .appfooter-logo-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: var(--blue); display: grid; place-items: center;
          font-size: 19px; box-shadow: 0 4px 0 var(--blue-700);
          transform: rotate(-6deg); flex-shrink: 0;
        }
        .appfooter-logo-text {
          font-family: 'Baloo 2', sans-serif;
          font-size: 20px; font-weight: 800;
          color: var(--blue); letter-spacing: -0.02em;
        }
        .appfooter-logo-text span { color: var(--orange); }
        .appfooter-about {
          font-size: 14px; color: var(--ink-2);
          line-height: 1.6; max-width: 280px;
          font-weight: 500; margin: 0;
        }

        /* Colunas de links */
        .appfooter-col-title {
          font-size: 11px; font-weight: 800;
          color: var(--orange); text-transform: uppercase;
          letter-spacing: .06em; margin-bottom: 14px;
          font-family: 'Baloo 2', sans-serif;
        }
        .appfooter-links {
          list-style: none; margin: 0; padding: 0;
          display: grid; gap: 10px;
        }
        .appfooter-links a {
          font-size: 14px; color: var(--ink);
          text-decoration: none; font-weight: 600;
          transition: color .15s;
        }
        .appfooter-links a:hover { color: var(--blue); }

        /* Newsletter */
        .appfooter-newsletter-desc {
          font-size: 13px; color: var(--ink-2);
          line-height: 1.55; margin: 0 0 14px; font-weight: 500;
        }
        .appfooter-newsletter-form {
          display: flex; padding: 4px;
          border-radius: 999px; background: var(--paper);
          border: 2px solid var(--blue-100);
        }
        .appfooter-newsletter-input {
          flex: 1; padding: 7px 12px;
          border: none; outline: none;
          background: transparent;
          font-size: 13px; font-weight: 600;
          color: var(--ink); font-family: 'Nunito', sans-serif;
        }
        .appfooter-newsletter-btn {
          padding: 9px 16px; border-radius: 999px;
          background: var(--orange); color: white; border: none;
          font-size: 12px; font-weight: 800;
          font-family: 'Baloo 2', sans-serif; cursor: pointer;
          transition: transform .15s;
        }
        .appfooter-newsletter-btn:hover { transform: scale(1.03); }

        /* Bottom bar */
        .appfooter-bottom {
          margin-top: 28px;
          display: flex; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          font-size: 13px; color: var(--ink-3); font-weight: 600;
        }
        .appfooter-bottom-links {
          display: flex; gap: 20px; flex-wrap: wrap;
        }
        .appfooter-bottom-links a {
          color: var(--ink-3); text-decoration: none;
          transition: color .15s;
        }
        .appfooter-bottom-links a:hover { color: var(--blue); }

        @media (max-width: 991px) {
          .appfooter { padding: 0 24px; padding-bottom: 40px; }
        }
        @media (max-width: 575px) {
          .appfooter { padding: 0 16px; padding-bottom: 32px; }
          .appfooter-bottom { flex-direction: column; }
        }
      `}</style>

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