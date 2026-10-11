/**
 * Solicitacoes.tsx — PawAdoption
 * Rota: /home/solicitacoes
 *
 * Endpoints:
 *   GET /solicitacoes/recebidas                → pedidos para os animais do usuário logado (abrigo ou tutor)
 *   GET /solicitacoes/minhas                   → pedidos feitos pelo adotante logado
 *   PUT /solicitacoes/atualizarSolicitacao/:id → { status: 'APROVADA' | 'REJEITADA' | 'CANCELADA' }
 *
 * ABRIGO vê só "Recebidas". ADOTANTE vê "Recebidas" (animais que ele anunciou)
 * e "Enviadas" (pedidos que ele fez).
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import type { Animal, SolicitacaoAdocao } from '../types'
import '../styles/Feed.css'

// ─── Tipos locais ─────────────────────────────────────────────────────────────

type StatusSolicitacao = SolicitacaoAdocao['status']
type Acao = 'APROVADA' | 'REJEITADA' | 'CANCELADA'
type Aba = 'recebidas' | 'enviadas'
type Filtro = 'PENDENTE' | 'TODAS'

interface SolicitacaoDetalhada extends SolicitacaoAdocao {
  animal: Animal
  adotante: {
    usuario_id: number
    usuario: {
      id: number
      nome: string
      email: string
      telefone?: string | null
    }
  }
}

interface ModalState {
  solicitacao: SolicitacaoDetalhada
  acao:        Acao
  loading:     boolean
  erro:        string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_INFO: Record<StatusSolicitacao, { label: string; bg: string; fg: string; border: string }> = {
  PENDENTE:  { label: 'Pendente',  bg: '#FFF3CD', fg: '#856404', border: '#FFECB5' },
  APROVADA:  { label: 'Aprovada',  bg: '#E3F4EA', fg: '#2F7A50', border: '#BFE3CC' },
  REJEITADA: { label: 'Rejeitada', bg: '#FFF5F5', fg: '#842029', border: '#f5c2c7' },
  CANCELADA: { label: 'Cancelada', bg: '#F1F1F4', fg: '#5A6070', border: '#DADCE3' },
}

const formatarData = (d?: Date | string) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—'

const especieEmoji = (e: string) => {
  const l = e.toLowerCase()
  if (l.includes('gat')) return '🐱'
  if (l.includes('coelh')) return '🐇'
  if (l.includes('ave') || l.includes('pass')) return '🦜'
  return '🐕'
}

const ACAO_TEXTO: Record<Acao, { titulo: string; botao: string; cor: string }> = {
  APROVADA:  { titulo: 'Aprovar adoção',      botao: 'Confirmar aprovação',   cor: 'var(--blue)' },
  REJEITADA: { titulo: 'Rejeitar solicitação', botao: 'Confirmar rejeição',    cor: '#842029' },
  CANCELADA: { titulo: 'Cancelar solicitação', botao: 'Confirmar cancelamento', cor: '#842029' },
}

// ─── Card de solicitação ──────────────────────────────────────────────────────

interface CardProps {
  solicitacao: SolicitacaoDetalhada
  aba:         Aba
  onAcao:      (s: SolicitacaoDetalhada, acao: Acao) => void
}

const SolicitacaoCard = ({ solicitacao, aba, onAcao }: CardProps) => {
  const { animal, adotante, status } = solicitacao
  const info    = STATUS_INFO[status]
  const fotoUrl = animal.fotos?.[0]?.url_foto
    ? `${import.meta.env.VITE_API_URL}${animal.fotos[0].url_foto}`
    : null
  const pendente = status === 'PENDENTE'

  return (
    <div style={{
      background: 'var(--paper)',
      border: '1.5px solid var(--line)',
      borderRadius: 18,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Foto */}
      <div style={{ position: 'relative', height: 160, flexShrink: 0 }}>
        {fotoUrl ? (
          <img src={fotoUrl} alt={animal.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #FFD9B0 0%, #E8A87C 100%)',
            display: 'grid', placeItems: 'center',
          }}>
            <span style={{ fontSize: 40, opacity: 0.6 }}>{especieEmoji(animal.especie)}</span>
          </div>
        )}

        <span style={{
          position: 'absolute', top: 10, left: 10,
          background: info.bg, color: info.fg, border: `1px solid ${info.border}`,
          fontSize: 10, fontWeight: 800, padding: '3px 9px',
          borderRadius: 999, letterSpacing: '.04em', textTransform: 'uppercase',
        }}>{info.label}</span>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <Link to={`/adotar/${animal.id}`} style={{
            fontFamily: "'Baloo 2', system-ui",
            fontSize: '1rem', fontWeight: 800, color: 'var(--ink)', textDecoration: 'none',
          }}>
            {animal.nome}
          </Link>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginTop: 2 }}>
            {animal.raca || animal.especie}
          </div>
        </div>

        {/* Quem pediu (só em Recebidas) */}
        {aba === 'recebidas' && (
          <div style={{
            background: 'var(--cream)', border: '1px solid var(--line)',
            borderRadius: 12, padding: '10px 12px',
            display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Interessado
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--ink)' }}>
              {adotante.usuario.nome}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-2)', wordBreak: 'break-all' }}>
              ✉️ {adotante.usuario.email}
            </span>
            {adotante.usuario.telefone && (
              <span style={{ fontSize: '0.78rem', color: 'var(--ink-2)' }}>
                📞 {adotante.usuario.telefone}
              </span>
            )}
          </div>
        )}

        {/* Datas */}
        <div style={{ fontSize: '0.76rem', color: 'var(--ink-3)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span>Solicitado em {formatarData(solicitacao.data_solicitacao)}</span>
          {solicitacao.data_resposta && (
            <span>Respondido em {formatarData(solicitacao.data_resposta)}</span>
          )}
        </div>

        {/* Ações */}
        {pendente && aba === 'recebidas' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
            <button
              onClick={() => onAcao(solicitacao, 'REJEITADA')}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 10,
                border: '1.5px solid #f5c2c7', background: '#FFF5F5', color: '#842029',
                fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
              }}
            >
              ✕ Rejeitar
            </button>
            <button
              onClick={() => onAcao(solicitacao, 'APROVADA')}
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

        {pendente && aba === 'enviadas' && (
          <div style={{ marginTop: 'auto', paddingTop: 4 }}>
            <button
              onClick={() => onAcao(solicitacao, 'CANCELADA')}
              style={{
                width: '100%', padding: '8px 0', borderRadius: 10,
                border: '1.5px solid var(--line-2)', background: 'transparent', color: 'var(--ink-2)',
                fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
              }}
            >
              Cancelar solicitação
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Modal de confirmação ─────────────────────────────────────────────────────

interface ModalProps {
  modal:          ModalState
  outrasPendentes: number
  onConfirm:      () => void
  onClose:        () => void
}

const Modal = ({ modal, outrasPendentes, onConfirm, onClose }: ModalProps) => {
  const texto = ACAO_TEXTO[modal.acao]
  const { animal, adotante } = modal.solicitacao

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
        <div style={{
          fontFamily: "'Baloo 2', system-ui",
          fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)',
        }}>
          {texto.titulo}
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
          {modal.acao === 'APROVADA' && (
            <>
              <strong>{animal.nome}</strong> será marcado como adotado por{' '}
              <strong>{adotante.usuario.nome}</strong>.
              {outrasPendentes > 0 && (
                <> As outras {outrasPendentes} solicitaç{outrasPendentes === 1 ? 'ão pendente' : 'ões pendentes'} para este animal serão rejeitadas automaticamente.</>
              )}
            </>
          )}
          {modal.acao === 'REJEITADA' && (
            <>A solicitação de <strong>{adotante.usuario.nome}</strong> para <strong>{animal.nome}</strong> será rejeitada.</>
          )}
          {modal.acao === 'CANCELADA' && (
            <>Sua solicitação para adotar <strong>{animal.nome}</strong> será cancelada.</>
          )}
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

// ─── Página principal ─────────────────────────────────────────────────────────

export const Solicitacoes = () => {
  const { usuario } = useAuth()
  const ehAdotante = usuario?.tipo_usuario === 'ADOTANTE'

  const [aba,          setAba]          = useState<Aba>('recebidas')
  const [filtro,       setFiltro]       = useState<Filtro>('PENDENTE')
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoDetalhada[]>([])
  const [loading,      setLoading]      = useState(true)
  const [erro,         setErro]         = useState('')
  const [modal,        setModal]        = useState<ModalState | null>(null)

  const fetchSolicitacoes = async () => {
    setLoading(true)
    setErro('')
    try {
      const rota = aba === 'recebidas' ? '/solicitacoes/recebidas' : '/solicitacoes/minhas'
      const { data } = await api.get<SolicitacaoDetalhada[]>(rota)
      setSolicitacoes(data)
    } catch {
      setErro('Erro ao carregar solicitações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSolicitacoes() }, [aba])

  const visiveis = filtro === 'PENDENTE'
    ? solicitacoes.filter(s => s.status === 'PENDENTE')
    : solicitacoes

  const totalPendentes = solicitacoes.filter(s => s.status === 'PENDENTE').length

  const outrasPendentes = modal
    ? solicitacoes.filter(s =>
        s.animal_id === modal.solicitacao.animal_id &&
        s.status === 'PENDENTE' &&
        s.id !== modal.solicitacao.id
      ).length
    : 0

  const abrirModal = (solicitacao: SolicitacaoDetalhada, acao: Acao) =>
    setModal({ solicitacao, acao, loading: false, erro: '' })

  const confirmar = async () => {
    if (!modal) return
    setModal(m => m ? { ...m, loading: true, erro: '' } : m)
    try {
      await api.put(`/solicitacoes/atualizarSolicitacao/${modal.solicitacao.id}`, {
        status: modal.acao,
      })
      setModal(null)
      // Recarrega: a aprovação também rejeita outras solicitações do mesmo animal
      fetchSolicitacoes()
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Erro ao atualizar solicitação.'
      setModal(m => m ? { ...m, loading: false, erro: msg } : m)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const botaoAba = (valor: Aba, label: string) => (
    <button
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
  )

  const botaoFiltro = (valor: Filtro, label: string) => (
    <button
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
        .sol-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .sol-body { padding: 28px 80px 48px; }
        @media (max-width: 991.98px) { .sol-body { padding: 20px 24px 40px; } }
        @media (max-width: 600px)    { .sol-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header */}
      <div className="feed-header">
        <h1 className="feed-title">
          Solicitações de adoção
          {!loading && <span className="feed-count">{totalPendentes} pendente{totalPendentes !== 1 ? 's' : ''}</span>}
        </h1>
        <p className="feed-subtitle">
          {aba === 'recebidas'
            ? 'Pedidos de adoção para os animais que você anunciou. Aprove ou rejeite cada um.'
            : 'Acompanhe o andamento dos pedidos de adoção que você fez.'}
        </p>

        {ehAdotante && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {botaoAba('recebidas', 'Recebidas')}
            {botaoAba('enviadas', 'Enviadas')}
          </div>
        )}
      </div>

      <div className="sol-body">
        {/* Filtro */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {botaoFiltro('PENDENTE', 'Pendentes')}
          {botaoFiltro('TODAS', 'Todas')}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🐾</div>
            Carregando solicitações…
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
            <button onClick={fetchSolicitacoes} style={{
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
            <div style={{ fontSize: 44 }}>📭</div>
            <div style={{ fontFamily: "'Baloo 2', system-ui", fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-2)' }}>
              Nenhuma solicitação {filtro === 'PENDENTE' ? 'pendente' : 'por aqui'}
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              {aba === 'recebidas'
                ? 'Quando alguém pedir para adotar um dos seus animais, o pedido aparece aqui.'
                : <>Encontre um amigo no <Link to="/home" style={{ color: 'var(--blue)', fontWeight: 800 }}>feed de animais</Link>.</>}
            </div>
          </div>
        )}

        {!loading && !erro && visiveis.length > 0 && (
          <div className="sol-grid">
            {visiveis.map(s => (
              <SolicitacaoCard key={s.id} solicitacao={s} aba={aba} onAcao={abrirModal} />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal
          modal={modal}
          outrasPendentes={outrasPendentes}
          onConfirm={confirmar}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}