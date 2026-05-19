/**
 * AdocaoAnimal.tsx — PawAdoption
 * Rota: /adotar/:id
 *
 * Endpoints:
 *   GET  /animais/buscarAnimal/:id          → busca animal com abrigo/lar_temporario
 *   POST /solicitacoes/solicitarAdocao/:id  → envia solicitação de adoção
 */

import '../styles/AdocaoAnimal.css'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/api'

// ─── Types locais ─────────────────────────────────────────────────────────────

interface AnimalFoto {
  id: number
  url_foto: string
  validada: boolean
}

interface UsuarioRelacao {
  id: number
  nome: string
  email: string
  telefone?: string
}

interface AbrigoRelacao {
  usuario_id: number
  razao_social: string
  sobre?: string
  site_url?: string
  usuario: UsuarioRelacao
}

interface AdotanteRelacao {
  usuario_id: number
  usuario: UsuarioRelacao
}

interface AnimalDetalhe {
  id: number
  nome: string
  especie: string
  raca?: string
  idade?: number
  porte: 'PEQUENO' | 'MEDIO' | 'GRANDE'
  sexo: 'MACHO' | 'FEMEA'
  descricao?: string
  status: 'PENDENTE' | 'DISPONIVEL' | 'ADOTADO' | 'PROCESSO_ADOCAO'
  fotos: AnimalFoto[]
  abrigo?: AbrigoRelacao
  lar_temporario?: AdotanteRelacao
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const especieEmoji = (especie: string) => {
  const e = especie.toLowerCase()
  if (e.includes('gat')) return '🐱'
  if (e.includes('coelh')) return '🐇'
  if (e.includes('pass') || e.includes('ave')) return '🦜'
  return '🐕'
}

const porteLabel = (p: string) =>
  p === 'PEQUENO' ? 'Pequeno' : p === 'GRANDE' ? 'Grande' : 'Médio'

const porteColor = (p: string) =>
  p === 'PEQUENO' ? '#4A9B6F' : p === 'GRANDE' ? '#C0692B' : '#5B7FA6'

const idadeLabel = (n?: number) => {
  if (n === undefined || n === null) return 'Idade desconhecida'
  if (n === 0) return 'Filhote'
  return `${n} ${n === 1 ? 'ano' : 'anos'}`
}

const GRADIENTS = [
  ['#FFD9B0', '#E8A87C'],
  ['#B5D4F4', '#5b94d4'],
  ['#C0DD97', '#4A9B6F'],
  ['#F4C0D1', '#D4537E'],
  ['#FFD27A', '#C8941A'],
]

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div className={`toast toast-${type}`}>{msg}</div>
)

// ─── Chip de info ─────────────────────────────────────────────────────────────

const InfoChip = ({ label, color }: { label: string; color: string }) => (
  <span
    className="adocao-chip"
    style={{ color, background: color + '18', border: `1.5px solid ${color}30` }}
  >
    {label}
  </span>
)

// ─── Modal de confirmação ─────────────────────────────────────────────────────

const ModalConfirmacao = ({
  animal,
  enviando,
  onConfirmar,
  onCancelar,
}: {
  animal: AnimalDetalhe
  enviando: boolean
  onConfirmar: () => void
  onCancelar: () => void
}) => (
  <div className="adocao-overlay" onClick={onCancelar}>
    <div className="adocao-modal" onClick={e => e.stopPropagation()}>

      <div className="adocao-modal-icon">{especieEmoji(animal.especie)}</div>
      <h2 className="adocao-modal-title">Confirmar adoção</h2>
      <p className="adocao-modal-desc">
        Você está prestes a enviar uma solicitação para adotar{' '}
        <strong>{animal.nome}</strong>. O responsável irá avaliar seu perfil e
        entrará em contato em breve.
      </p>

      <div className="adocao-modal-resumo">
        <span className="adocao-modal-resumo-nome">{animal.nome}</span>
        <span className="adocao-modal-resumo-info">
          {animal.raca || animal.especie} · {idadeLabel(animal.idade)} · {porteLabel(animal.porte)}
        </span>
      </div>

      <div className="adocao-modal-actions">
        <button className="adocao-btn-cancelar" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
        <button className="adocao-btn-confirmar" onClick={onConfirmar} disabled={enviando}>
          {enviando ? '⏳ Enviando…' : '❤️ Confirmar'}
        </button>
      </div>
    </div>
  </div>
)

