/**
 * AdocaoAnimal.tsx — PawAdoption
 * Rota: /adotar/:id  (apenas ADOTANTE)
 *
 * Endpoints:
 *   GET  /animais          → busca o animal pelo id (filtra do array)
 *   POST /solicitacoes/solicitarAdocao/:id → envia a solicitação
 */

import '../styles/AdocaoAnimal.css'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import type { Animal, SolicitacaoAdocao } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PAW_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%232D1B14' fill-opacity='0.03'><ellipse cx='22' cy='30' rx='4' ry='5'/><ellipse cx='31' cy='24' rx='3.5' ry='4.5'/><ellipse cx='40' cy='24' rx='3.5' ry='4.5'/><ellipse cx='49' cy='30' rx='4' ry='5'/><path d='M30 43c0-5.5 3-9 7-9s7 3.5 7 9c0 3.5-2.5 5-5 5s-1.5 1-2 1-1.5-1-3.5-1-3.5-1.5-3.5-5z'/><ellipse cx='82' cy='90' rx='3' ry='4'/><ellipse cx='89' cy='85' rx='2.8' ry='3.8'/><ellipse cx='96' cy='85' rx='2.8' ry='3.8'/><ellipse cx='103' cy='90' rx='3' ry='4'/><path d='M88 100c0-4.5 2.5-7.5 5.5-7.5s5.5 3 5.5 7.5c0 3-2 4-4 4s-1.2.8-1.5.8-1.2-.8-2.5-.8-3-1-3-4z'/></g></svg>")`

const GRADIENTS = [
  ['#FFD9B0', '#E8A87C'], ['#B5D4F4', '#5b94d4'],
  ['#C0DD97', '#4A9B6F'], ['#F4C0D1', '#D4537E'], ['#FFD27A', '#C8941A'],
]

const porteLabel = (p?: Animal['porte']) =>
  p === 'PEQUENO' ? 'Pequeno' : p === 'GRANDE' ? 'Grande' : 'Médio'

const sexoLabel = (s?: Animal['sexo']) =>
  s === 'MACHO' ? '♂ Macho' : '♀ Fêmea'

