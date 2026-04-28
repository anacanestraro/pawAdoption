/**
 * AnimalFeed.tsx — PawAdoption
 * Rota: /home  (adotante)
 *
 * Endpoints:
 *   GET /animais  → lista todos os animais (filtra DISPONIVEL no front)
 *   POST /solicitacoes/solicitarAdocao/:id → iniciar adoção (requer JWT)
 *   POST /denuncias/denunciar/:id          → denunciar animal  (requer JWT)
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import type { Animal } from '../types'

// ─── Paw pattern SVG (inline, 3% opacity) ────────────────────────────────────
const PAW_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%232D1B14' fill-opacity='0.03'><ellipse cx='22' cy='30' rx='4' ry='5'/><ellipse cx='31' cy='24' rx='3.5' ry='4.5'/><ellipse cx='40' cy='24' rx='3.5' ry='4.5'/><ellipse cx='49' cy='30' rx='4' ry='5'/><path d='M30 43c0-5.5 3-9 7-9s7 3.5 7 9c0 3.5-2.5 5-5 5s-1.5 1-2 1-1.5-1-3.5-1-3.5-1.5-3.5-5z'/><ellipse cx='82' cy='90' rx='3' ry='4'/><ellipse cx='89' cy='85' rx='2.8' ry='3.8'/><ellipse cx='96' cy='85' rx='2.8' ry='3.8'/><ellipse cx='103' cy='90' rx='3' ry='4'/><path d='M88 100c0-4.5 2.5-7.5 5.5-7.5s5.5 3 5.5 7.5c0 3-2 4-4 4s-1.2.8-1.5.8-1.2-.8-2.5-.8-3-1-3-4z'/></g></svg>")`

// ─── Helpers ──────────────────────────────────────────────────────────────────

const especieEmoji = (especie: string) => {
  const e = especie.toLowerCase()
  if (e.includes('gat')) return '🐱'
  if (e.includes('coelh')) return '🐇'
  if (e.includes('pass') || e.includes('aves')) return '🦜'
  return '🐕'
}

const porteLabel = (porte?: string) =>
  porte === 'PEQUENO' ? 'Pequeno' : porte === 'GRANDE' ? 'Grande' : 'Médio'

const porteColor = (porte?: string) =>
  porte === 'PEQUENO' ? '#4A9B6F' : porte === 'GRANDE' ? '#C0692B' : '#5B7FA6'

const idadeLabel = (idade?: number) => {
  if (!idade) return '?'
  if (idade < 1) return 'Filhote'
  return `${idade} ${idade === 1 ? 'ano' : 'anos'}`
}

// Gradiente placeholder quando não há foto
const GRADIENTS = [
  ['#FFD9B0', '#E8A87C'],
  ['#B5D4F4', '#5b94d4'],
  ['#C0DD97', '#4A9B6F'],
  ['#F4C0D1', '#D4537E'],
  ['#FFD27A', '#C8941A'],
]

// ─── Tipos dos chips de filtro ────────────────────────────────────────────────

type Filtro = {
  key: string
  label: string
  icon: string
  match: (a: Animal) => boolean
}

const FILTROS: Filtro[] = [
  { key: 'todos',    label: 'Todos',    icon: '🏠', match: () => true },
  { key: 'cachorro', label: 'Cachorros',icon: '🐕', match: a => a.especie.toLowerCase().includes('cachorro') || a.especie.toLowerCase().includes('dog') },
  { key: 'gato',     label: 'Gatos',    icon: '🐱', match: a => a.especie.toLowerCase().includes('gato') || a.especie.toLowerCase().includes('cat') },
  { key: 'pequeno',  label: 'Pequenos', icon: '🐩', match: a => a.porte === 'PEQUENO' },
  { key: 'filhote',  label: 'Filhotes', icon: '🍼', match: a => (a.idade ?? 0) < 1 },
  { key: 'adulto',   label: 'Adultos',  icon: '🦴', match: a => (a.idade ?? 0) >= 1 },
  { key: 'macho',    label: 'Machos',   icon: '♂',  match: a => a.sexo === 'MACHO' },
  { key: 'femea',    label: 'Fêmeas',   icon: '♀',  match: a => a.sexo === 'FEMEA' },
]

// ─── PhotoCard placeholder ────────────────────────────────────────────────────

const PhotoPlaceholder = ({ nome, index, emoji }: { nome: string; index: number; emoji: string }) => {
  const [from, to] = GRADIENTS[index % GRADIENTS.length]
  return (
    <div style={{
      width: '100%', aspectRatio: '1/1',
      background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      borderRadius: 20, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 52, opacity: 0.7 }}>{emoji}</span>
      <span style={{
        fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
        color: to, fontWeight: 800,
        background: 'rgba(255,255,255,0.7)', padding: '3px 10px', borderRadius: 999,
      }}>{nome}</span>
    </div>
  )
}

// ─── AnimalCard ───────────────────────────────────────────────────────────────

const AnimalCard = ({
  animal, index, onAdotar, onDenunciar, adotando
}: {
  animal: Animal
  index: number
  onAdotar: (id: number) => void
  onDenunciar: (id: number) => void
  adotando: boolean
}) => {
  const emoji = especieEmoji(animal.especie)
  const isNew = new Date().getTime() - new Date(animal.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
  const [hovered, setHovered] = useState(false)
  const [liked, setLiked] = useState(false)

  return (
    <article
      className="animal-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ transform: hovered ? 'translateY(-5px)' : 'translateY(0)' }}
    >
      {/* Foto */}
      <div style={{ position: 'relative', padding: '12px 12px 0' }}>
        {animal.fotos && (animal.fotos as any[]).length > 0 ? (
          <img
            src={`${import.meta.env.VITE_API_URL}${(animal.fotos as any[])[0].url_foto}`}
            alt={animal.nome}
            style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 20 }}
          />
        ) : (
          <PhotoPlaceholder nome={animal.nome} index={index} emoji={emoji} />
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 22, left: 22, display: 'flex', gap: 6 }}>
          {isNew && (
            <span style={{
              background: '#E8A87C', color: '#2D1B14',
              fontSize: 10, fontWeight: 800, padding: '4px 10px',
              borderRadius: 999, letterSpacing: '.04em',
            }}>NOVO</span>
          )}
          {animal.porte && (
            <span style={{
              background: 'rgba(255,255,255,0.92)', color: porteColor(animal.porte),
              fontSize: 10, fontWeight: 800, padding: '4px 10px',
              borderRadius: 999, letterSpacing: '.04em',
            }}>{porteLabel(animal.porte)}</span>
          )}
        </div>

        {/* Like button */}
        <button
          className="like-btn"
          onClick={() => setLiked(v => !v)}
          aria-label="Favoritar"
        >
          <span style={{ fontSize: 16, transition: 'transform .2s' }}>
            {liked ? '❤️' : '🤍'}
          </span>
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <h3 className="card-name">{animal.nome}</h3>
          <span className="card-age">
            {animal.sexo === 'FEMEA' ? '♀' : '♂'} · {idadeLabel(animal.idade)}
          </span>
        </div>

        <p className="card-breed">{animal.raca || animal.especie}</p>

        {animal.descricao && (
          <p className="card-desc">{animal.descricao.slice(0, 72)}{animal.descricao.length > 72 ? '…' : ''}</p>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          <span className="tag tag-blue">{emoji} {animal.especie}</span>
          {animal.lar_temporario && <span className="tag tag-green">🏡 Lar temp.</span>}
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            className="btn-adotar"
            onClick={() => onAdotar(animal.id)}
            disabled={adotando}
          >
            {adotando ? '⏳' : '❤️'} Quero adotar
          </button>
          <button
            className="btn-denunciar"
            onClick={() => onDenunciar(animal.id)}
            title="Denunciar"
          >⚑</button>
        </div>
      </div>
    </article>
  )
}

