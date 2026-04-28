/**
 * AbrigoFeed.tsx — PawAdoption
 * Rota: /abrigos
 *
 * Endpoints:
 *   GET /abrigos  → lista abrigos ativos (inclui usuario + endereco)
 *   POST /voluntarios/solicitar/:abrigo_id → voluntariar (requer JWT)
 *   POST /denuncias/denunciar/:id          → denunciar   (requer JWT)
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import type { Abrigo } from '../types'

// ─── Paw pattern ─────────────────────────────────────────────────────────────
const PAW_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%232D1B14' fill-opacity='0.03'><ellipse cx='22' cy='30' rx='4' ry='5'/><ellipse cx='31' cy='24' rx='3.5' ry='4.5'/><ellipse cx='40' cy='24' rx='3.5' ry='4.5'/><ellipse cx='49' cy='30' rx='4' ry='5'/><path d='M30 43c0-5.5 3-9 7-9s7 3.5 7 9c0 3.5-2.5 5-5 5s-1.5 1-2 1-1.5-1-3.5-1-3.5-1.5-3.5-5z'/><ellipse cx='82' cy='90' rx='3' ry='4'/><ellipse cx='89' cy='85' rx='2.8' ry='3.8'/><ellipse cx='96' cy='85' rx='2.8' ry='3.8'/><ellipse cx='103' cy='90' rx='3' ry='4'/><path d='M88 100c0-4.5 2.5-7.5 5.5-7.5s5.5 3 5.5 7.5c0 3-2 4-4 4s-1.2.8-1.5.8-1.2-.8-2.5-.8-3-1-3-4z'/></g></svg>")`

// ─── Tipos ────────────────────────────────────────────────────────────────────
type AbrigoFull = Abrigo & {
  usuario: {
    nome: string
    email: string
    telefone?: string
    created_at: string
    endereco?: {
      cidade: string
      estado: string
      bairro?: string
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const GRADIENTS = [
  ['#FFD9B0', '#E8A87C'],
  ['#B5D4F4', '#5b94d4'],
  ['#C0DD97', '#4A9B6F'],
  ['#F4C0D1', '#D4537E'],
  ['#FFD27A', '#C8941A'],
  ['#C5B8F4', '#7B5EA8'],
]

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

// ─── Chips de filtro ──────────────────────────────────────────────────────────
type Filtro = { key: string; label: string; icon: string }

const FILTROS: Filtro[] = [
  { key: 'todos',  label: 'Todos',    icon: '🏠' },
  { key: 'grande', label: 'Grande capacidade', icon: '🏢' },
  { key: 'novo',   label: 'Novos',    icon: '✨' },
  { key: 'pr',     label: 'Paraná',   icon: '📍' },
  { key: 'sp',     label: 'São Paulo',icon: '📍' },
  { key: 'rs',     label: 'Rio Grande do Sul', icon: '📍' },
]

const matchFiltro = (a: AbrigoFull, key: string): boolean => {
  if (key === 'todos')  return true
  if (key === 'grande') return (a.capacidade ?? 0) >= 100
  if (key === 'novo')   return new Date().getTime() - new Date(a.usuario.created_at).getTime() < 90 * 24 * 60 * 60 * 1000
  // filtros por estado — match parcial no sigla
  const estado = a.usuario.endereco?.estado?.toLowerCase() ?? ''
  return estado.startsWith(key)
}

// ─── Photo placeholder ────────────────────────────────────────────────────────
const SheltherPhoto = ({ nome, index }: { nome: string; index: number }) => {
  const [from, to] = GRADIENTS[index % GRADIENTS.length]
  const initials = nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: '100%', aspectRatio: '16/9',
      background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      borderRadius: 20, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 10,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 800, color: to,
        fontFamily: "'Baloo 2', sans-serif",
      }}>{initials}</div>
      <span style={{
        fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
        color: to, fontWeight: 800,
        background: 'rgba(255,255,255,0.7)', padding: '3px 10px', borderRadius: 999,
      }}>{nome.slice(0, 20)}</span>
    </div>
  )
}

// ─── ShelterCard ─────────────────────────────────────────────────────────────
const ShelterCard = ({
  abrigo, index, onVoluntariar, onDenunciar, voluntariando,
}: {
  abrigo: AbrigoFull
  index: number
  onVoluntariar: (id: number) => void
  onDenunciar: (id: number) => void
  voluntariando: boolean
}) => {
  const [hovered, setHovered] = useState(false)
  const nome = abrigo.usuario.nome
  const cidade = abrigo.usuario.endereco?.cidade
  const estado = abrigo.usuario.endereco?.estado
  const desde = new Date(abrigo.usuario.created_at).getFullYear()
  const isNovo = new Date().getTime() - new Date(abrigo.usuario.created_at).getTime() < 90 * 24 * 60 * 60 * 1000

  return (
    <article
      className="shelter-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ transform: hovered ? 'translateY(-5px)' : 'translateY(0)' }}
    >
      {/* Foto / placeholder */}
      <div style={{ position: 'relative', padding: '12px 12px 0' }}>
        <SheltherPhoto nome={nome} index={index} />

        {/* Badges */}
        <div style={{ position: 'absolute', top: 22, left: 22, display: 'flex', gap: 6 }}>
          {isNovo && (
            <span className="badge-novo">NOVO</span>
          )}
          {abrigo.capacidade && (
            <span className="badge-cap">
              {abrigo.capacidade} pets
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h3 className="card-name">{nome}</h3>
          {(cidade || estado) && (
            <span className="card-location">
              📍 {[cidade, estado].filter(Boolean).join(', ')}
            </span>
          )}
        </div>

        {abrigo.razao_social && (
          <p className="card-razao">{abrigo.razao_social}</p>
        )}

        {abrigo.sobre && (
          <p className="card-desc">
            {abrigo.sobre.slice(0, 90)}{abrigo.sobre.length > 90 ? '…' : ''}
          </p>
        )}

        {/* Stats */}
        <div className="shelter-stats">
          {abrigo.capacidade && (
            <div className="stat">
              <span className="stat-n">{abrigo.capacidade}</span>
              <span className="stat-l">Capacidade</span>
            </div>
          )}
          <div className="stat">
            <span className="stat-n">{desde}</span>
            <span className="stat-l">Desde</span>
          </div>
          {abrigo.site_url && (
            <div className="stat">
              <a
                href={abrigo.site_url.startsWith('http') ? abrigo.site_url : `https://${abrigo.site_url}`}
                target="_blank" rel="noreferrer"
                className="stat-link"
              >
                🌐 Site
              </a>
            </div>
          )}
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            className="btn-voluntariar"
            onClick={() => onVoluntariar(abrigo.usuario_id)}
            disabled={voluntariando}
          >
            {voluntariando ? '⏳' : '🙌'} Voluntariar
          </button>
          <button
            className="btn-denunciar"
            onClick={() => onDenunciar(abrigo.usuario_id)}
            title="Denunciar"
          >⚑</button>
        </div>
      </div>
    </article>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div className={`toast toast-${type}`}>{msg}</div>
)

// ─── AbrigoFeed ─────────────────────────────────────────────────────────────
export const AbrigoFeed = () => {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [abrigos, setAbrigos]     = useState<AbrigoFull[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)

  const [busca, setBusca]         = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState('todos')
  const [showFiltros, setShowFiltros] = useState(false)
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [ordemAtiva, setOrdemAtiva] = useState<'recentes'|'nome'|'capacidade'>('recentes')

  const [volId, setVolId]         = useState<number | null>(null)
  const [toast, setToast]         = useState<{ msg: string; type: 'success'|'error' } | null>(null)

  const showToast = (msg: string, type: 'success'|'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    setLoading(true)
    api.get<AbrigoFull[]>('/abrigos')
      .then(res => setAbrigos(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const abrigosFiltrados = useMemo(() => {
    let lista = abrigos.filter(a => {
      const matchF = matchFiltro(a, filtroAtivo)
      const term = busca.toLowerCase()
      const matchB = !term || [
        a.usuario.nome,
        a.razao_social ?? '',
        a.sobre ?? '',
        a.usuario.endereco?.cidade ?? '',
        a.usuario.endereco?.estado ?? '',
      ].some(s => s.toLowerCase().includes(term))
      const matchE = !estadoFiltro || (a.usuario.endereco?.estado ?? '').toLowerCase() === estadoFiltro.toLowerCase()
      return matchF && matchB && matchE
    })

    if (ordemAtiva === 'nome')       lista = [...lista].sort((a, b) => a.usuario.nome.localeCompare(b.usuario.nome))
    if (ordemAtiva === 'capacidade') lista = [...lista].sort((a, b) => (b.capacidade ?? 0) - (a.capacidade ?? 0))
    if (ordemAtiva === 'recentes')   lista = [...lista].sort((a, b) =>
      new Date(b.usuario.created_at).getTime() - new Date(a.usuario.created_at).getTime()
    )
    return lista
  }, [abrigos, filtroAtivo, busca, estadoFiltro, ordemAtiva])

  const handleVoluntariar = async (id: number) => {
    if (!usuario) { navigate('/login'); return }
    setVolId(id)
    try {
      await api.post(`/voluntarios/solicitar/${id}`)
      showToast('Solicitação de voluntariado enviada! 🐾', 'success')
    } catch {
      showToast('Erro ao enviar solicitação. Tente novamente.', 'error')
    } finally {
      setVolId(null)
    }
  }

  const handleDenunciar = async (id: number) => {
    if (!usuario) { navigate('/login'); return }
    try {
      await api.post(`/denuncias/denunciar/${id}`)
      showToast('Denúncia registrada. Obrigado! ✅', 'success')
    } catch {
      showToast('Erro ao registrar denúncia.', 'error')
    }
  }

  return (
    <>
      <div className="shelter-page">

        {/* ── Cabeçalho ── */}
        <div className="shelter-header">
          <h1 className="shelter-title">
            Conheça os abrigos
            {abrigos.length > 0 && (
              <span className="feed-count">{abrigosFiltrados.length} abrigos</span>
            )}
          </h1>
          <p className="shelter-subtitle">
            Heróis que cuidam de animais todos os dias. Apoie, visite ou se voluntarie. 🏠
          </p>

          {/* Busca */}
          <div className="search-bar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                type="search"
                placeholder="Buscar por nome, cidade ou estado..."
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

          {/* Chips */}
          <div className="chips-row">
            {FILTROS.map(f => (
              <button
                key={f.key}
                className={`chip ${filtroAtivo === f.key ? 'active' : ''}`}
                onClick={() => setFiltroAtivo(f.key)}
              >
                <span style={{ fontSize: 14 }}>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          {/* Filtros avançados */}
          {showFiltros && (
            <div className="filtros-panel">
              <div className="filtro-group">
                <label>Estado</label>
                <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
                  <option value="">Todos os estados</option>
                  {ESTADOS_BR.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="filtro-group">
                <label>Capacidade mínima</label>
                <select onChange={e => {
                  const v = Number(e.target.value)
                  if (!v) setFiltroAtivo('todos')
                  else setFiltroAtivo('grande')
                }}>
                  <option value="">Qualquer</option>
                  <option value="50">50+ pets</option>
                  <option value="100">100+ pets</option>
                  <option value="200">200+ pets</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── Feed ── */}
        <div className="shelter-main">

          {/* Toolbar */}
          {!loading && !error && (
            <div className="feed-toolbar">
              <span className="feed-result-count">
                <strong>{abrigosFiltrados.length}</strong>{' '}
                {abrigosFiltrados.length === 1 ? 'abrigo encontrado' : 'abrigos encontrados'}
                {busca && <> para "<strong>{busca}</strong>"</>}
              </span>
              <div className="ordem-btns">
                {(['recentes', 'nome', 'capacidade'] as const).map(o => (
                  <button
                    key={o}
                    className={`ordem-btn ${ordemAtiva === o ? 'active' : ''}`}
                    onClick={() => setOrdemAtiva(o)}
                  >
                    {o === 'recentes' ? '🕐 Recentes' : o === 'nome' ? '🔤 Nome' : '🏠 Capacidade'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="shelter-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton" style={{ aspectRatio: '16/9', marginBottom: 14 }} />
                  <div className="skeleton" style={{ height: 22, width: '55%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 38, borderRadius: 999 }} />
                </div>
              ))
            ) : error ? (
              <div className="empty-state">
                <div className="empty-icon">😿</div>
                <h3>Erro ao carregar</h3>
                <p>Não conseguimos buscar os abrigos. Tente novamente mais tarde.</p>
              </div>
            ) : abrigosFiltrados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>Nenhum abrigo encontrado</h3>
                <p>Tente ajustar os filtros ou a busca.</p>
              </div>
            ) : (
              abrigosFiltrados.map((a, i) => (
                <ShelterCard
                  key={a.usuario_id}
                  abrigo={a}
                  index={i}
                  onVoluntariar={handleVoluntariar}
                  onDenunciar={handleDenunciar}
                  voluntariando={volId === a.usuario_id}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  )
}

export default AbrigoFeed