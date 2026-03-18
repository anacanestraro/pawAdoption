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
    <div style={{
      minHeight: '100vh',
      background: '#e8e3f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Noto Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double+Ink:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-input {
          width: 100%;
          padding: 13px 15px;
          border-radius: 8px;
          border: none;
          background: #ffffff;
          font-size: 15px;
          font-family: 'Noto Sans', sans-serif;
          color: #3d3350;
          outline: none;
          transition: box-shadow 0.2s;
        }
        .login-input:focus {
          box-shadow: 0 0 0 2.5px #9b7ec8;
        }
        .btn-entrar {
          width: 100%;
          padding: 14px;
          background: #a48bc4;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          font-family: 'Noto Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.3px;
        }
        .btn-entrar:hover:not(:disabled) { background: #8f6fb5; transform: translateY(-1px); }
        .btn-entrar:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-google {
          width: 100%;
          padding: 13px;
          background: #fff;
          color: #3d3350;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Noto Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, transform 0.1s;
        }
        .btn-google:hover { background: #f5f0fc; transform: translateY(-1px); }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #5e4f7a;
          cursor: pointer;
          user-select: none;
        }
        .checkbox-label input[type="checkbox"] {
          width: 13px;
          height: 13px;
          accent-color: #9b7ec8;
          cursor: pointer;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim { animation: fadeIn 0.45s ease both; }
        .anim-delay { animation: fadeIn 0.45s ease 0.1s both; }
      `}</style>

      {/* ── Main layout ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Card */}
        <div className="anim" style={{
          width: 405,
          background: '#cdc5dd',
          borderRadius: 18,
          padding: '40px 36px 36px',
          flexShrink: 0,
        }}>
          <h1 style={{
            fontSize: 40,
            fontWeight: 900,
            color: '#241840',
            marginBottom: 5,
            letterSpacing: '-0.5px',
          }}>PawAdoption</h1>
          <p style={{
            fontSize: 17,
            fontWeight: 700,
            color: '#3a2d58',
            marginBottom: 28,
          }}>Bem-vindo de volta!</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 600,
                color: '#3a2d58', marginBottom: 7,
              }}>Username</label>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 600,
                color: '#3a2d58', marginBottom: 7,
              }}>Senha</label>
              <input
                className="login-input"
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
              <label className="checkbox-label">
                <input type="checkbox" checked={lembrar}
                  onChange={e => setLembrar(e.target.checked)} />
                Lembre-se de mim
              </label>
              <Link to="/esqueci-senha" style={{
                fontSize: 13, color: '#3a2d58',
                textDecoration: 'none', fontWeight: 600,
              }}
                onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
              >Esqueci minha senha</Link>
            </div>

            {erro && (
              <p style={{
                color: '#c0392b', fontSize: 13, fontWeight: 600,
                marginBottom: 12, textAlign: 'center',
              }}>{erro}</p>
            )}

            <button className="btn-entrar" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <button className="btn-google" style={{ marginTop: 12 }} type="button">
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.97-4.32 2.97-7.31z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.81-1.76-5.6-4.12H1.07v2.57A9.98 9.98 0 0 0 10 20z" fill="#34A853"/>
              <path d="M4.4 11.9A5.98 5.98 0 0 1 4.08 10c0-.66.11-1.3.32-1.9V5.53H1.07A9.98 9.98 0 0 0 0 10c0 1.62.39 3.14 1.07 4.47L4.4 11.9z" fill="#FBBC05"/>
              <path d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C14.95.99 12.7 0 10 0A9.98 9.98 0 0 0 1.07 5.53L4.4 8.1C5.19 5.74 7.4 3.98 10 3.98z" fill="#EA4335"/>
            </svg>
            Entre com Google
          </button>

          <p style={{
            textAlign: 'center', marginTop: 22,
            fontSize: 14, color: '#3a2d58',
          }}>
            Não tem uma conta?{' '}
            <Link to="/cadastro" style={{
              color: '#241840', fontWeight: 900, textDecoration: 'none',
            }}
              onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
            >Cadastre-se!</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login