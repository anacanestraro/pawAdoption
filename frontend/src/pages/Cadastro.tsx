import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/api'

type TipoUsuario = 'ADOTANTE' | 'ABRIGO'

export const Cadastro = () => {
  const navigate = useNavigate()
  const [tipo, setTipo] = useState<TipoUsuario>('ADOTANTE')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  // Campos comuns
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)

  // Campos Adotante
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [larTemporario, setLarTemporario] = useState(false)

  // Campos Abrigo
  const [cnpj, setCnpj] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      if (tipo === 'ADOTANTE') {
        await api.post('/adotantes/cadastrar', {
          nome,
          email,
          senha,
          cpf,
          data_nascimento: dataNascimento ? new Date(dataNascimento).toISOString() : null,
          lar_temporario: larTemporario,
        })
      } else {
        await api.post('/abrigos/cadastrar', {
          nome,
          email,
          senha,
          cnpj,
          razao_social: razaoSocial,
        })
      }
      navigate('/login')
    } catch {
      setErro('Erro ao cadastrar. Verifique os dados e tente novamente.')
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
          <div className="auth-left-blob">
            {tipo === 'ADOTANTE' ? '🐾' : '🏠'}
          </div>
          <div className="auth-left-text">
            <h2>
              {tipo === 'ADOTANTE'
                ? 'Encontre seu pet ideal'
                : 'Cadastre seu abrigo'}
            </h2>
            <p>
              {tipo === 'ADOTANTE'
                ? 'Junte-se a milhares de famílias que encontraram seu companheiro perfeito.'
                : 'Conecte seus animais a famílias amorosas em todo o Brasil.'}
            </p>
          </div>
          <div className="auth-tipo-cards">
            <div className="auth-tipo-card">
              <div className="icon">🐕</div>
              <div className="label">Adotante</div>
            </div>
            <div className="auth-tipo-card">
              <div className="icon">🏠</div>
              <div className="label">Abrigo</div>
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

            <h1 className="auth-heading">Criar sua conta</h1>
            <p className="auth-subheading">Preencha os dados abaixo para começar.</p>

            {/* Seletor de tipo */}
            <div className="tipo-toggle">
              <button
                type="button"
                className={`tipo-btn ${tipo === 'ADOTANTE' ? 'active' : ''}`}
                onClick={() => setTipo('ADOTANTE')}
              >
                🐾 Adotante
              </button>
              <button
                type="button"
                className={`tipo-btn ${tipo === 'ABRIGO' ? 'active' : ''}`}
                onClick={() => setTipo('ABRIGO')}
              >
                🏠 Abrigo
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Dados comuns */}
              <div className="auth-section-label">Dados da conta</div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="nome">
                  {tipo === 'ADOTANTE' ? 'Seu nome completo' : 'Nome do abrigo'}
                </label>
                <input
                  id="nome"
                  className="auth-input"
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder={tipo === 'ADOTANTE' ? 'Ana Silva' : 'Lar dos Focinhos'}
                  required
                  autoComplete="name"
                />
              </div>

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

              <div className="auth-field">
                <label className="auth-label" htmlFor="senha">Senha</label>
                <div className="auth-input-wrap">
                  <input
                    id="senha"
                    className="auth-input has-toggle"
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    autoComplete="new-password"
                    minLength={6}
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

              {/* Campos exclusivos — Adotante */}
              {tipo === 'ADOTANTE' && (
                <>
                  <div className="auth-section-label">Dados pessoais</div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="cpf">CPF</label>
                    <input
                      id="cpf"
                      className="auth-input"
                      type="text"
                      value={cpf}
                      onChange={e => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="nascimento">Data de nascimento</label>
                    <input
                      id="nascimento"
                      className="auth-input"
                      type="date"
                      value={dataNascimento}
                      onChange={e => setDataNascimento(e.target.value)}
                      required
                    />
                  </div>

                  <label className="auth-check">
                    <input
                      type="checkbox"
                      checked={larTemporario}
                      onChange={e => setLarTemporario(e.target.checked)}
                    />
                    <span className="auth-check-text">
                      Quero oferecer <strong>lar temporário</strong> para animais que precisam de um aconchego
                    </span>
                  </label>
                </>
              )}

              {/* Campos exclusivos — Abrigo */}
              {tipo === 'ABRIGO' && (
                <>
                  <div className="auth-section-label">Dados do abrigo</div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="cnpj">CNPJ</label>
                    <input
                      id="cnpj"
                      className="auth-input"
                      type="text"
                      value={cnpj}
                      onChange={e => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="razao">Razão social</label>
                    <input
                      id="razao"
                      className="auth-input"
                      type="text"
                      value={razaoSocial}
                      onChange={e => setRazaoSocial(e.target.value)}
                      placeholder="Lar dos Focinhos LTDA"
                      required
                    />
                  </div>
                </>
              )}

              {/* Erro */}
              {erro && (
                <div className="auth-error">⚠️ {erro}</div>
              )}

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={loading}
              >
                {loading
                  ? '⏳ Cadastrando...'
                  : tipo === 'ADOTANTE'
                    ? 'Criar conta de adotante →'
                    : 'Cadastrar meu abrigo →'}
              </button>
            </form>

            <p className="auth-footer">
              Já tem uma conta?{' '}
              <Link to="/login">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Cadastro