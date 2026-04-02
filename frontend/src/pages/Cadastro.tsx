import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import cachorro from '../assets/cachorro.png'
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
        await api.post('/abrigos/cadastrar', { nome, email, senha, cnpj, razao_social: razaoSocial })
      }
      navigate('/login')
    } catch {
      setErro('Erro ao cadastrar. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row"
      style={{ background: '#F5ECD7' }}>
      <style>{`
        .blob-shape {
          border-radius: 40% 60% 55% 45% / 50% 40% 60% 50%;
        }
        .blob-wrapper {
          display: none;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          flex: 1;
          margin-left: 100px;
          position: relative;
        }
        @media (min-width: 992px) {
          .blob-wrapper { display: flex; }
        }
        .blob-inner {
          background: #D4845A;
          width: clamp(300px, 35vw, 700px);
          height: clamp(300px, 35vw, 700px);
        }
        .cadastro-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          width: 100%;
        }
        @media (min-width: 992px) {
          .cadastro-wrapper {
            padding: 3rem;
            width: 1020px;
          }
        }
        .cadastro-card {
          width: 100%;
          max-width: 505px;
          background: #E8A87C;
          border-radius: 18px;
        }
        .cadastro-card .form-control {
          background: #fff6e2;
          border: none;
          color: #7B4A2D;
          font-size: 15px;
        }
        .cadastro-card .form-control:focus {
          background: #fff6e2;
          box-shadow: 0 0 0 2.5px #7B4A2D;
          color: #7B4A2D;
        }
        .cadastro-card .form-label {
          color: #7B4A2D;
          font-weight: 600;
          font-size: 15px;
        }
        .cadastro-card .form-check-label {
          color: #7B4A2D;
          font-size: 15px;
        }
        .cadastro-card .form-check-input:checked {
          background-color: #7B4A2D;
          border-color: #7B4A2D;
        }
        .tipo-btn {
          flex: 1;
          padding: 10px;
          border: 2px solid #7B4A2D;
          background: transparent;
          color: #7B4A2D;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .tipo-btn:first-child { border-radius: 8px 0 0 8px; }
        .tipo-btn:last-child  { border-radius: 0 8px 8px 0; }
        .tipo-btn.active {
          background: #7B4A2D;
          color: #F5ECD7;
        }
        .tipo-btn:not(.active):hover { background: rgba(123,74,45,0.1); }
        .link-login {
          color: #3D2314;
          font-weight: 900;
          text-decoration: none;
        }
        .link-login:hover { text-decoration: underline; color: #3D2314; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cadastro-card { animation: fadeIn 0.45s ease both; }
        .cadastro-card-padding { padding: 2rem !important; }
        @media (min-width: 576px) {
          .cadastro-card-padding { padding: 3rem !important; }
        }
        .cadastro-title { font-size: 36px; }
        @media (min-width: 576px) {
          .cadastro-title { font-size: 50px; }
        }
      `}</style>

      {/* Blob side */}
      <div className="blob-wrapper">
        <div className="blob-shape blob-inner d-flex align-items-center justify-content-center" />
        <img
          src={cachorro}
          alt="cachorro"
          style={{ position: 'absolute', width: '58%', height: 'auto', zIndex: 1 }}
        />
      </div>

      {/* Cadastro card side */}
      <div className="cadastro-wrapper">
        <div className="cadastro-card cadastro-card-padding">
          <h1 className="fw-bold mb-1 cadastro-title" style={{ color: '#3D2314', letterSpacing: '-0.5px' }}>
            PawAdoption
          </h1>
          <p className="fw-bold mb-4" style={{ fontSize: 21, color: '#7B4A2D' }}>
            Crie sua conta!
          </p>

          {/* Seletor de tipo */}
          <div className="d-flex mb-4">
            <button
              type="button"
              className={`tipo-btn ${tipo === 'ADOTANTE' ? 'active' : ''}`}
              onClick={() => setTipo('ADOTANTE')}
            >
              Adotante
            </button>
            <button
              type="button"
              className={`tipo-btn ${tipo === 'ABRIGO' ? 'active' : ''}`}
              onClick={() => setTipo('ABRIGO')}
            >
              Abrigo
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Campos comuns */}
            <div className="mb-3">
              <label className="form-label">Nome</label>
              <input className="form-control" type="text" value={nome}
                onChange={e => setNome(e.target.value)} required autoComplete="name" />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div className="mb-3">
              <label className="form-label">Senha</label>
              <input className="form-control" type="password" value={senha}
                onChange={e => setSenha(e.target.value)} required autoComplete="new-password" />
            </div>

            {/* Campos Adotante */}
            {tipo === 'ADOTANTE' && (
              <>
                <div className="mb-3">
                  <label className="form-label">CPF</label>
                  <input className="form-control" type="text" value={cpf}
                    onChange={e => setCpf(e.target.value)} required placeholder="000.000.000-00" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Data de nascimento</label>
                  <input className="form-control" type="date" value={dataNascimento}
                    onChange={e => setDataNascimento(e.target.value)} required />
                </div>

                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="larTemporario"
                    checked={larTemporario} onChange={e => setLarTemporario(e.target.checked)} />
                  <label className="form-check-label" htmlFor="larTemporario">
                    Quero oferecer lar temporário
                  </label>
                </div>
              </>
            )}

            {/* Campos Abrigo */}
            {tipo === 'ABRIGO' && (
              <>
                <div className="mb-3">
                  <label className="form-label">CNPJ</label>
                  <input className="form-control" type="text" value={cnpj}
                    onChange={e => setCnpj(e.target.value)} required placeholder="00.000.000/0000-00" />
                </div>

                <div className="mb-4">
                  <label className="form-label">Razão social</label>
                  <input className="form-control" type="text" value={razaoSocial}
                    onChange={e => setRazaoSocial(e.target.value)} required />
                </div>
              </>
            )}

            {erro && (
              <div className="alert alert-danger py-2 text-center mb-3" style={{ fontSize: 14 }}>
                {erro}
              </div>
            )}

            <button className="btn btn-primary w-100 fw-bold py-3" type="submit" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0" style={{ fontSize: 16, color: '#7B4A2D' }}>
            Já tem uma conta?{' '}
            <Link to="/login" className="link-login">Entre!</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Cadastro