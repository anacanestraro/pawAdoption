/**
 * Voluntarios.tsx — PawAdoption
 * Rota: /home/voluntarios
 *
 * ABRIGO → gestão dos voluntários do abrigo
 *   GET /voluntarios/recebidos      → todos os voluntários do abrigo logado
 *   PUT /voluntarios/aprovar/:id    → PENDENTE → ATIVO
 *   PUT /voluntarios/rejeitar/:id   → PENDENTE → REJEITADO
 *   PUT /voluntarios/inativar/:id   → ATIVO → INATIVO
 *   GET /voluntarios/lares_temporarios → adotantes disponíveis como lar temporário (aba própria)
 *
 * ADOTANTE → acompanhamento das próprias candidaturas
 *   GET /voluntarios/minhas_solicitacoes
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import '../styles/Feed.css'

// ─── Tipos locais ─────────────────────────────────────────────────────────────

type StatusVoluntario = 'PENDENTE' | 'ATIVO' | 'INATIVO' | 'REJEITADO'
type Acao = 'aprovar' | 'rejeitar' | 'inativar'
type Filtro = 'PENDENTE' | 'ATIVO' | 'TODOS'

interface Contato {
  id: number
  nome: string
  email: string
  telefone?: string | null
}

interface Voluntario {
  id: number
  adotante_id: number
  abrigo_id: number
  disponibilidade?: string | null
  habilidades?: string | null
  status: StatusVoluntario
  data_cadastro: string
  adotante?: { usuario_id: number; usuario: Contato }
  abrigo?: { usuario_id: number; razao_social?: string; usuario: Contato }
}

interface LarTemporario {
  usuario_id: number
  capacidade_lar_temporario?: number | null
  usuario: Contato & {
    endereco?: { bairro?: string; cidade: string; estado: string } | null
  }
}

type AbaAbrigo = 'voluntarios' | 'lares'

interface ModalState {
  voluntario: Voluntario
  acao:       Acao
  loading:    boolean
  erro:       string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_INFO: Record<StatusVoluntario, { label: string; bg: string; fg: string; border: string }> = {
  PENDENTE:  { label: 'Pendente',  bg: '#FFF3CD', fg: '#856404', border: '#FFECB5' },
  ATIVO:     { label: 'Ativo',     bg: '#E3F4EA', fg: '#2F7A50', border: '#BFE3CC' },
  INATIVO:   { label: 'Inativo',   bg: '#F1F1F4', fg: '#5A6070', border: '#DADCE3' },
  REJEITADO: { label: 'Rejeitado', bg: '#FFF5F5', fg: '#842029', border: '#f5c2c7' },
}

const ACAO_TEXTO: Record<Acao, { titulo: string; botao: string; cor: string; descricao: (nome: string) => string }> = {
  aprovar: {
    titulo: 'Aprovar voluntário', botao: 'Confirmar aprovação', cor: 'var(--blue)',
    descricao: n => `${n} passará a fazer parte da equipe de voluntários do abrigo.`,
  },
  rejeitar: {
    titulo: 'Rejeitar candidatura', botao: 'Confirmar rejeição', cor: '#842029',
    descricao: n => `A candidatura de ${n} será rejeitada.`,
  },
  inativar: {
    titulo: 'Inativar voluntário', botao: 'Confirmar inativação', cor: '#842029',
    descricao: n => `${n} deixará de constar como voluntário ativo do abrigo.`,
  },
}

const formatarData = (d?: string) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—'

const iniciais = (nome: string) =>
  nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  voluntario: Voluntario
  ehAbrigo:   boolean
  onAcao:     (v: Voluntario, acao: Acao) => void
}

const VoluntarioCard = ({ voluntario, ehAbrigo, onAcao }: CardProps) => {
  const info = STATUS_INFO[voluntario.status]

  // Abrigo vê o voluntário; adotante vê o abrigo
  const contato = ehAbrigo ? voluntario.adotante?.usuario : voluntario.abrigo?.usuario
  const nome    = ehAbrigo
    ? contato?.nome ?? 'Voluntário'
    : voluntario.abrigo?.razao_social || contato?.nome || 'Abrigo'

  const blocoTexto = (titulo: string, texto?: string | null) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
        {titulo}
      </span>
      <span style={{ fontSize: '0.84rem', color: texto ? 'var(--ink-2)' : 'var(--ink-3)', lineHeight: 1.5 }}>
        {texto || 'Não informado'}
      </span>
    </div>
  )

  return (
    <div style={{
      background: 'var(--paper)',
      border: '1.5px solid var(--line)',
      borderRadius: 18,
      padding: '18px 18px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: ehAbrigo ? 'var(--blue-50)' : 'var(--orange-50)',
          color: ehAbrigo ? 'var(--blue)' : 'var(--orange)',
          border: `1.5px solid ${ehAbrigo ? 'var(--blue-100)' : 'var(--orange-100)'}`,
          display: 'grid', placeItems: 'center',
          fontFamily: "'Baloo 2', system-ui", fontWeight: 800, fontSize: '0.95rem',
        }}>
          {ehAbrigo ? iniciais(nome) : '🏠'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Baloo 2', system-ui", fontSize: '1rem', fontWeight: 800,
            color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {nome}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--ink-3)' }}>
            Candidatura em {formatarData(voluntario.data_cadastro)}
          </div>
        </div>
        <span style={{
          background: info.bg, color: info.fg, border: `1px solid ${info.border}`,
          fontSize: 10, fontWeight: 800, padding: '3px 9px',
          borderRadius: 999, letterSpacing: '.04em', textTransform: 'uppercase', flexShrink: 0,
        }}>{info.label}</span>
      </div>

      {/* Contato */}
      {contato && (
        <div style={{
          background: 'var(--cream)', border: '1px solid var(--line)',
          borderRadius: 12, padding: '10px 12px',
          display: 'flex', flexDirection: 'column', gap: 3,
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-2)', wordBreak: 'break-all' }}>
            ✉️ {contato.email}
          </span>
          {contato.telefone && (
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-2)' }}>
              📞 {contato.telefone}
            </span>
          )}
        </div>
      )}

      {blocoTexto('Disponibilidade', voluntario.disponibilidade)}
      {blocoTexto('Habilidades', voluntario.habilidades)}

      {/* Ações (só abrigo) */}
      {ehAbrigo && voluntario.status === 'PENDENTE' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
          <button
            onClick={() => onAcao(voluntario, 'rejeitar')}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              border: '1.5px solid #f5c2c7', background: '#FFF5F5', color: '#842029',
              fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
            }}
          >
            ✕ Rejeitar
          </button>
          <button
            onClick={() => onAcao(voluntario, 'aprovar')}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10, border: 'none',
              background: 'var(--blue)', color: '#fff',
              fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(23,94,168,0.25)',
            }}
          >
            ✓ Aprovar
          </button>
        </div>
      )}

      {ehAbrigo && voluntario.status === 'ATIVO' && (
        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          <button
            onClick={() => onAcao(voluntario, 'inativar')}
            style={{
              width: '100%', padding: '8px 0', borderRadius: 10,
              border: '1.5px solid var(--line-2)', background: 'transparent', color: 'var(--ink-2)',
              fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
            }}
          >
            Inativar voluntário
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Modal de confirmação ─────────────────────────────────────────────────────

interface ModalProps {
  modal:     ModalState
  onConfirm: () => void
  onClose:   () => void
}

const Modal = ({ modal, onConfirm, onClose }: ModalProps) => {
  const texto = ACAO_TEXTO[modal.acao]
  const nome  = modal.voluntario.adotante?.usuario.nome ?? 'O voluntário'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget && !modal.loading) onClose() }}
    >
      <div style={{
        background: 'var(--paper)', borderRadius: 20,
        padding: '28px 26px', width: '100%', maxWidth: 420,
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ fontFamily: "'Baloo 2', system-ui", fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)' }}>
          {texto.titulo}
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
          {texto.descricao(nome)}
        </p>

        {modal.erro && (
          <div style={{
            background: '#FFF5F5', border: '1.5px solid #f5c2c7',
            borderRadius: 10, padding: '10px 13px',
            fontSize: '0.82rem', fontWeight: 700, color: '#842029',
          }}>
            ⚠️ {modal.erro}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={onClose}
            disabled={modal.loading}
            style={{
              padding: '9px 20px', borderRadius: 10,
              border: '1.5px solid var(--line-2)', background: 'transparent', color: 'var(--ink-2)',
              fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Voltar
          </button>
          <button
            onClick={onConfirm}
            disabled={modal.loading}
            style={{
              padding: '9px 22px', borderRadius: 10, border: 'none',
              background: texto.cor, color: '#fff',
              fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
              opacity: modal.loading ? 0.65 : 1, minWidth: 110,
            }}
          >
            {modal.loading ? '…' : texto.botao}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Aba de lares temporários (só abrigo) ─────────────────────────────────────

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const LarCard = ({ lar }: { lar: LarTemporario }) => {
  const { usuario: u } = lar
  const end = u.endereco
  const capacidade = lar.capacidade_lar_temporario

  return (
    <div style={{
      background: 'var(--paper)', border: '1.5px solid var(--line)',
      borderRadius: 18, padding: '18px 18px 16px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: 'var(--orange-50)', color: 'var(--orange)',
          border: '1.5px solid var(--orange-100)',
          display: 'grid', placeItems: 'center',
          fontFamily: "'Baloo 2', system-ui", fontWeight: 800, fontSize: '0.95rem',
        }}>
          {iniciais(u.nome)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Baloo 2', system-ui", fontSize: '1rem', fontWeight: 800,
            color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {u.nome}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--ink-3)' }}>
            {end ? [end.bairro, `${end.cidade}/${end.estado}`].filter(Boolean).join(' · ') : 'Localização não informada'}
          </div>
        </div>
        <span style={{
          background: 'var(--blue-50)', color: 'var(--blue)', border: '1px solid var(--blue-100)',
          fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 999,
          letterSpacing: '.04em', textTransform: 'uppercase', flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          {capacidade ? `Até ${capacidade} pet${capacidade !== 1 ? 's' : ''}` : 'Lar temp.'}
        </span>
      </div>

      <div style={{
        background: 'var(--cream)', border: '1px solid var(--line)',
        borderRadius: 12, padding: '10px 12px',
        display: 'flex', flexDirection: 'column', gap: 3,
      }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--ink-2)', wordBreak: 'break-all' }}>
          ✉️ {u.email}
        </span>
        {u.telefone && (
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-2)' }}>
            📞 {u.telefone}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <a
          href={`mailto:${u.email}?subject=${encodeURIComponent('Lar temporário — PawAdoption')}`}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 10, textAlign: 'center',
            background: 'var(--blue)', color: '#fff', textDecoration: 'none',
            fontSize: '0.82rem', fontWeight: 800,
            boxShadow: '0 2px 8px rgba(23,94,168,0.25)',
          }}
        >
          Enviar email
        </a>
        {u.telefone && (
          <a
            href={`tel:${u.telefone}`}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10, textAlign: 'center',
              border: '1.5px solid var(--line-2)', color: 'var(--ink-2)', textDecoration: 'none',
              fontSize: '0.82rem', fontWeight: 800,
            }}
          >
            Ligar
          </a>
        )}
      </div>
    </div>
  )
}

const AbaLaresTemporarios = () => {
  const [lares,   setLares]   = useState<LarTemporario[]>([])
  const [busca,   setBusca]   = useState('')
  const [loading, setLoading] = useState(true)
  const [erro,    setErro]    = useState('')

  const fetchLares = async () => {
    setLoading(true)
    setErro('')
    try {
      const { data } = await api.get<LarTemporario[]>('/voluntarios/lares_temporarios')
      setLares(data)
    } catch {
      setErro('Erro ao carregar lares temporários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLares() }, [])

  // Busca por nome, bairro, cidade ou estado (ignora acentos e maiúsculas)
  const termo = normalizar(busca.trim())
  const visiveis = termo
    ? lares.filter(l => normalizar([
        l.usuario.nome,
        l.usuario.endereco?.bairro ?? '',
        l.usuario.endereco?.cidade ?? '',
        l.usuario.endereco?.estado ?? '',
      ].join(' ')).includes(termo))
    : lares

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="search"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="🔍 Buscar por nome, bairro ou cidade…"
          aria-label="Buscar lares temporários"
          style={{
            flex: '1 1 260px', maxWidth: 420,
            padding: '10px 16px', borderRadius: 999,
            border: '1.5px solid var(--line-2)', background: 'var(--paper)', color: 'var(--ink)',
            fontFamily: "'Nunito', system-ui", fontSize: '0.88rem', fontWeight: 600, outline: 'none',
          }}
        />
        {!loading && !erro && (
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-3)' }}>
            {visiveis.length} lar{visiveis.length !== 1 ? 'es' : ''} disponíve{visiveis.length !== 1 ? 'is' : 'l'}
          </span>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏡</div>
          Carregando…
        </div>
      )}

      {!loading && erro && (
        <div style={{
          background: '#FFF5F5', border: '1.5px solid #f5c2c7',
          borderRadius: 12, padding: '16px 20px',
          color: '#842029', fontWeight: 700, fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span>⚠️ {erro}</span>
          <button onClick={fetchLares} style={{
            background: 'none', border: 'none', color: '#842029',
            fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem',
          }}>Tentar novamente</button>
        </div>
      )}

      {!loading && !erro && visiveis.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '70px 0', color: 'var(--ink-3)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 44 }}>🏡</div>
          <div style={{ fontFamily: "'Baloo 2', system-ui", fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-2)' }}>
            {termo ? 'Nenhum lar encontrado para essa busca' : 'Nenhum lar temporário disponível'}
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            {termo
              ? 'Tente buscar por outra cidade ou bairro.'
              : 'Adotantes que se oferecerem como lar temporário no cadastro aparecem aqui.'}
          </div>
        </div>
      )}

      {!loading && !erro && visiveis.length > 0 && (
        <div className="vol-grid">
          {visiveis.map(l => <LarCard key={l.usuario_id} lar={l} />)}
        </div>
      )}
    </>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export const Voluntarios = () => {
  const { usuario } = useAuth()
  const ehAbrigo = usuario?.tipo_usuario === 'ABRIGO'

  const [aba,         setAba]         = useState<AbaAbrigo>('voluntarios')
  const [filtro,      setFiltro]      = useState<Filtro>(ehAbrigo ? 'PENDENTE' : 'TODOS')
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([])
  const [loading,     setLoading]     = useState(true)
  const [erro,        setErro]        = useState('')
  const [modal,       setModal]       = useState<ModalState | null>(null)

  const fetchVoluntarios = async () => {
    setLoading(true)
    setErro('')
    try {
      const rota = ehAbrigo ? '/voluntarios/recebidos' : '/voluntarios/minhas_solicitacoes'
      const { data } = await api.get<Voluntario[]>(rota)
      setVoluntarios(data)
    } catch {
      setErro('Erro ao carregar voluntários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVoluntarios() }, [ehAbrigo])

  const visiveis = filtro === 'TODOS'
    ? voluntarios
    : voluntarios.filter(v => v.status === filtro)

  const contar = (s: StatusVoluntario) => voluntarios.filter(v => v.status === s).length

  const confirmar = async () => {
    if (!modal) return
    setModal(m => m ? { ...m, loading: true, erro: '' } : m)
    try {
      const { data } = await api.put<Voluntario>(`/voluntarios/${modal.acao}/${modal.voluntario.id}`)
      // Atualiza só o status localmente, mantendo os dados de contato
      setVoluntarios(prev => prev.map(v => v.id === data.id ? { ...v, status: data.status } : v))
      setModal(null)
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Erro ao atualizar voluntário.'
      setModal(m => m ? { ...m, loading: false, erro: msg } : m)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const botaoFiltro = (valor: Filtro, label: string) => (
    <button
      key={valor}
      onClick={() => setFiltro(valor)}
      style={{
        padding: '5px 12px', borderRadius: 999,
        border: `1.5px solid ${filtro === valor ? 'var(--blue-100)' : 'var(--line)'}`,
        background: filtro === valor ? 'var(--blue-50)' : 'transparent',
        color: filtro === valor ? 'var(--blue)' : 'var(--ink-3)',
        fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="feed-page">
      <style>{`
        .vol-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .vol-body { padding: 28px 80px 48px; }
        @media (max-width: 991.98px) { .vol-body { padding: 20px 24px 40px; } }
        @media (max-width: 600px)    { .vol-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header */}
      <div className="feed-header">
        <h1 className="feed-title">
          {!ehAbrigo ? 'Minhas candidaturas' : aba === 'lares' ? 'Lares temporários' : 'Voluntários'}
          {!loading && ehAbrigo && aba === 'voluntarios' && (
            <span className="feed-count">{contar('ATIVO')} ativo{contar('ATIVO') !== 1 ? 's' : ''}</span>
          )}
        </h1>
        <p className="feed-subtitle">
          {!ehAbrigo
            ? 'Acompanhe o andamento das suas candidaturas de voluntariado nos abrigos.'
            : aba === 'lares'
              ? 'Adotantes que se ofereceram como lar temporário. Encontre alguém perto e entre em contato.'
              : 'Avalie as candidaturas de voluntariado e gerencie a equipe do seu abrigo.'}
        </p>

        {ehAbrigo && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {([['voluntarios', 'Voluntários'], ['lares', 'Lares temporários']] as const).map(([valor, label]) => (
              <button
                key={valor}
                onClick={() => setAba(valor)}
                style={{
                  padding: '8px 18px', borderRadius: 999,
                  border: aba === valor ? 'none' : '1.5px solid var(--line-2)',
                  background: aba === valor ? 'var(--blue)' : 'transparent',
                  color: aba === valor ? '#fff' : 'var(--ink-2)',
                  fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="vol-body">
        {aba === 'lares' && ehAbrigo ? <AbaLaresTemporarios /> : <>
        {/* Filtro (só abrigo) */}
        {ehAbrigo && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {botaoFiltro('PENDENTE', `Pendentes${!loading ? ` (${contar('PENDENTE')})` : ''}`)}
            {botaoFiltro('ATIVO', `Ativos${!loading ? ` (${contar('ATIVO')})` : ''}`)}
            {botaoFiltro('TODOS', 'Todos')}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🐾</div>
            Carregando…
          </div>
        )}

        {!loading && erro && (
          <div style={{
            background: '#FFF5F5', border: '1.5px solid #f5c2c7',
            borderRadius: 12, padding: '16px 20px',
            color: '#842029', fontWeight: 700, fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <span>⚠️ {erro}</span>
            <button onClick={fetchVoluntarios} style={{
              background: 'none', border: 'none', color: '#842029',
              fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem',
            }}>Tentar novamente</button>
          </div>
        )}

        {!loading && !erro && visiveis.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '70px 0', color: 'var(--ink-3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            <div style={{ fontSize: 44 }}>🤝</div>
            <div style={{ fontFamily: "'Baloo 2', system-ui", fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-2)' }}>
              {ehAbrigo ? 'Nenhum voluntário por aqui' : 'Você ainda não se candidatou'}
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              {ehAbrigo
                ? 'Quando alguém se candidatar como voluntário no seu abrigo, aparece aqui.'
                : <>Conheça os <Link to="/abrigos" style={{ color: 'var(--blue)', fontWeight: 800 }}>abrigos</Link> e ofereça sua ajuda.</>}
            </div>
          </div>
        )}

        {!loading && !erro && visiveis.length > 0 && (
          <div className="vol-grid">
            {visiveis.map(v => (
              <VoluntarioCard
                key={v.id}
                voluntario={v}
                ehAbrigo={ehAbrigo}
                onAcao={(vol, acao) => setModal({ voluntario: vol, acao, loading: false, erro: '' })}
              />
            ))}
          </div>
        )}
        </>}
      </div>

      {modal && (
        <Modal
          modal={modal}
          onConfirm={confirmar}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}