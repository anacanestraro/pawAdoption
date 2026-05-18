/**
 * AdminValidacoes.tsx — PawAdoption
 * Rota: /admin/validacoes
 *
 * Endpoints:
 *   GET  /animais                    → lista todos; filtramos PENDENTE no front
 *   POST /validacoes/validar/:id     → { status: 'APROVADA' | 'REJEITADA', comentario? }
 */

import { useState, useEffect } from 'react'
import api from '../api/api'
import type { Animal } from '../types'

// ─── Tipos locais ─────────────────────────────────────────────────────────────

type StatusValidacao = 'APROVADA' | 'REJEITADA'

interface ModalState {
  animal:     Animal
  acao:       StatusValidacao
  comentario: string
  loading:    boolean
  erro:       string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const porteLabel = (p?: Animal['porte']) =>
  p === 'PEQUENO' ? 'Pequeno' : p === 'GRANDE' ? 'Grande' : 'Médio'

const sexoLabel = (s?: Animal['sexo']) =>
  s === 'MACHO' ? '♂ Macho' : s === 'FEMEA' ? '♀ Fêmea' : '—'

const idadeLabel = (n?: number) => {
  if (n === undefined || n === null) return '—'
  if (n === 0) return 'Filhote'
  return `${n} ${n === 1 ? 'ano' : 'anos'}`
}

const especieEmoji = (e: string) => {
  const l = e.toLowerCase()
  if (l.includes('gat')) return '🐱'
  if (l.includes('coelh')) return '🐇'
  if (l.includes('ave') || l.includes('pass')) return '🦜'
  return '🐕'
}

// ─── Card de animal pendente ──────────────────────────────────────────────────

interface AnimalCardProps {
  animal:    Animal
  index:     number
  onAprovar: (a: Animal) => void
  onRejeitar: (a: Animal) => void
}

const AnimalCard = ({ animal, index, onAprovar, onRejeitar }: AnimalCardProps) => {
  const emoji    = especieEmoji(animal.especie)
  const fotoUrl  = animal.fotos?.[0]?.url_foto
    ? `${import.meta.env.VITE_API_URL}${animal.fotos[0].url_foto}`
    : null

  const GRADIENTS = [
    ['#FFD9B0','#E8A87C'], ['#B5D4F4','#5b94d4'],
    ['#C0DD97','#4A9B6F'], ['#F4C0D1','#D4537E'], ['#FFD27A','#C8941A'],
  ]
  const [from, to] = GRADIENTS[index % GRADIENTS.length]

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
      <div style={{ position: 'relative', height: 180, flexShrink: 0 }}>
        {fotoUrl ? (
          <img src={fotoUrl} alt={animal.nome} style={{
            width: '100%', height: '100%', objectFit: 'cover',
          }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 40, opacity: 0.6 }}>{emoji}</span>
            <span style={{
              fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase',
              color: to, fontWeight: 800,
              background: 'rgba(255,255,255,0.7)', padding: '3px 8px', borderRadius: 999,
            }}>{animal.nome}</span>
          </div>
        )}

