import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: '#F5ECD7' }}>

      <style>{`
        .login-card {
          width: 505px;
          background: #E8A87C;
          border-radius: 18px;
        }
        .login-card .form-control {
          background: #fff6e2;
          border: none;
          color: #7B4A2D;
          font-size: 23px;
        }
        .login-card .form-control:focus {
          background: #fff6e2;
          box-shadow: 0 0 0 2.5px #7B4A2D;
          color: #7B4A2D;
        }
        .login-card .form-label {
          color: #7B4A2D;
          font-weight: 600;
          font-size: 17px;
        }
        .login-card .form-check-label {
          color: #7B4A2D;
          font-size: 17px;
        }
        .login-card .form-check-input:checked {
          background-color: #7B4A2D;
          border-color: #7B4A2D;
        }
        .btn-google {
          background: #F5ECD7;
          color: #7B4A2D;
          border: none;
          font-weight: 600;
          font-size: 17px;
          transition: background 0.2s, transform 0.1s;
        }
        .btn-google:hover {
          background: #ddd2b6;
          color: #7B4A2D;
          transform: translateY(-1px);
        }
        .link-esqueci {
          color: #7B4A2D;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
        }
        .link-esqueci:hover { text-decoration: underline; color: #7B4A2D; }
        .link-cadastro {
          color: #3D2314;
          font-weight: 900;
          text-decoration: none;
        }
        .link-cadastro:hover { text-decoration: underline; color: #3D2314; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-card { animation: fadeIn 0.45s ease both; }
      `}</style>

      <div className="login-card p-5">
        <h1 className="fw-bold mb-1" style={{ fontSize: 50, color: '#3D2314', letterSpacing: '-0.5px' }}>
          PawAdoption
        </h1>
        <p className="fw-bold mb-4" style={{ fontSize: 21, color: '#7B4A2D' }}>
          Bem-vindo de volta!
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input
              className="form-control"
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="lembrar"
                checked={lembrar}
                onChange={e => setLembrar(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="lembrar">
                Lembre-se de mim
              </label>
            </div>
            <Link to="/esqueci-senha" className="link-esqueci">
              Esqueci minha senha
            </Link>
          </div>

          {erro && (
            <div className="alert alert-danger py-2 text-center" style={{ fontSize: 17 }}>
              {erro}
            </div>
          )}

          <button
            className="btn btn-primary w-100 fw-bold py-3"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <button className="btn btn-google w-100 d-flex align-items-center justify-content-center gap-2 mt-3 py-3 rounded-3">
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.97-4.32 2.97-7.31z" fill="#4285F4"/>
            <path d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.81-1.76-5.6-4.12H1.07v2.57A9.98 9.98 0 0 0 10 20z" fill="#34A853"/>
            <path d="M4.4 11.9A5.98 5.98 0 0 1 4.08 10c0-.66.11-1.3.32-1.9V5.53H1.07A9.98 9.98 0 0 0 0 10c0 1.62.39 3.14 1.07 4.47L4.4 11.9z" fill="#FBBC05"/>
            <path d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C14.95.99 12.7 0 10 0A9.98 9.98 0 0 0 1.07 5.53L4.4 8.1C5.19 5.74 7.4 3.98 10 3.98z" fill="#EA4335"/>
          </svg>
          Entre com Google
        </button>

        <p className="text-center mt-4 mb-0" style={{ fontSize: 16, color: '#7B4A2D' }}>
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="link-cadastro">Cadastre-se!</Link>
        </p>
      </div>
    </div>
  )
}

export default Login