// ─── Componente principal ─────────────────────────────────────────────────────

export const AdocaoAnimal = () => {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [animal,   setAnimal]   = useState<AnimalDetalhe | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [erro,     setErro]     = useState('')
  const [fotoIdx,  setFotoIdx]  = useState(0)
  const [modal,    setModal]    = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [toast,    setToast]    = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    api.get<AnimalDetalhe>(`/animais/buscarAnimal/${id}`, {
      headers: { 'Cache-Control': 'no-cache' }
    })
      .then(res => setAnimal(res.data))
      .catch(() => setErro('Não foi possível carregar as informações do animal.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleConfirmar = async () => {
    if (!animal) return
    setEnviando(true)
    try {
      await api.post(`/solicitacoes/solicitarAdocao/${animal.id}`)
      setModal(false)
      showToast(`Solicitação para adotar ${animal.nome} enviada com sucesso! ✅`, 'success')
    } catch (e: any) {
      setModal(false)
      showToast(e?.response?.data?.error || 'Erro ao enviar solicitação. Tente novamente.', 'error')
    } finally {
      setEnviando(false)
    }
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="adocao-page">
        <div className="adocao-estado-central">
          <div className="adocao-estado-icon" style={{ opacity: 0.35 }}>🐾</div>
          <p className="adocao-estado-msg">Carregando…</p>
        </div>
      </div>
    )
  }

  // ─── Erro ────────────────────────────────────────────────────────────────

  if (erro || !animal) {
    return (
      <div className="adocao-page">
        <div className="adocao-estado-central">
          <div className="adocao-estado-icon">🔍</div>
          <p className="adocao-estado-msg">{erro || 'Animal não encontrado.'}</p>
          <button className="adocao-btn-cancelar" style={{ marginTop: 16 }} onClick={() => navigate('/home')}>
            Voltar para os animais
          </button>
        </div>
      </div>
    )
  }

  // ─── Dados derivados ─────────────────────────────────────────────────────

  const fotos     = animal.fotos ?? []
  const fotoAtual = fotos[fotoIdx]
  const fotoUrl   = fotoAtual?.url_foto
    ? `${import.meta.env.VITE_API_URL}${fotoAtual.url_foto}`
    : null

  const [gradFrom, gradTo] = GRADIENTS[animal.id % GRADIENTS.length]
  const emoji       = especieEmoji(animal.especie)
  const indisponivel = animal.status !== 'DISPONIVEL'

  const anuncianteNome = animal.abrigo
    ? animal.abrigo.razao_social || animal.abrigo.usuario.nome
    : animal.lar_temporario?.usuario.nome ?? '—'

  const anuncianteTipo     = animal.abrigo ? 'Abrigo' : 'Lar temporário'
  const anuncianteEmail    = animal.abrigo ? animal.abrigo.usuario.email    : animal.lar_temporario?.usuario.email
  const anuncianteTelefone = animal.abrigo ? animal.abrigo.usuario.telefone : animal.lar_temporario?.usuario.telefone

  // ─── Layout ───────────────────────────────────────────────────────────────

  return (
    <div className="adocao-page">

      {/* ── Header ── */}
      <div className="adocao-header">
        <div className="adocao-header-inner">
          <button className="adocao-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
            ←
          </button>
          <div>
            <h1 className="adocao-titulo">{emoji} Adotar {animal.nome}</h1>
            <p className="adocao-subtitulo">Revise as informações e confirme sua solicitação de adoção</p>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="adocao-corpo">
        <div className="adocao-grid">

          {/* ── Coluna esquerda — Foto ── */}
          <div className="adocao-col-foto">

            <div className="adocao-foto-wrap">
              {fotoUrl ? (
                <img src={fotoUrl} alt={animal.nome} className="adocao-foto" />
              ) : (
                <div
                  className="adocao-foto-placeholder"
                  style={{ background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)` }}
                >
                  <span style={{ fontSize: 72, opacity: 0.5 }}>{emoji}</span>
                  <span className="adocao-foto-placeholder-nome">{animal.nome}</span>
                </div>
              )}

              {indisponivel && (
                <div className="adocao-badge-indisponivel">
                  {animal.status === 'ADOTADO' ? '🏠 Adotado' : '⏳ Em processo'}
                </div>
              )}
            </div>

            {fotos.length > 1 && (
              <div className="adocao-thumbs">
                {fotos.map((f, i) => (
                  <button
                    key={f.id}
                    className={`adocao-thumb${i === fotoIdx ? ' adocao-thumb--active' : ''}`}
                    onClick={() => setFotoIdx(i)}
                  >
                    <img src={`${import.meta.env.VITE_API_URL}${f.url_foto}`} alt={`Foto ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            <div className="adocao-chips">
              <InfoChip label={`${emoji} ${animal.especie}`} color="#4A9B6F" />
              <InfoChip label={porteLabel(animal.porte)}     color={porteColor(animal.porte)} />
              <InfoChip label={animal.sexo === 'MACHO' ? '♂ Macho' : '♀ Fêmea'}
                        color={animal.sexo === 'MACHO' ? 'var(--blue)' : '#D4537E'} />
              <InfoChip label={idadeLabel(animal.idade)}     color="var(--ink-2)" />
              {animal.raca && <InfoChip label={animal.raca}  color="var(--orange)" />}
            </div>
          </div>

          {/* ── Coluna direita — Info ── */}
          <div className="adocao-col-info">

            <section className="adocao-secao">
              <h2 className="adocao-secao-titulo">Sobre {animal.nome}</h2>
              {animal.descricao ? (
                <p className="adocao-descricao">{animal.descricao}</p>
              ) : (
                <p className="adocao-descricao adocao-descricao--vazia">Nenhuma descrição informada.</p>
              )}
            </section>

            <section className="adocao-secao">
              <h2 className="adocao-secao-titulo">Anunciado por</h2>
              <div className="adocao-anunciante">
                <div className="adocao-anunciante-avatar">
                  {anuncianteTipo === 'Abrigo' ? '🏠' : '🏡'}
                </div>
                <div className="adocao-anunciante-info">
                  <span className="adocao-anunciante-tipo">{anuncianteTipo}</span>
                  <span className="adocao-anunciante-nome">{anuncianteNome}</span>
                  {anuncianteEmail    && <span className="adocao-anunciante-contato">✉ {anuncianteEmail}</span>}
                  {anuncianteTelefone && <span className="adocao-anunciante-contato">📞 {anuncianteTelefone}</span>}
                </div>
              </div>
            </section>

            {indisponivel && (
              <div className="adocao-aviso">
                <span>⚠️</span>
                <p>
                  {animal.status === 'ADOTADO'
                    ? `${animal.nome} já encontrou um lar! 🏠`
                    : 'Já existe um processo de adoção em andamento para este animal.'}
                </p>
              </div>
            )}

            <div className="adocao-acoes">
              <button className="adocao-btn-cancelar" onClick={() => navigate(-1)}>
                Voltar
              </button>
              <button
                className="adocao-btn-confirmar"
                onClick={() => setModal(true)}
                disabled={indisponivel}
              >
                ❤️ Quero adotar
              </button>
            </div>

          </div>
        </div>
      </div>

      {modal && (
        <ModalConfirmacao
          animal={animal}
          enviando={enviando}
          onConfirmar={handleConfirmar}
          onCancelar={() => setModal(false)}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}