// ─── Modal de confirmação ─────────────────────────────────────────────────────

const Modal = ({ animal, onConfirm, onCancel, loading }: {
  animal: Animal
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-box" onClick={e => e.stopPropagation()}>
      <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>🐾</div>
      <h3 style={{ margin: '0 0 8px', textAlign: 'center', fontSize: 22, fontWeight: 800, color: '#2D1B14' }}>
        Adotar {animal.nome}?
      </h3>
      <p style={{ margin: '0 0 24px', textAlign: 'center', fontSize: 14, color: '#6B4226', lineHeight: 1.55 }}>
        Você está prestes a enviar uma solicitação de adoção para <strong>{animal.nome}</strong>.
        O abrigo responsável entrará em contato em breve.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="modal-cancel" onClick={onCancel}>Cancelar</button>
        <button className="modal-confirm" onClick={onConfirm} disabled={loading}>
          {loading ? 'Enviando...' : 'Confirmar ❤️'}
        </button>
      </div>
    </div>
  </div>
)

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div className={`toast toast-${type}`}>{msg}</div>
)

// ─── AnimalFeed (página principal) ───────────────────────────────────────────

export const AnimalFeed = () => {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  // Dados
  const [animais, setAnimais]       = useState<Animal[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)

  // Filtros e busca
  const [busca, setBusca]           = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState('todos')
  const [showFiltros, setShowFiltros] = useState(false)
  const [ordemAtiva, setOrdemAtiva] = useState<'recentes'|'nome'|'idade'>('recentes')

  // Modal adoção
  const [modalAnimal, setModalAnimal] = useState<Animal | null>(null)
  const [adotando, setAdotando]       = useState(false)
  const [adotandoId, setAdotandoId]   = useState<number | null>(null)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Buscar animais
  useEffect(() => {
    setLoading(true)
    api.get<Animal[]>('/animais')
      .then(res => {
        const disponiveis = res.data.filter(a => a.status === 'DISPONIVEL')
        setAnimais(disponiveis)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Filtro + busca + ordenação
  const animaisFiltrados = useMemo(() => {
    const filtro = FILTROS.find(f => f.key === filtroAtivo)
    let lista = animais.filter(a => {
      const matchFiltro = filtro ? filtro.match(a) : true
      const term = busca.toLowerCase()
      const matchBusca = !term || [a.nome, a.especie, a.raca ?? '', a.descricao ?? '']
        .some(s => s.toLowerCase().includes(term))
      return matchFiltro && matchBusca
    })

    if (ordemAtiva === 'nome')     lista = [...lista].sort((a, b) => a.nome.localeCompare(b.nome))
    if (ordemAtiva === 'idade')    lista = [...lista].sort((a, b) => (a.idade ?? 0) - (b.idade ?? 0))
    if (ordemAtiva === 'recentes') lista = [...lista].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return lista
  }, [animais, filtroAtivo, busca, ordemAtiva])

  // Adotar
  const handleAdotar = (id: number) => {
    if (!usuario) { navigate('/login'); return }
    const animal = animais.find(a => a.id === id)
    if (animal) setModalAnimal(animal)
  }

  const confirmarAdocao = async () => {
    if (!modalAnimal) return
    setAdotando(true)
    setAdotandoId(modalAnimal.id)
    try {
      await api.post(`/solicitacoes/solicitarAdocao/${modalAnimal.id}`)
      showToast(`Solicitação enviada! O abrigo entrará em contato em breve. 🐾`, 'success')
      setModalAnimal(null)
    } catch {
      showToast('Erro ao enviar solicitação. Tente novamente.', 'error')
    } finally {
      setAdotando(false)
      setAdotandoId(null)
    }
  }

  // Denunciar
  const handleDenunciar = async (id: number) => {
    if (!usuario) { navigate('/login'); return }
    try {
      await api.post(`/denuncias/denunciar/${id}`)
      showToast('Denúncia registrada. Obrigado por ajudar! ✅', 'success')
    } catch {
      showToast('Erro ao registrar denúncia.', 'error')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');

        :root, [data-theme="light"] {
          --cream:    #FBF7EE;
          --marrom:   #2D1B14;
          --marrom-m: #6B4226;
          --laranja:  #E8A87C;
          --laranja-d:#C07040;
          --verde:    #4A6741;
          --verde-l:  #EAF3DE;
          --azul:     #175EA8;
          --azul-l:   #DCE9F7;
          --paper:    #FFFFFF;
          --line:     #EDE5D8;
        }

        [data-theme="dark"] {
          --cream:    #0E1626;
          --marrom:   #F0E8DC;
          --marrom-m: #C4A882;
          --laranja:  #E8A87C;
          --laranja-d:#C07040;
          --verde:    #5C8A50;
          --verde-l:  #1A2E18;
          --azul:     #4D8FD9;
          --azul-l:   #1F3354;
          --paper:    #1A2438;
          --line:     #2A3552;
        }

        [data-theme="dark"] .feed-page {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%23FFFFFF' fill-opacity='0.03'><ellipse cx='22' cy='30' rx='4' ry='5'/><ellipse cx='31' cy='24' rx='3.5' ry='4.5'/><ellipse cx='40' cy='24' rx='3.5' ry='4.5'/><ellipse cx='49' cy='30' rx='4' ry='5'/><path d='M30 43c0-5.5 3-9 7-9s7 3.5 7 9c0 3.5-2.5 5-5 5s-1.5 1-2 1-1.5-1-3.5-1-3.5-1.5-3.5-5z'/><ellipse cx='82' cy='90' rx='3' ry='4'/><ellipse cx='89' cy='85' rx='2.8' ry='3.8'/><ellipse cx='96' cy='85' rx='2.8' ry='3.8'/><ellipse cx='103' cy='90' rx='3' ry='4'/><path d='M88 100c0-4.5 2.5-7.5 5.5-7.5s5.5 3 5.5 7.5c0 3-2 4-4 4s-1.2.8-1.5.8-1.2-.8-2.5-.8-3-1-3-4z'/></g></svg>");
        }

        [data-theme="dark"] .btn-filtros-adv:hover,
        [data-theme="dark"] .btn-filtros-adv.open { background: #1F2D44; }

        [data-theme="dark"] .chip:hover { background: #1F2D44; }

        [data-theme="dark"] .filtros-panel { background: #1A2438; }

        [data-theme="dark"] .filtro-group select { background: #0E1626; color: var(--marrom); }

        [data-theme="dark"] .animal-card { box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        [data-theme="dark"] .animal-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.5); }

        [data-theme="dark"] .skeleton {
          background: linear-gradient(90deg, #1A2438 25%, #243050 50%, #1A2438 75%);
          background-size: 200% 100%;
        }

        [data-theme="dark"] .modal-box { background: #1A2438; }
        [data-theme="dark"] .modal-cancel { background: #0E1626; border-color: #2A3552; color: var(--marrom-m); }

        [data-theme="dark"] .search-input::placeholder { color: #4A5573; }
        [data-theme="dark"] .search-clear { color: #4A5573; }

        .feed-page {
          min-height: 100vh;
          background-color: var(--cream);
          background-image: ${PAW_BG};
          background-size: 120px 120px;
          background-repeat: repeat;
          font-family: 'Nunito', system-ui, sans-serif;
          color: var(--marrom);
        }

        /* ── Cabeçalho da página ── */
        .feed-header {
          padding: 40px 80px 0;
          max-width: 1400px;
          margin: 0 auto;
        }
        .feed-title {
          font-family: 'Baloo 2', sans-serif;
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 800;
          color: var(--marrom);
          margin: 0 0 4px;
          letter-spacing: -0.02em;
        }
        .feed-subtitle {
          font-size: 15px;
          color: var(--marrom-m);
          margin: 0 0 28px;
          font-weight: 500;
        }
        .feed-count {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--laranja);
          color: var(--marrom);
          font-size: 13px;
          font-weight: 800;
          padding: 5px 14px;
          border-radius: 999px;
          margin-left: 10px;
          font-family: 'Baloo 2', sans-serif;
        }

        /* ── Busca ── */
        .search-bar {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 16px;
        }
        .search-input-wrap {
          flex: 1;
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 16px; top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 14px 48px 14px 46px;
          border-radius: 999px;
          border: 2px solid var(--line);
          background: var(--paper);
          font-size: 15px;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          color: var(--marrom);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          box-shadow: 0 2px 8px rgba(45,27,20,0.06);
        }
        .search-input:focus {
          border-color: var(--laranja-d);
          box-shadow: 0 0 0 3px rgba(232,168,124,0.2);
        }
        .search-input::placeholder { color: #B89880; font-weight: 500; }
        .search-clear {
          position: absolute;
          right: 16px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; font-size: 16px;
          color: #B89880; padding: 2px;
        }
        .btn-filtros-adv {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 13px 20px;
          border-radius: 999px;
          border: 2px solid var(--line);
          background: var(--paper);
          font-size: 14px;
          font-weight: 700;
          font-family: 'Nunito', sans-serif;
          color: var(--marrom-m);
          cursor: pointer;
          white-space: nowrap;
          transition: border-color .15s, background .15s;
          box-shadow: 0 2px 8px rgba(45,27,20,0.06);
        }
        .btn-filtros-adv:hover, .btn-filtros-adv.open {
          border-color: var(--laranja-d);
          background: #FFF5EC;
        }

        /* ── Chips de filtro ── */
        .chips-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 16px;
          border-radius: 999px;
          border: 2px solid var(--line);
          background: var(--paper);
          font-size: 13px;
          font-weight: 700;
          font-family: 'Nunito', sans-serif;
          color: var(--marrom-m);
          cursor: pointer;
          transition: all .15s;
          white-space: nowrap;
        }
        .chip:hover { border-color: var(--laranja-d); background: #FFF5EC; }
        .chip.active {
          background: var(--marrom);
          color: var(--cream);
          border-color: var(--marrom);
          box-shadow: 0 3px 0 rgba(45,27,20,0.3);
        }
        .chip-icon { font-size: 14px; }

        /* ── Painel filtros avançados ── */
        .filtros-panel {
          background: var(--paper);
          border: 2px solid var(--line);
          border-radius: 20px;
          padding: 20px 24px;
          margin-bottom: 12px;
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          box-shadow: 0 4px 16px rgba(45,27,20,0.08);
        }
        .filtro-group label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          color: var(--marrom-m);
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 8px;
        }
        .filtro-group select {
          padding: 9px 14px;
          border-radius: 12px;
          border: 2px solid var(--line);
          background: var(--cream);
          font-size: 13px;
          font-weight: 600;
          color: var(--marrom);
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          outline: none;
          min-width: 140px;
        }
        .filtro-group select:focus { border-color: var(--laranja-d); }

        /* ── Barra de ordem + contagem ── */
        .feed-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 24px;
          padding-top: 8px;
          border-top: 2px dashed var(--line);
        }
        .feed-result-count {
          font-size: 14px;
          font-weight: 700;
          color: var(--marrom-m);
        }
        .feed-result-count strong { color: var(--marrom); }
        .ordem-btns { display: flex; gap: 6px; }
        .ordem-btn {
          padding: 6px 14px;
          border-radius: 999px;
          border: 2px solid var(--line);
          background: var(--paper);
          font-size: 12px;
          font-weight: 700;
          color: var(--marrom-m);
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          transition: all .15s;
        }
        .ordem-btn.active {
          background: var(--laranja);
          border-color: var(--laranja);
          color: var(--marrom);
          box-shadow: 0 2px 0 var(--laranja-d);
        }

        /* ── Main content ── */
        .feed-main {
          padding: 24px 80px 0;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* ── Grid de cards ── */
        .feed-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 48px;
        }
        @media (max-width: 1199px) { .feed-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 899px)  { .feed-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 599px)  { .feed-grid { grid-template-columns: 1fr; } }

        /* ── Animal Card ── */
        .animal-card {
          background: var(--paper);
          border-radius: 24px;
          border: 2px solid var(--line);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform .2s ease, box-shadow .2s ease;
          box-shadow: 0 2px 8px rgba(45,27,20,0.06);
          cursor: default;
        }
        .animal-card:hover {
          box-shadow: 0 12px 32px rgba(45,27,20,0.14);
        }

        .card-name {
          margin: 0;
          font-family: 'Baloo 2', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: var(--marrom);
          letter-spacing: -0.01em;
          line-height: 1.15;
        }
        .card-age {
          font-size: 12px;
          color: var(--marrom-m);
          font-weight: 700;
          white-space: nowrap;
        }
        .card-breed {
          margin: 3px 0 0;
          font-size: 13px;
          color: var(--marrom-m);
          font-weight: 500;
        }
        .card-desc {
          margin: 8px 0 0;
          font-size: 12px;
          color: #8B6040;
          line-height: 1.5;
          font-weight: 500;
        }

        /* Tags */
        .tag {
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 999px;
          letter-spacing: .02em;
        }
        .tag-blue { background: var(--azul-l); color: var(--azul); }
        .tag-green { background: var(--verde-l); color: var(--verde); }

        /* Botões do card */
        .btn-adotar {
          flex: 1;
          padding: 11px 0;
          border-radius: 999px;
          border: none;
          background: var(--marrom);
          color: var(--cream);
          font-family: 'Baloo 2', sans-serif;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: transform .15s, background .15s, box-shadow .15s;
          box-shadow: 0 3px 0 rgba(45,27,20,0.35);
        }
        .btn-adotar:hover:not(:disabled) {
          background: var(--verde);
          transform: translateY(-1px);
          box-shadow: 0 4px 0 rgba(74,103,65,0.4);
        }
        .btn-adotar:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }

        .btn-denunciar {
          width: 40px; height: 40px;
          border-radius: 999px;
          border: 2px solid var(--line);
          background: var(--paper);
          font-size: 14px;
          cursor: pointer;
          color: #C07040;
          transition: border-color .15s, background .15s;
          display: grid; place-items: center;
          flex-shrink: 0;
        }
        .btn-denunciar:hover {
          border-color: #E85A30;
          background: #FDECEA;
          color: #E85A30;
        }

        /* Like button */
        .like-btn {
          position: absolute;
          top: 22px; right: 22px;
          width: 36px; height: 36px;
          border-radius: 999px;
          background: rgba(255,255,255,0.92);
          border: none;
          display: grid; place-items: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform .2s;
        }
        .like-btn:hover { transform: scale(1.15); }

        /* ── Empty state ── */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 64px 32px;
        }
        .empty-state .empty-icon { font-size: 64px; margin-bottom: 16px; }
        .empty-state h3 {
          font-family: 'Baloo 2', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: var(--marrom);
          margin: 0 0 8px;
        }
        .empty-state p {
          font-size: 15px;
          color: var(--marrom-m);
          margin: 0;
        }

        /* ── Skeleton loading ── */
        .skeleton-card {
          background: var(--paper);
          border-radius: 24px;
          border: 2px solid var(--line);
          overflow: hidden;
          padding: 12px 12px 18px;
        }
        .skeleton {
          background: linear-gradient(90deg, #F0E8DC 25%, #FBF3EB 50%, #F0E8DC 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 12px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(45,27,20,0.45);
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          backdrop-filter: blur(4px);
          animation: fadeIn .2s ease;
        }
        .modal-box {
          background: var(--paper);
          border-radius: 28px;
          padding: 36px 32px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 24px 60px rgba(45,27,20,0.25);
          animation: slideUp .25s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-cancel {
          flex: 1; padding: 13px 0;
          border-radius: 999px;
          border: 2px solid var(--line);
          background: var(--cream);
          font-size: 14px; font-weight: 800;
          font-family: 'Nunito', sans-serif;
          color: var(--marrom-m); cursor: pointer;
          transition: border-color .15s;
        }
        .modal-cancel:hover { border-color: var(--marrom-m); }
        .modal-confirm {
          flex: 1; padding: 13px 0;
          border-radius: 999px;
          border: none;
          background: var(--verde);
          color: white;
          font-size: 14px; font-weight: 800;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 0 rgba(74,103,65,0.4);
          transition: transform .15s, opacity .15s;
        }
        .modal-confirm:hover:not(:disabled) { transform: translateY(-1px); }
        .modal-confirm:disabled { opacity: 0.65; cursor: not-allowed; box-shadow: none; }

        /* ── Toast ── */
        .toast {
          position: fixed;
          bottom: 32px; left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          padding: 14px 24px;
          border-radius: 999px;
          font-size: 14px; font-weight: 800;
          font-family: 'Nunito', sans-serif;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          animation: toastIn .3s cubic-bezier(.34,1.56,.64,1);
          white-space: nowrap;
        }
        .toast-success { background: var(--verde); color: white; }
        .toast-error   { background: #D94040; color: white; }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Responsividade ── */
        @media (max-width: 991px) {
          .feed-header, .feed-main { padding-left: 24px; padding-right: 24px; }
        }
        @media (max-width: 575px) {
          .feed-header, .feed-main { padding-left: 16px; padding-right: 16px; }
          .feed-title { font-size: 28px; }
          .btn-filtros-adv span { display: none; }
        }
      `}</style>

      <div className="feed-page">

        {/* ── Cabeçalho ── */}
        <div className="feed-header">
          <h1 className="feed-title">
            Encontre seu amigo
            {animais.length > 0 && (
              <span className="feed-count">{animaisFiltrados.length} pets</span>
            )}
          </h1>
          <p className="feed-subtitle">
            Cada animal merece um lar cheio de amor. Encontre o seu companheiro ideal. 🐾
          </p>

          {/* Barra de busca */}
          <div className="search-bar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                type="search"
                placeholder="Buscar por nome, raça ou espécie..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                autoComplete="off"
              />
              {busca && (
                <button className="search-clear" onClick={() => setBusca('')}>✕</button>
              )}
            </div>
            <button
              className={`btn-filtros-adv ${showFiltros ? 'open' : ''}`}
              onClick={() => setShowFiltros(v => !v)}
            >
              <span>⚙️</span>
              <span>Filtros</span>
            </button>
          </div>

          {/* Chips rápidos */}
          <div className="chips-row">
            {FILTROS.map(f => (
              <button
                key={f.key}
                className={`chip ${filtroAtivo === f.key ? 'active' : ''}`}
                onClick={() => setFiltroAtivo(f.key)}
              >
                <span className="chip-icon">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          {/* Painel filtros avançados */}
          {showFiltros && (
            <div className="filtros-panel">
              <div className="filtro-group">
                <label>Porte</label>
                <select onChange={e => {
                  if (e.target.value === '') setFiltroAtivo('todos')
                  else setFiltroAtivo(e.target.value)
                }}>
                  <option value="">Qualquer porte</option>
                  <option value="pequeno">Pequeno</option>
                  <option value="adulto">Médio</option>
                  <option value="grande">Grande</option>
                </select>
              </div>
              <div className="filtro-group">
                <label>Sexo</label>
                <select onChange={e => {
                  if (e.target.value === '') setFiltroAtivo('todos')
                  else setFiltroAtivo(e.target.value)
                }}>
                  <option value="">Qualquer sexo</option>
                  <option value="macho">Macho</option>
                  <option value="femea">Fêmea</option>
                </select>
              </div>
              <div className="filtro-group">
                <label>Fase da vida</label>
                <select onChange={e => {
                  if (e.target.value === '') setFiltroAtivo('todos')
                  else setFiltroAtivo(e.target.value)
                }}>
                  <option value="">Qualquer idade</option>
                  <option value="filhote">Filhote</option>
                  <option value="adulto">Adulto</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── Feed principal ── */}
        <div className="feed-main">

          {/* Toolbar */}
          {!loading && !error && (
            <div className="feed-toolbar">
              <span className="feed-result-count">
                <strong>{animaisFiltrados.length}</strong> {animaisFiltrados.length === 1 ? 'pet encontrado' : 'pets encontrados'}
                {busca && <> para "<strong>{busca}</strong>"</>}
              </span>
              <div className="ordem-btns">
                {(['recentes', 'nome', 'idade'] as const).map(o => (
                  <button
                    key={o}
                    className={`ordem-btn ${ordemAtiva === o ? 'active' : ''}`}
                    onClick={() => setOrdemAtiva(o)}
                  >
                    {o === 'recentes' ? '🕐 Recentes' : o === 'nome' ? '🔤 Nome' : '📅 Idade'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="feed-grid">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton" style={{ aspectRatio: '1/1', marginBottom: 14 }} />
                  <div className="skeleton" style={{ height: 22, width: '60%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 38, borderRadius: 999 }} />
                </div>
              ))
            ) : error ? (
              <div className="empty-state">
                <div className="empty-icon">😿</div>
                <h3>Erro ao carregar</h3>
                <p>Não conseguimos buscar os pets. Tente novamente mais tarde.</p>
              </div>
            ) : animaisFiltrados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>Nenhum pet encontrado</h3>
                <p>Tente ajustar os filtros ou a busca para encontrar mais amigos.</p>
              </div>
            ) : (
              animaisFiltrados.map((a, i) => (
                <AnimalCard
                  key={a.id}
                  animal={a}
                  index={i}
                  onAdotar={handleAdotar}
                  onDenunciar={handleDenunciar}
                  adotando={adotandoId === a.id}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal de confirmação */}
      {modalAnimal && (
        <Modal
          animal={modalAnimal}
          onConfirm={confirmarAdocao}
          onCancel={() => setModalAnimal(null)}
          loading={adotando}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  )
}

export default AnimalFeed