        {/* Badge pendente */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          background: '#FFF3CD', color: '#856404',
          fontSize: 10, fontWeight: 800, padding: '3px 9px',
          borderRadius: 999, letterSpacing: '.04em',
          border: '1px solid #FFECB5',
        }}>PENDENTE</span>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{
              fontFamily: "'Baloo 2', system-ui",
              fontSize: '1rem', fontWeight: 800, color: 'var(--ink)',
            }}>{animal.nome}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>
              {idadeLabel(animal.idade)}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginTop: 2 }}>
            {animal.raca || animal.especie}
          </div>
        </div>

        {/* Chips de info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { label: porteLabel(animal.porte), color: '#5B7FA6' },
            { label: sexoLabel(animal.sexo),   color: animal.sexo === 'MACHO' ? 'var(--blue)' : '#D4537E' },
            { label: `${emoji} ${animal.especie}`, color: '#4A9B6F' },
          ].map(c => (
            <span key={c.label} style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px',
              borderRadius: 999,
              background: c.color + '18',
              color: c.color,
              border: `1px solid ${c.color}30`,
            }}>{c.label}</span>
          ))}
        </div>

        {/* Descrição */}
        {animal.descricao && (
          <p style={{
            fontSize: '0.8rem', color: 'var(--ink-2)', margin: 0,
            lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {animal.descricao}
          </p>
        )}

        {/* Ações */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
          <button
            onClick={() => onRejeitar(animal)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              border: '1.5px solid #f5c2c7',
              background: '#FFF5F5', color: '#842029',
              fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fce8e9')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FFF5F5')}
          >
            ✕ Rejeitar
          </button>
          <button
            onClick={() => onAprovar(animal)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              border: 'none',
              background: 'var(--blue)', color: '#fff',
              fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(23,94,168,0.25)',
              transition: 'background 0.15s, transform 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-700)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--blue)'; e.currentTarget.style.transform = 'none' }}
          >
            ✓ Aprovar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal de confirmação ─────────────────────────────────────────────────────

interface ModalProps {
  modal:     ModalState
  onChange:  (patch: Partial<ModalState>) => void
  onConfirm: () => void
  onClose:   () => void
}

const Modal = ({ modal, onChange, onConfirm, onClose }: ModalProps) => {
  const isAprovar = modal.acao === 'APROVADA'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--paper)',
        borderRadius: 20,
        padding: '32px 28px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {/* Ícone + título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: isAprovar ? 'var(--blue-50)' : '#FFF5F5',
            display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0,
          }}>
            {isAprovar ? '✓' : '✕'}
          </div>
          <div>
            <div style={{
              fontFamily: "'Baloo 2', system-ui",
              fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)',
            }}>
              {isAprovar ? 'Aprovar animal' : 'Rejeitar animal'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>
              {modal.animal.nome} · {modal.animal.especie}
            </div>
          </div>
        </div>

        {/* Comentário */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-2)' }}>
            Comentário {isAprovar ? '(opcional)' : '(recomendado)'}
          </label>
          <textarea
            value={modal.comentario}
            onChange={e => onChange({ comentario: e.target.value })}
            placeholder={isAprovar
              ? 'Observações sobre a aprovação…'
              : 'Motivo da rejeição…'}
            rows={3}
            style={{
              width: '100%', padding: '10px 13px',
              borderRadius: 11, border: '1.5px solid var(--line-2)',
              background: 'var(--cream)', color: 'var(--ink)',
              fontFamily: "'Nunito', system-ui",
              fontSize: '0.88rem', fontWeight: 600,
              outline: 'none', resize: 'none', lineHeight: 1.55,
            }}
          />
        </div>

        {/* Erro */}
        {modal.erro && (
          <div style={{
            background: '#FFF5F5', border: '1.5px solid #f5c2c7',
            borderRadius: 10, padding: '10px 13px',
            fontSize: '0.82rem', fontWeight: 700, color: '#842029',
          }}>
            ⚠️ {modal.erro}
          </div>
        )}

        {/* Botões */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={modal.loading}
            style={{
              padding: '9px 20px', borderRadius: 10,
              border: '1.5px solid var(--line-2)',
              background: 'transparent', color: 'var(--ink-2)',
              fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={modal.loading}
            style={{
              padding: '9px 24px', borderRadius: 10, border: 'none',
              background: isAprovar ? 'var(--blue)' : '#842029',
              color: '#fff',
              fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
              opacity: modal.loading ? 0.65 : 1,
              minWidth: 110,
            }}
          >
            {modal.loading
              ? '…'
              : isAprovar ? 'Confirmar aprovação' : 'Confirmar rejeição'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export const AdminValidacoes = () => {
  const [animais,  setAnimais]  = useState<Animal[]>([])
  const [loading,  setLoading]  = useState(true)
  const [erro,     setErro]     = useState('')
  const [modal,    setModal]    = useState<ModalState | null>(null)

  // Busca todos os animais e filtra os PENDENTE
  const fetchAnimais = async () => {
    setLoading(true)
    setErro('')
    try {
      const { data } = await api.get<Animal[]>('/animais')
      setAnimais(data.filter(a => a.status === 'PENDENTE'))
    } catch {
      setErro('Erro ao carregar animais pendentes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnimais() }, [])

  const abrirModal = (animal: Animal, acao: StatusValidacao) =>
    setModal({ animal, acao, comentario: '', loading: false, erro: '' })

  const fecharModal = () => setModal(null)

  const confirmar = async () => {
    if (!modal) return
    setModal(m => m ? { ...m, loading: true, erro: '' } : m)
    try {
      await api.post(`/validacoes/validar/${modal.animal.id}`, {
        status:     modal.acao,
        comentario: modal.comentario.trim() || undefined,
      })
      // Remove o animal da lista local sem refetch
      setAnimais(prev => prev.filter(a => a.id !== modal.animal.id))
      fecharModal()
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Erro ao processar validação.'
      setModal(m => m ? { ...m, loading: false, erro: msg } : m)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .av-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        @media (max-width: 600px) {
          .av-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'Baloo 2', system-ui",
          fontSize: '1.6rem', fontWeight: 800,
          color: 'var(--ink)', margin: '0 0 4px',
          letterSpacing: '-0.02em',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          Validações
          {!loading && (
            <span style={{
              fontSize: '0.82rem', fontWeight: 700,
              background: animais.length > 0 ? '#FFF3CD' : 'var(--blue-50)',
              color:      animais.length > 0 ? '#856404' : 'var(--blue)',
              border:     `1.5px solid ${animais.length > 0 ? '#FFECB5' : 'var(--blue-100)'}`,
              padding: '3px 10px', borderRadius: 999,
            }}>
              {animais.length} pendente{animais.length !== 1 ? 's' : ''}
            </span>
          )}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', margin: 0 }}>
          Animais cadastrados por adotantes aguardando sua revisão.
        </p>
      </div>

      {/* Estados */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🐾</div>
          Carregando animais…
        </div>
      )}

      {!loading && erro && (
        <div style={{
          background: '#FFF5F5', border: '1.5px solid #f5c2c7',
          borderRadius: 12, padding: '16px 20px',
          color: '#842029', fontWeight: 700, fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>⚠️ {erro}</span>
          <button onClick={fetchAnimais} style={{
            background: 'none', border: 'none', color: '#842029',
            fontWeight: 800, cursor: 'pointer', textDecoration: 'underline',
            fontSize: '0.85rem',
          }}>Tentar novamente</button>
        </div>
      )}

      {!loading && !erro && animais.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 0',
          color: 'var(--ink-3)', display: 'flex',
          flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 48 }}>✓</div>
          <div style={{
            fontFamily: "'Baloo 2', system-ui",
            fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-2)',
          }}>
            Tudo em dia!
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            Nenhum animal aguarda validação no momento.
          </div>
        </div>
      )}

      {!loading && !erro && animais.length > 0 && (
        <div className="av-grid">
          {animais.map((animal, i) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              index={i}
              onAprovar={a => abrirModal(a, 'APROVADA')}
              onRejeitar={a => abrirModal(a, 'REJEITADA')}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal
          modal={modal}
          onChange={patch => setModal(m => m ? { ...m, ...patch } : m)}
          onConfirm={confirmar}
          onClose={fecharModal}
        />
      )}
    </>
  )
}