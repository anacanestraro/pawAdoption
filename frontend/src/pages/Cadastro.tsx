import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/api'
import { AuthLayout, IconOlho, IconAlerta } from '../components/AuthLayout'

import cachorro from '../assets/cachorro.png'
import casa from '../assets/casa.png'

type TipoUsuario = 'ADOTANTE' | 'ABRIGO'

const PAINEL: Record<TipoUsuario, { badge: string; texto: string; features: string[] }> = {
  ADOTANTE: {
    badge: 'Bem-vindo à matilha',
    texto: 'Crie sua conta para solicitar adoções, oferecer lar temporário ou ser voluntário em um abrigo.',
    features: ['Cadastro em menos de 2 minutos', 'Solicite adoções direto pela plataforma', 'Opção de lar temporário'],
  },
  ABRIGO: {
    badge: 'Para abrigos e protetores',
    texto: 'Divulgue seus animais para adotantes da região e acompanhe cada solicitação em um só lugar.',
    features: ['Anúncios ilimitados e gratuitos', 'Gestão de solicitações e voluntários', 'Relatório das adoções'],
  },
}

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

  const ehAdotante = tipo === 'ADOTANTE'
  const painel = PAINEL[tipo]

  const validar = (): string | null => {
    if (!nome.trim() || !email.trim() || !senha) return 'Preencha nome, email e senha.'
    if (senha.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.'
    if (ehAdotante && (!cpf.trim() || !dataNascimento)) return 'Preencha CPF e data de nascimento.'
    if (!ehAdotante && (!cnpj.trim() || !razaoSocial.trim())) return 'Preencha CNPJ e razão social.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    const problema = validar()
    if (problema) {
      setErro(problema)
      return
    }

    setLoading(true)
    try {
      if (ehAdotante) {
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
      // Login lê esse state para mostrar o aviso de sucesso e preencher o email
      navigate('/login', { state: { cadastrado: true, email: email.trim() } })
    } catch (e: any) {
      setErro(e?.response?.data?.error || 'Erro ao cadastrar. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      badge={painel.badge}
      titulo={ehAdotante
        ? <>Seu novo melhor<br />amigo começa aqui.</>
        : <>Mais visibilidade<br />para quem você cuida.</>}
      texto={painel.texto}
      features={painel.features}
    >
      <h1 className="auth-heading">Criar sua conta</h1>
      <p className="auth-subheading">Primeiro, conte como você vai usar o PawAdoption.</p>

      {/* Seletor de tipo */}
      <div className="auth-tipo" role="radiogroup" aria-label="Tipo de conta">
        <button
          type="button"
          role="radio"
          aria-checked={ehAdotante}
          className={`auth-tipo-btn ${ehAdotante ? 'active' : ''}`}
          onClick={() => setTipo('ADOTANTE')}
        >
          <img src={cachorro} alt="" />
          <span className="auth-tipo-label">Quero adotar</span>
          <span className="auth-tipo-desc">Adotante ou lar temporário</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!ehAdotante}
          className={`auth-tipo-btn ${!ehAdotante ? 'active' : ''}`}
          onClick={() => setTipo('ABRIGO')}
        >
          <img src={casa} alt="" />
          <span className="auth-tipo-label">Sou abrigo</span>
          <span className="auth-tipo-desc">ONG ou protetor com CNPJ</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-section-label">Dados da conta</div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="nome">
            {ehAdotante ? 'Nome completo' : 'Nome do abrigo'}
          </label>
          <input
            id="nome"
            className="auth-input"
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder={ehAdotante ? 'Ana Silva' : 'Lar dos Focinhos'}
            autoComplete={ehAdotante ? 'name' : 'organization'}
            required
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
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              minLength={6}
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

        {ehAdotante ? (
          <>
            <div className="auth-section-label">Dados pessoais</div>

            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label" htmlFor="cpf">CPF</label>
                <input
                  id="cpf"
                  className="auth-input"
                  type="text"
                  inputMode="numeric"
                  value={cpf}
                  onChange={e => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="nascimento">Nascimento</label>
                <input
                  id="nascimento"
                  className="auth-input"
                  type="date"
                  value={dataNascimento}
                  onChange={e => setDataNascimento(e.target.value)}
                  required
                />
              </div>
            </div>

            <label className={`auth-option ${larTemporario ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={larTemporario}
                onChange={e => setLarTemporario(e.target.checked)}
              />
              <span className="auth-option-text">
                Quero oferecer <strong>lar temporário</strong> para animais que
                precisam de um cantinho enquanto esperam a adoção.
              </span>
            </label>
          </>
        ) : (
          <>
            <div className="auth-section-label">Dados do abrigo</div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="cnpj">CNPJ</label>
              <input
                id="cnpj"
                className="auth-input"
                type="text"
                inputMode="numeric"
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
                placeholder="Associação Lar dos Focinhos"
                required
              />
            </div>
          </>
        )}

        {erro && (
          <div className="auth-error" role="alert">
            <IconAlerta /> {erro}
          </div>
        )}

        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading
            ? <><span className="auth-spinner" /> Cadastrando…</>
            : ehAdotante ? 'Criar minha conta →' : 'Cadastrar meu abrigo →'}
        </button>
      </form>

      <p className="auth-footer">
        Já tem uma conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  )
}

export default Cadastro