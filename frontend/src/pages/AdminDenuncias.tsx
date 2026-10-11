/**
 * AdminDenuncias.tsx — PawAdoption
 * Rota: /admin/denuncias
 *
 * Endpoints:
 *   GET /denuncias                     → todas as denúncias (só admin)
 *   PUT /denuncias/resolverDenuncia/:id → { acao: 'REMOVER' | 'MANTER' }
 *
 * REMOVER exclui o anúncio e resolve todas as denúncias pendentes dele.
 * MANTER resolve só a denúncia escolhida.
 */

import { useState, useEffect } from 'react'
import api from '../api/api'
import type { Animal } from '../types'

// ─── Tipos locais ─────────────────────────────────────────────────────────────

type Acao = 'REMOVER' | 'MANTER'
type Filtro = 'PENDENTE' | 'RESOLVIDA' | 'TODAS'

interface UsuarioPublico {
  id: number
  nome: string
  email: string
  telefone?: string | null
  tipo_usuario: 'ADOTANTE' | 'ABRIGO' | 'ADMINISTRADOR'
}

// Omit: no type global, lar_temporario é o id; aqui vem o objeto incluído
interface AnimalDenunciado extends Omit<Animal, 'lar_temporario'> {
  abrigo?:         { usuario_id: number; razao_social?: string; usuario: UsuarioPublico } | null
  lar_temporario?: { usuario_id: number; usuario: UsuarioPublico } | null
}

interface Denuncia {
  id:                  number
  animal_id:           number
  motivo?:             string | null
  status:              'PENDENTE' | 'RESOLVIDA'
  data_denuncia:       string
  data_resolucao?:     string | null
  animal:              AnimalDenunciado
  usuario_denunciante: UsuarioPublico
}