const idadeLabel = (n?: number) => {
  if (n === undefined || n === null) return 'Idade desconhecida'
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

// ─── Chip de info ─────────────────────────────────────────────────────────────

const InfoChip = ({ label, color }: { label: string; color: string }) => (
  <span className="ad-chip" style={{ color, background: color + '18', border: `1px solid ${color}30` }}>
    {label}
  </span>
)

// ─── Tela de sucesso ──────────────────────────────────────────────────────────

const Sucesso = ({ animal, onVoltar }: { animal: Animal; onVoltar: () => void }) => (
  <div className="ad-sucesso">
    <div className="ad-sucesso-icon">🐾</div>
    <h2 className="ad-sucesso-title">Solicitação enviada!</h2>
    <p className="ad-sucesso-desc">
      Sua solicitação para adotar <strong>{animal.nome}</strong> foi registrada com sucesso.
      O responsável entrará em contato em breve para os próximos passos.
    </p>

    <div className="ad-sucesso-card">
      <div className="ad-sucesso-animal">
        <span style={{ fontSize: 32 }}>{especieEmoji(animal.especie)}</span>
        <div>
          <div className="ad-sucesso-animal-nome">{animal.nome}</div>
          <div className="ad-sucesso-animal-info">{animal.raca || animal.especie} · {idadeLabel(animal.idade)}</div>
        </div>
      </div>
      <div className="ad-sucesso-status">
        <span className="ad-sucesso-badge">⏳ Aguardando resposta</span>
      </div>
    </div>

    <div className="ad-sucesso-steps">
      {[
        { icon: '✓', label: 'Solicitação enviada',       done: true  },
        { icon: '2', label: 'Análise pelo responsável',  done: false },
        { icon: '3', label: 'Contato e próximos passos', done: false },
        { icon: '🐾', label: 'Adoção concluída!',        done: false },
      ].map((s, i) => (
        <div key={i} className={`ad-step${s.done ? ' ad-step--done' : ''}`}>
          <div className="ad-step-icon">{s.icon}</div>
          <span className="ad-step-label">{s.label}</span>
          {i < 3 && <div className="ad-step-line" />}
        </div>
      ))}
    </div>

    <button className="ad-btn ad-btn--primary" onClick={onVoltar}>
      Ver mais animais
    </button>
  </div>
)

// ─── Componente principal ─────────────────────────────────────────────────────

export const AdocaoAnimal = () => {
  const { id }      = useParams<{ id: string }>()
  const navigate    = useNavigate()
  const { usuario } = useAuth()

  const [animal,   setAnimal]   = useState<Animal | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro,     setErro]     = useState('')
  const [sucesso,  setSucesso]  = useState(false)
  const [fotoIdx,  setFotoIdx]  = useState(0)

  // Busca o animal
    useEffect(() => {
    const fetch = async () => {
        try {
        const { data } = await api.get<Animal[]>('/animais')
        const found = data.find(a => a.id === Number(id))
        if (found) {
            setAnimal(found)
        }
        } catch {
        setErro('Erro ao carregar informações do animal.')
        } finally {
        setLoading(false)
        }
    }
    fetch()
    }, [id])

  const handleSolicitar = async () => {
    if (!animal) return
    setErro('')
    setEnviando(true)
    try {
      await api.post<SolicitacaoAdocao>(`/solicitacoes/solicitarAdocao/${animal.id}`)
      setSucesso(true)
    } catch (e: any) {
      setErro(e?.response?.data?.error || 'Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="ad-page" style={{ backgroundImage: PAW_BG }}>
        <div className="ad-loading">
          <div className="ad-loading-icon">🐾</div>
          <p>Carregando…</p>
        </div>
      </div>
    )
  }

  if (!animal) {
    return (
        <div className="ad-page" style={{ backgroundImage: PAW_BG }}>
        <div className="ad-loading">
            <div className="ad-loading-icon">🔍</div>
            <p>Animal não encontrado.</p>
            <button className="ad-btn ad-btn--ghost" onClick={() => navigate('/home')}
            style={{ marginTop: 16 }}>
            Voltar para os animais
            </button>
        </div>
        </div>
    )
    }

  // ─── Sucesso ──────────────────────────────────────────────────────────────

  if (sucesso) {
    return (
      <div className="ad-page" style={{ backgroundImage: PAW_BG }}>
        <Sucesso animal={animal} onVoltar={() => navigate('/home')} />
      </div>
    )
  }

  // ─── Foto ─────────────────────────────────────────────────────────────────

  const fotos = animal.fotos ?? []
  const fotoUrl = fotos[fotoIdx]?.url_foto
    ? `${import.meta.env.VITE_API_URL}${fotos[fotoIdx].url_foto}`
    : null
  const [gradFrom, gradTo] = GRADIENTS[animal.id % GRADIENTS.length]
  const emoji = especieEmoji(animal.especie)

  const indisponivel = animal.status !== 'DISPONIVEL'

  // ─── Layout ───────────────────────────────────────────────────────────────

  return (
    <div className="ad-page" style={{ backgroundImage: PAW_BG }}>

      {/* Header */}
      <div className="ad-header">
        <div className="ad-header-inner">
          <button className="ad-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
            ←
          </button>
          <div>
            <h1 className="ad-title">Adotar {animal.nome} <span>🐾</span></h1>
            <p className="ad-subtitle">Revise as informações e confirme sua solicitação</p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="ad-body">
        <div className="ad-grid">

          {/* ── Coluna esquerda — Foto ── */}
          <div className="ad-col-foto">

            {/* Foto principal */}
            <div className="ad-foto-wrap">
              {fotoUrl ? (
                <img src={fotoUrl} alt={animal.nome} className="ad-foto" />
              ) : (
                <div className="ad-foto-placeholder" style={{
                  background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`
                }}>
                  <span style={{ fontSize: 72, opacity: 0.55 }}>{emoji}</span>
                  <span className="ad-foto-placeholder-nome">{animal.nome}</span>
                </div>
              )}

              {/* Badge status */}
              {indisponivel && (
                <div className="ad-foto-badge-indisponivel">
                  {animal.status === 'ADOTADO' ? '🏠 Adotado' : '⏳ Em processo'}
                </div>
              )}

              {/* Miniaturas se houver mais de 1 foto */}
              {fotos.length > 1 && (
                <div className="ad-thumbs">
                  {fotos.map((f, i) => (
                    <button
                      key={f.id}
                      className={`ad-thumb${i === fotoIdx ? ' ad-thumb--active' : ''}`}
                      onClick={() => setFotoIdx(i)}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}${f.url_foto}`}
                        alt={`Foto ${i + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chips de características */}
            <div className="ad-chips-wrap">
              <InfoChip label={`${emoji} ${animal.especie}`}    color="#4A9B6F" />
              <InfoChip label={porteLabel(animal.porte)}        color="#5B7FA6" />
              <InfoChip label={sexoLabel(animal.sexo)}          color={animal.sexo === 'MACHO' ? 'var(--blue)' : '#D4537E'} />
              <InfoChip label={idadeLabel(animal.idade)}        color="var(--ink-2)" />
              {animal.raca && <InfoChip label={animal.raca}     color="var(--orange)" />}
            </div>
          </div>

          {/* ── Coluna direita — Detalhes + ação ── */}
          <div className="ad-col-info">

            {/* Sobre o animal */}
            <section className="ad-section">
              <h2 className="ad-section-title">Sobre {animal.nome}</h2>
              {animal.descricao ? (
                <p className="ad-descricao">{animal.descricao}</p>
              ) : (
                <p className="ad-descricao ad-descricao--vazia">
                  Nenhuma descrição informada.
                </p>
              )}
            </section>

            {/* Como funciona */}
            <section className="ad-section">
              <h2 className="ad-section-title">Como funciona a adoção</h2>
              <div className="ad-how">
                {[
                  { icon: '📋', title: 'Solicitação',   desc: 'Você envia sua solicitação agora mesmo.' },
                  { icon: '🔍', title: 'Análise',        desc: 'O responsável avalia seu perfil.' },
                  { icon: '📞', title: 'Contato',        desc: 'Vocês combinam os próximos passos.' },
                  { icon: '🐾', title: 'Adoção',         desc: 'Bem-vindo ao lar, bichinho!' },
                ].map((s, i) => (
                  <div key={i} className="ad-how-step">
                    <div className="ad-how-icon">{s.icon}</div>
                    <div>
                      <div className="ad-how-title">{s.title}</div>
                      <div className="ad-how-desc">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Indisponível */}
            {indisponivel && (
              <div className="ad-indisponivel-notice">
                <span>⚠️</span>
                <p>
                  Este animal não está mais disponível para adoção.
                  {animal.status === 'ADOTADO'
                    ? ' Ele já encontrou um lar!'
                    : ' Já existe um processo de adoção em andamento.'}
                </p>
              </div>
            )}

            {/* Erro */}
            {erro && (
              <div className="ad-erro" role="alert">
                <span>⚠️</span> {erro}
              </div>
            )}

            {/* Ação */}
            <div className="ad-actions">
              <button
                className="ad-btn ad-btn--ghost"
                onClick={() => navigate(-1)}
                disabled={enviando}
              >
                Voltar
              </button>
              <button
                className="ad-btn ad-btn--primary"
                onClick={handleSolicitar}
                disabled={enviando || indisponivel}
              >
                {enviando
                  ? <><span className="ad-spinner" /> Enviando…</>
                  : '❤️ Quero adotar'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
