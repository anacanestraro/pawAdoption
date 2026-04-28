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