interface ModalState {
  denuncia: Denuncia
  acao:     Acao
  loading:  boolean
  erro:     string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatarData = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const tipoLabel = (t: UsuarioPublico['tipo_usuario']) =>
  t === 'ABRIGO' ? 'Abrigo' : t === 'ADMINISTRADOR' ? 'Administrador' : 'Adotante'

const especieEmoji = (e: string) => {
  const l = e.toLowerCase()
  if (l.includes('gat')) return '🐱'
  if (l.includes('coelh')) return '🐇'
  if (l.includes('ave') || l.includes('pass')) return '🦜'
  return '🐕'
}

const anunciante = (a: AnimalDenunciado) =>
  a.abrigo
    ? { tipo: 'Abrigo', nome: a.abrigo.razao_social || a.abrigo.usuario.nome, email: a.abrigo.usuario.email }
    : a.lar_temporario
      ? { tipo: 'Lar temporário', nome: a.lar_temporario.usuario.nome, email: a.lar_temporario.usuario.email }
      : { tipo: '—', nome: '—', email: '' }

// ─── Card de denúncia ─────────────────────────────────────────────────────────

interface CardProps {
  denuncia:       Denuncia
  totalDoAnimal:  number
  onAcao:         (d: Denuncia, acao: Acao) => void
}

const DenunciaCard = ({ denuncia, totalDoAnimal, onAcao }: CardProps) => {
  const { animal } = denuncia
  const pendente  = denuncia.status === 'PENDENTE'
  const removido  = !!animal.deleted_at
  const anun      = anunciante(animal)
  const fotoUrl   = animal.fotos?.[0]?.url_foto
    ? `${import.meta.env.VITE_API_URL}${animal.fotos[0].url_foto}`
    : null

  const rotulo = (texto: string) => (
    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
      {texto}
    </span>
  )

  return (
    <div style={{
      background: 'var(--paper)',
      border: `1.5px solid ${pendente ? '#f5c2c7' : 'var(--line)'}`,
      borderRadius: 18, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Animal */}
      <div style={{ display: 'flex', gap: 12, padding: 14, borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
          background: 'linear-gradient(135deg, #FFD9B0 0%, #E8A87C 100%)',
          display: 'grid', placeItems: 'center', fontSize: 28,
          filter: removido ? 'grayscale(1)' : undefined,
        }}>
          {fotoUrl
            ? <img src={fotoUrl} alt={animal.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : especieEmoji(animal.especie)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Baloo 2', system-ui", fontSize: '1rem', fontWeight: 800, color: 'var(--ink)' }}>
              {animal.nome}
            </span>
            {removido && (
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                background: '#F1F1F4', color: '#5A6070', border: '1px solid #DADCE3',
              }}>REMOVIDO</span>
            )}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--ink-3)' }}>
            {animal.raca || animal.especie} · {anun.tipo}: {anun.nome}
          </div>
          {anun.email && (
            <div style={{ fontSize: '0.74rem', color: 'var(--ink-3)', wordBreak: 'break-all' }}>{anun.email}</div>
          )}
        </div>
        <span style={{
          flexShrink: 0, alignSelf: 'flex-start',
          fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 999,
          letterSpacing: '.04em', textTransform: 'uppercase',
          ...(pendente
            ? { background: '#FFF5F5', color: '#842029', border: '1px solid #f5c2c7' }
            : { background: '#E3F4EA', color: '#2F7A50', border: '1px solid #BFE3CC' }),
        }}>
          {pendente ? 'Pendente' : 'Resolvida'}
        </span>
      </div>

      {/* Denúncia */}
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rotulo('Motivo')}
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
            {denuncia.motivo || <em style={{ color: 'var(--ink-3)' }}>Sem motivo informado</em>}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.78rem', color: 'var(--ink-2)' }}>
          {rotulo('Denunciado por')}
          <span>
            <strong>{denuncia.usuario_denunciante.nome}</strong> ({tipoLabel(denuncia.usuario_denunciante.tipo_usuario)})
          </span>
          <span style={{ color: 'var(--ink-3)' }}>
            em {formatarData(denuncia.data_denuncia)}
            {denuncia.data_resolucao && ` · resolvida em ${formatarData(denuncia.data_resolucao)}`}
          </span>
        </div>

        {pendente && totalDoAnimal > 1 && (
          <div style={{
            background: '#FFF3CD', border: '1px solid #FFECB5', color: '#856404',
            borderRadius: 10, padding: '6px 10px', fontSize: '0.76rem', fontWeight: 700,
          }}>
            ⚠️ Este anúncio tem {totalDoAnimal} denúncias pendentes
          </div>
        )}

        {pendente && (
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
            <button
              onClick={() => onAcao(denuncia, 'MANTER')}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 10,
                border: '1.5px solid var(--line-2)', background: 'transparent', color: 'var(--ink-2)',
                fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
              }}
            >
              Manter anúncio
            </button>
            <button
              onClick={() => onAcao(denuncia, 'REMOVER')}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 10, border: 'none',
                background: '#842029', color: '#fff',
                fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
              }}
            >
              Remover anúncio
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
  totalDoAnimal:  number
  onConfirm:      () => void
  onClose:        () => void
}

