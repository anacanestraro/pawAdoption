import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthLayout, IconOlho, IconAlerta, IconCheck } from '../components/AuthLayout'
import type { Usuario } from '../types'

// State enviado pelo Cadastro após criar a conta
interface LoginState { cadastrado?: boolean; email?: string }

const redirectByRole = (usuario: Usuario): string => {
  if (usuario.tipo_usuario === 'ADMINISTRADOR') return '/admin'
  return '/home'
}

export const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Guardado em state para sobreviver à limpeza do history logo abaixo
  const [vindoDoCadastro] = useState<LoginState>(() => (location.state as LoginState | null) ?? {})

  const [email, setEmail] = useState(vindoDoCadastro.email ?? '')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  // Limpa o state do history: um F5 no login não repete o aviso
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!email.trim() || !senha) {
      setErro('Preencha email e senha.')
      return
    }

    setLoading(true)
    try {
      await login(email.trim(), senha)
      // O state do contexto ainda não atualizou neste tick;
      // o AuthContext já persistiu o usuário no localStorage.
      const salvo = localStorage.getItem('usuario')
      const u: Usuario | null = salvo ? JSON.parse(salvo) : null
      navigate(u ? redirectByRole(u) : '/home', { replace: true })
    } catch {
      setErro('Email ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      badge="Que bom te ver!"
      titulo={<>Tem um focinho<br />esperando por você.</>}
      texto="Entre para acompanhar suas solicitações, falar com abrigos e encontrar seu novo melhor amigo."
      features={[
        'Totalmente gratuito',
        'Anúncios revisados pela moderação',
        'Abrigos e protetores da sua região',
      ]}
    >
      <h1 className="auth-heading">Entrar na conta</h1>
      <p className="auth-subheading">Use o email e a senha do seu cadastro.</p>

      {vindoDoCadastro.cadastrado && !erro && (
        <div className="auth-success" role="status">
          <IconCheck /> Conta criada com sucesso! Agora é só entrar.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="auth-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="senha">Senha</label>
          <div className="auth-input-wrap">
            <input
              id="senha"
              className="auth-input has-toggle"
              type={showSenha ? 'text' : 'password'}
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="auth-toggle-btn"
              onClick={() => setShowSenha(v => !v)}
              aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <IconOlho aberto={!showSenha} />
            </button>
          </div>
        </div>

        {erro && (
          <div className="auth-error" role="alert">
            <IconAlerta /> {erro}
          </div>
        )}

        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? <><span className="auth-spinner" /> Entrando…</> : 'Entrar →'}
        </button>
      </form>

      <p className="auth-footer">
        Ainda não tem conta? <Link to="/cadastro">Cadastre-se grátis</Link>
      </p>
    </AuthLayout>
  )
}

export default Login