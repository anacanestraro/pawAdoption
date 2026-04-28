import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(email, senha)
      navigate('/')
    } catch {
      setErro('Email ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');

        :root {
          --blue:          #175EA8;
          --blue-700:      #114a85;
          --blue-100:      #DCE9F7;
          --blue-50:       #F0F6FC;
          --orange:        #D34C25;
          --orange-700:    #B53D18;
          --orange-100:    #FBDDD0;
          --cream:         #FFF9F1;
          --paper:         #FFFFFF;
          --ink:           #1A2238;
          --ink-2:         #4A5573;
          --ink-3:         #8090AD;
          --line:          #E6EBF3;
          --shadow-sm:     0 4px 0 rgba(23,94,168,0.08);
          --shadow-md:     0 8px 24px -6px rgba(23,94,168,0.18), 0 2px 0 rgba(23,94,168,0.06);
          --shadow-orange: 0 6px 0 rgba(181,61,24,0.35), 0 12px 24px -6px rgba(211,76,37,0.4);
          --shadow-pop:    0 10px 30px -8px rgba(23,94,168,0.25);
          --display:       'Baloo 2', 'Nunito', system-ui, sans-serif;
          --sans:          'Nunito', system-ui, sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; }

        .auth-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Nunito', system-ui, sans-serif;
          background-color: var(--cream);
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><g fill='%23175EA8' fill-opacity='0.04'><ellipse cx='30' cy='40' rx='5' ry='6.5'/><ellipse cx='42' cy='32' rx='4.5' ry='6'/><ellipse cx='54' cy='32' rx='4.5' ry='6'/><ellipse cx='66' cy='40' rx='5' ry='6.5'/><path d='M40 58c0-7 4-12 8-12s8 5 8 12c0 5-3.5 7-6 7s-2 1.5-3 1.5S46 65 43 65s-3-2-3-7z'/><ellipse cx='110' cy='112' rx='4' ry='5.5'/><ellipse cx='119' cy='106' rx='3.5' ry='5'/><ellipse cx='128' cy='106' rx='3.5' ry='5'/><ellipse cx='137' cy='112' rx='4' ry='5.5'/><path d='M118 126c0-5.5 3-9.5 6-9.5s6 4 6 9.5c0 4-2.5 5.5-4.5 5.5s-1.5 1-2 1-1.5-1-3-1-2.5-1.5-2.5-5.5z'/></g></svg>");
          background-repeat: repeat;
          background-size: 160px 160px;
          color: var(--ink);
        }

        /* ── Painel esquerdo decorativo ── */
        .auth-left {
          display: none;
          flex: 1;
          background: var(--blue);
          position: relative;
          overflow: hidden;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 32px;
          padding: 60px;
        }
        @media (min-width: 992px) { .auth-left { display: flex; } }

        .auth-left-blob {
          width: clamp(260px, 28vw, 420px);
          height: clamp(260px, 28vw, 420px);
          background: rgba(255,255,255,0.12);
          border-radius: 42% 58% 52% 48% / 48% 42% 58% 52%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(100px, 14vw, 180px);
          position: relative;
          z-index: 1;
        }
        .auth-left-deco1 {
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -80px; right: -80px;
        }
        .auth-left-deco2 {
          position: absolute;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          bottom: -60px; left: -60px;
        }
        .auth-left-text {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
        }
        .auth-left-text h2 {
          font-family: 'Baloo 2', sans-serif;
          font-size: clamp(24px, 2.4vw, 36px);
          font-weight: 800;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }
        .auth-left-text p {
          font-size: 15px;
          opacity: 0.8;
          margin: 0;
          max-width: 300px;
          line-height: 1.6;
        }
        .auth-left-stats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        .auth-left-stat {
          background: rgba(255,255,255,0.15);
          border-radius: 14px;
          padding: 12px 18px;
          text-align: center;
          color: white;
          backdrop-filter: blur(8px);
        }
        .auth-left-stat strong {
          display: block;
          font-family: 'Baloo 2', sans-serif;
          font-size: 22px;
          font-weight: 800;
        }
        .auth-left-stat span {
          font-size: 11px;
          opacity: 0.8;
          font-weight: 600;
        }

        /* ── Painel direito — formulário ── */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
        }
        @media (min-width: 992px) {
          .auth-right { max-width: 540px; padding: 48px 56px; }
        }

        .auth-form-wrap {
          width: 100%;
          max-width: 400px;
        }

        /* Logo */
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 36px;
        }
        .auth-logo-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: var(--blue);
          display: grid;
          place-items: center;
          font-size: 20px;
          box-shadow: 0 4px 0 var(--blue-700);
          transform: rotate(-6deg);
          flex-shrink: 0;
        }
        .auth-logo-text {
          font-family: 'Baloo 2', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: var(--blue);
          letter-spacing: -0.02em;
        }
        .auth-logo-text span { color: var(--orange); }

        /* Cabeçalho do form */
        .auth-heading {
          font-family: 'Baloo 2', sans-serif;
          font-size: clamp(26px, 3.5vw, 36px);
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.02em;
          margin: 0 0 6px;
        }
        .auth-subheading {
          font-size: 15px;
          color: var(--ink-2);
          margin: 0 0 32px;
          font-weight: 500;
        }

        /* Inputs */
        .auth-field { margin-bottom: 18px; }
        .auth-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: var(--ink-2);
          margin-bottom: 7px;
          letter-spacing: .02em;
        }
        .auth-input-wrap { position: relative; }
        .auth-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 14px;
          border: 2px solid var(--line);
          background: var(--paper);
          font-size: 15px;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          color: var(--ink);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .auth-input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(23,94,168,0.12);
        }
        .auth-input.has-toggle { padding-right: 48px; }
        .auth-toggle-btn {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; font-size: 17px;
          color: var(--ink-3); padding: 4px;
        }

        /* Erro */
        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 12px;
          background: var(--orange-100);
          color: var(--orange);
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 18px;
        }

        /* Botão principal */
        .auth-btn-primary {
          width: 100%;
          padding: 15px;
          border-radius: 999px;
          border: none;
          background: var(--orange);
          color: white;
          font-family: 'Baloo 2', sans-serif;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: var(--shadow-orange);
          transition: transform .15s, box-shadow .15s, opacity .15s;
          margin-bottom: 12px;
        }
        .auth-btn-primary:hover:not(:disabled) { transform: translateY(-2px); }
        .auth-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; box-shadow: none; }

        /* Link extras */
        .auth-extras {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .auth-check-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--ink-2);
          font-weight: 600;
          cursor: pointer;
        }
        .auth-check-label input[type="checkbox"] {
          width: 16px; height: 16px;
          accent-color: var(--blue);
          cursor: pointer;
        }
        .auth-link {
          font-size: 13px;
          font-weight: 700;
          color: var(--blue);
          text-decoration: none;
        }
        .auth-link:hover { text-decoration: underline; }

        /* Divisor */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0;
          color: var(--ink-3);
          font-size: 12px;
          font-weight: 600;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--line);
        }

        /* Footer do form */
        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: var(--ink-2);
          font-weight: 500;
        }
        .auth-footer a {
          color: var(--blue);
          font-weight: 800;
          text-decoration: none;
        }
        .auth-footer a:hover { text-decoration: underline; }

        /* Animação */
        @keyframes authFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-form-wrap { animation: authFadeIn .4s cubic-bezier(.34,1.4,.64,1) both; }
      `}</style>

      <div className="auth-page">
        {/* ── Painel esquerdo decorativo ── */}
        <div className="auth-left">
          <div className="auth-left-deco1" />
          <div className="auth-left-deco2" />
          <div className="auth-left-blob">🐾</div>
          <div className="auth-left-text">
            <h2>Bem-vindo de volta!</h2>
            <p>Milhares de pets esperam por você. Entre e encontre seu novo melhor amigo.</p>
          </div>
          <div className="auth-left-stats">
            <div className="auth-left-stat">
              <strong>12K+</strong>
              <span>Pets adotados</span>
            </div>
            <div className="auth-left-stat">
              <strong>284</strong>
              <span>Abrigos parceiros</span>
            </div>
            <div className="auth-left-stat">
              <strong>98%</strong>
              <span>Finais felizes</span>
            </div>
          </div>
        </div>

        {/* ── Formulário ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            {/* Logo */}
            <Link to="/" className="auth-logo">
              <div className="auth-logo-icon">🐾</div>
              <span className="auth-logo-text">
                Paw<span>Adoption</span>
              </span>
            </Link>

            <h1 className="auth-heading">Entrar na conta</h1>
            <p className="auth-subheading">Entre com seu email e senha para continuar.</p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Senha */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="senha">Senha</label>
                <div className="auth-input-wrap">
                  <input
                    id="senha"
                    className="auth-input has-toggle"
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-btn"
                    onClick={() => setShowSenha(v => !v)}
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showSenha ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Lembrar + esqueci */}
              <div className="auth-extras">
                <label className="auth-check-label">
                  <input type="checkbox" />
                  Lembre-se de mim
                </label>
                <a href="#" className="auth-link">Esqueci minha senha</a>
              </div>

              {/* Erro */}
              {erro && (
                <div className="auth-error">
                  ⚠️ {erro}
                </div>
              )}

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={loading}
              >
                {loading ? '⏳ Entrando...' : 'Entrar →'}
              </button>
            </form>

            <p className="auth-footer">
              Não tem uma conta?{' '}
              <Link to="/cadastro">Cadastre-se grátis</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login