const Modal = ({ modal, totalDoAnimal, onConfirm, onClose }: ModalProps) => {
  const remover = modal.acao === 'REMOVER'
  const nome    = modal.denuncia.animal.nome

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
          {remover ? 'Remover anúncio' : 'Manter anúncio'}
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
          {remover ? (
            <>
              O anúncio de <strong>{nome}</strong> será retirado da plataforma
              {totalDoAnimal > 1
                ? <> e as {totalDoAnimal} denúncias pendentes dele serão resolvidas.</>
                : <> e a denúncia será resolvida.</>}
            </>
          ) : (
            <>A denúncia será arquivada e o anúncio de <strong>{nome}</strong> continua no ar.</>
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
              background: remover ? '#842029' : 'var(--blue)', color: '#fff',
              fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
              opacity: modal.loading ? 0.65 : 1, minWidth: 110,
            }}
          >
            {modal.loading ? '…' : remover ? 'Confirmar remoção' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export const AdminDenuncias = () => {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([])
  const [filtro,    setFiltro]    = useState<Filtro>('PENDENTE')
  const [loading,   setLoading]   = useState(true)
  const [erro,      setErro]      = useState('')
  const [modal,     setModal]     = useState<ModalState | null>(null)

  const fetchDenuncias = async () => {
    setLoading(true)
    setErro('')
    try {
      const { data } = await api.get<Denuncia[]>('/denuncias')
      setDenuncias(data)
    } catch {
      setErro('Erro ao carregar denúncias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDenuncias() }, [])

  const pendentes = denuncias.filter(d => d.status === 'PENDENTE')
  const visiveis  = filtro === 'TODAS' ? denuncias : denuncias.filter(d => d.status === filtro)

  const pendentesDoAnimal = (animalId: number) =>
    pendentes.filter(d => d.animal_id === animalId).length

  const confirmar = async () => {
    if (!modal) return
    setModal(m => m ? { ...m, loading: true, erro: '' } : m)
    try {
      await api.put(`/denuncias/resolverDenuncia/${modal.denuncia.id}`, { acao: modal.acao })
      setModal(null)
      // Recarrega: remover um anúncio resolve as outras denúncias dele
      fetchDenuncias()
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Erro ao resolver denúncia.'
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
    <>
      <style>{`
        .denuncias-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }
        @media (max-width: 600px) {
          .denuncias-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{
          fontFamily: "'Baloo 2', system-ui",
          fontSize: '1.6rem', fontWeight: 800,
          color: 'var(--ink)', margin: '0 0 4px',
          letterSpacing: '-0.02em',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          Denúncias
          {!loading && (
            <span style={{
              fontSize: '0.82rem', fontWeight: 700,
              background: pendentes.length > 0 ? '#FFF5F5' : 'var(--blue-50)',
              color:      pendentes.length > 0 ? '#842029' : 'var(--blue)',
              border:     `1.5px solid ${pendentes.length > 0 ? '#f5c2c7' : 'var(--blue-100)'}`,
              padding: '3px 10px', borderRadius: 999,
            }}>
              {pendentes.length} pendente{pendentes.length !== 1 ? 's' : ''}
            </span>
          )}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', margin: 0 }}>
          Anúncios denunciados por usuários aguardando sua revisão.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {botaoFiltro('PENDENTE', `Pendentes${!loading ? ` (${pendentes.length})` : ''}`)}
        {botaoFiltro('RESOLVIDA', 'Resolvidas')}
        {botaoFiltro('TODAS', 'Todas')}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🐾</div>
          Carregando denúncias…
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
          <button onClick={fetchDenuncias} style={{
            background: 'none', border: 'none', color: '#842029',
            fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem',
          }}>Tentar novamente</button>
        </div>
      )}

      {!loading && !erro && visiveis.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 0',
          color: 'var(--ink-3)', display: 'flex',
          flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 48 }}>✓</div>
          <div style={{ fontFamily: "'Baloo 2', system-ui", fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-2)' }}>
            {filtro === 'PENDENTE' ? 'Tudo em dia!' : 'Nenhuma denúncia por aqui'}
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            {filtro === 'PENDENTE'
              ? 'Nenhum anúncio aguarda revisão no momento.'
              : 'Quando usuários denunciarem anúncios, eles aparecem aqui.'}
          </div>
        </div>
      )}

      {!loading && !erro && visiveis.length > 0 && (
        <div className="denuncias-grid">
          {visiveis.map(d => (
            <DenunciaCard
              key={d.id}
              denuncia={d}
              totalDoAnimal={pendentesDoAnimal(d.animal_id)}
              onAcao={(den, acao) => setModal({ denuncia: den, acao, loading: false, erro: '' })}
            />
          ))}
        </div>
      )}

      {modal && (
        <Modal
          modal={modal}
          totalDoAnimal={pendentesDoAnimal(modal.denuncia.animal_id)}
          onConfirm={confirmar}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}