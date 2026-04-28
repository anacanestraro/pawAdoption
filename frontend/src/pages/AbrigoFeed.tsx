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

        [data-theme="dark"] .shelter-page {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%23FFFFFF' fill-opacity='0.03'><ellipse cx='22' cy='30' rx='4' ry='5'/><ellipse cx='31' cy='24' rx='3.5' ry='4.5'/><ellipse cx='40' cy='24' rx='3.5' ry='4.5'/><ellipse cx='49' cy='30' rx='4' ry='5'/><path d='M30 43c0-5.5 3-9 7-9s7 3.5 7 9c0 3.5-2.5 5-5 5s-1.5 1-2 1-1.5-1-3.5-1-3.5-1.5-3.5-5z'/><ellipse cx='82' cy='90' rx='3' ry='4'/><ellipse cx='89' cy='85' rx='2.8' ry='3.8'/><ellipse cx='96' cy='85' rx='2.8' ry='3.8'/><ellipse cx='103' cy='90' rx='3' ry='4'/><path d='M88 100c0-4.5 2.5-7.5 5.5-7.5s5.5 3 5.5 7.5c0 3-2 4-4 4s-1.2.8-1.5.8-1.2-.8-2.5-.8-3-1-3-4z'/></g></svg>");
        }

        [data-theme="dark"] .btn-filtros-adv:hover,
        [data-theme="dark"] .btn-filtros-adv.open { background: #1F2D44; }

        [data-theme="dark"] .chip:hover { background: #1F2D44; }

        [data-theme="dark"] .filtros-panel { background: #1A2438; }

        [data-theme="dark"] .filtro-group select { background: #0E1626; color: var(--marrom); }

        [data-theme="dark"] .shelter-card { box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        [data-theme="dark"] .shelter-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.5); }

        [data-theme="dark"] .skeleton {
          background: linear-gradient(90deg, #1A2438 25%, #243050 50%, #1A2438 75%);
          background-size: 200% 100%;
        }

        [data-theme="dark"] .search-input::placeholder { color: #4A5573; }
        [data-theme="dark"] .search-clear { color: #4A5573; }

        .shelter-page {
          min-height: 100vh;
          background-color: var(--cream);
          background-image: ${PAW_BG};
          background-size: 120px 120px;
          background-repeat: repeat;
          font-family: 'Nunito', system-ui, sans-serif;
          color: var(--marrom);
        }

        /* ── Header ── */
        .shelter-header {
          padding: 40px 80px 0;
          max-width: 1400px;
          margin: 0 auto;
        }
        .shelter-title {
          font-family: 'Baloo 2', sans-serif;
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 800;
          color: var(--marrom);
          margin: 0 0 4px;
          letter-spacing: -0.02em;
        }
        .shelter-subtitle {
          font-size: 15px;
          color: var(--marrom-m);
          margin: 0 0 28px;
          font-weight: 500;
        }
        .feed-count {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--laranja); color: var(--marrom);
          font-size: 13px; font-weight: 800;
          padding: 5px 14px; border-radius: 999px; margin-left: 10px;
          font-family: 'Baloo 2', sans-serif;
        }

        /* ── Busca ── */
        .search-bar { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; }
        .search-input-wrap { flex: 1; position: relative; }
        .search-icon {
          position: absolute; left: 16px; top: 50%;
          transform: translateY(-50%); font-size: 18px; pointer-events: none;
        }
        .search-input {
          width: 100%; padding: 14px 48px 14px 46px;
          border-radius: 999px; border: 2px solid var(--line);
          background: var(--paper); font-size: 15px;
          font-family: 'Nunito', sans-serif; font-weight: 600;
          color: var(--marrom); outline: none;
          transition: border-color .15s, box-shadow .15s;
          box-shadow: 0 2px 8px rgba(45,27,20,0.06);
        }
        .search-input:focus {
          border-color: var(--laranja-d);
          box-shadow: 0 0 0 3px rgba(232,168,124,0.2);
        }
        .search-input::placeholder { color: #B89880; font-weight: 500; }
        .search-clear {
          position: absolute; right: 16px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-size: 16px; color: #B89880; padding: 2px;
        }
        .btn-filtros-adv {
          display: flex; align-items: center; gap: 8px;
          padding: 13px 20px; border-radius: 999px;
          border: 2px solid var(--line); background: var(--paper);
          font-size: 14px; font-weight: 700; font-family: 'Nunito', sans-serif;
          color: var(--marrom-m); cursor: pointer; white-space: nowrap;
          transition: border-color .15s, background .15s;
          box-shadow: 0 2px 8px rgba(45,27,20,0.06);
        }
        .btn-filtros-adv:hover, .btn-filtros-adv.open {
          border-color: var(--laranja-d); background: #FFF5EC;
        }

        /* ── Chips ── */
        .chips-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 8px 16px; border-radius: 999px;
          border: 2px solid var(--line); background: var(--paper);
          font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif;
          color: var(--marrom-m); cursor: pointer;
          transition: all .15s; white-space: nowrap;
        }
        .chip:hover { border-color: var(--laranja-d); background: #FFF5EC; }
        .chip.active {
          background: var(--marrom); color: var(--cream);
          border-color: var(--marrom); box-shadow: 0 3px 0 rgba(45,27,20,0.3);
        }

        /* ── Filtros avançados ── */
        .filtros-panel {
          background: var(--paper); border: 2px solid var(--line);
          border-radius: 20px; padding: 20px 24px; margin-bottom: 12px;
          display: flex; gap: 24px; flex-wrap: wrap;
          box-shadow: 0 4px 16px rgba(45,27,20,0.08);
        }
        .filtro-group label {
          display: block; font-size: 11px; font-weight: 800;
          color: var(--marrom-m); text-transform: uppercase;
          letter-spacing: .06em; margin-bottom: 8px;
        }
        .filtro-group select {
          padding: 9px 14px; border-radius: 12px;
          border: 2px solid var(--line); background: var(--cream);
          font-size: 13px; font-weight: 600; color: var(--marrom);
          font-family: 'Nunito', sans-serif; cursor: pointer;
          outline: none; min-width: 160px;
        }
        .filtro-group select:focus { border-color: var(--laranja-d); }

        /* ── Toolbar ── */
        .feed-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px; margin-bottom: 24px;
          padding-top: 8px; border-top: 2px dashed var(--line);
        }
        .feed-result-count { font-size: 14px; font-weight: 700; color: var(--marrom-m); }
        .feed-result-count strong { color: var(--marrom); }
        .ordem-btns { display: flex; gap: 6px; }
        .ordem-btn {
          padding: 6px 14px; border-radius: 999px;
          border: 2px solid var(--line); background: var(--paper);
          font-size: 12px; font-weight: 700; color: var(--marrom-m);
          cursor: pointer; font-family: 'Nunito', sans-serif; transition: all .15s;
        }
        .ordem-btn.active {
          background: var(--laranja); border-color: var(--laranja);
          color: var(--marrom); box-shadow: 0 2px 0 var(--laranja-d);
        }

        /* ── Main ── */
        .shelter-main {
          padding: 24px 80px 0;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* ── Grid ── */
        .shelter-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 48px;
        }
        @media (max-width: 1099px) { .shelter-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 699px)  { .shelter-grid { grid-template-columns: 1fr; } }

        /* ── Shelter Card ── */
        .shelter-card {
          background: var(--paper);
          border-radius: 24px;
          border: 2px solid var(--line);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform .2s ease, box-shadow .2s ease;
          box-shadow: 0 2px 8px rgba(45,27,20,0.06);
        }
        .shelter-card:hover {
          box-shadow: 0 12px 32px rgba(45,27,20,0.14);
        }

        .card-name {
          margin: 0;
          font-family: 'Baloo 2', sans-serif;
          font-size: 19px; font-weight: 800;
          color: var(--marrom); letter-spacing: -0.01em; line-height: 1.15;
        }
        .card-location {
          font-size: 11px; color: var(--marrom-m);
          font-weight: 700; white-space: nowrap;
          flex-shrink: 0;
        }
        .card-razao {
          margin: 2px 0 0;
          font-size: 12px; color: var(--marrom-m); font-weight: 500;
        }
        .card-desc {
          margin: 8px 0 0;
          font-size: 12px; color: #8B6040; line-height: 1.5; font-weight: 500;
        }

        /* Badges */
        .badge-novo {
          background: var(--laranja); color: var(--marrom);
          font-size: 10px; font-weight: 800; padding: 4px 10px;
          border-radius: 999px; letter-spacing: .04em;
        }
        .badge-cap {
          background: rgba(255,255,255,0.92); color: var(--verde);
          font-size: 10px; font-weight: 800; padding: 4px 10px;
          border-radius: 999px; letter-spacing: .04em;
        }

        /* Stats */
        .shelter-stats {
          display: flex; gap: 16px; margin-top: 14px;
          padding-top: 12px; border-top: 2px dashed var(--line);
          flex-wrap: wrap;
        }
        .stat { display: flex; flex-direction: column; }
        .stat-n {
          font-family: 'Baloo 2', sans-serif;
          font-size: 22px; font-weight: 800; color: var(--laranja-d); line-height: 1;
        }
        .stat-l {
          font-size: 10px; font-weight: 700; color: var(--marrom-m);
          text-transform: uppercase; letter-spacing: .06em; margin-top: 2px;
        }
        .stat-link {
          font-size: 12px; font-weight: 700; color: var(--azul);
          text-decoration: none; margin-top: 6px; display: inline-block;
        }
        .stat-link:hover { text-decoration: underline; }

        /* Botões */
        .btn-voluntariar {
          flex: 1; padding: 11px 0; border-radius: 999px; border: none;
          background: var(--marrom); color: var(--cream);
          font-family: 'Baloo 2', sans-serif; font-size: 13px; font-weight: 800;
          cursor: pointer; transition: transform .15s, background .15s, box-shadow .15s;
          box-shadow: 0 3px 0 rgba(45,27,20,0.35);
        }
        .btn-voluntariar:hover:not(:disabled) {
          background: var(--verde); transform: translateY(-1px);
          box-shadow: 0 4px 0 rgba(74,103,65,0.4);
        }
        .btn-voluntariar:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }

        .btn-denunciar {
          width: 40px; height: 40px; border-radius: 999px;
          border: 2px solid var(--line); background: var(--paper);
          font-size: 14px; cursor: pointer; color: #C07040;
          transition: border-color .15s, background .15s;
          display: grid; place-items: center; flex-shrink: 0;
        }
        .btn-denunciar:hover {
          border-color: #E85A30; background: #FDECEA; color: #E85A30;
        }

        /* ── Skeleton ── */
        .skeleton-card {
          background: var(--paper); border-radius: 24px;
          border: 2px solid var(--line); overflow: hidden; padding: 12px 12px 18px;
        }
        .skeleton {
          background: linear-gradient(90deg, #F0E8DC 25%, #FBF3EB 50%, #F0E8DC 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite; border-radius: 12px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Empty ── */
        .empty-state {
          grid-column: 1 / -1; text-align: center; padding: 64px 32px;
        }
        .empty-state .empty-icon { font-size: 64px; margin-bottom: 16px; }
        .empty-state h3 {
          font-family: 'Baloo 2', sans-serif; font-size: 24px;
          font-weight: 800; color: var(--marrom); margin: 0 0 8px;
        }
        .empty-state p { font-size: 15px; color: var(--marrom-m); margin: 0; }

        /* ── Toast ── */
        .toast {
          position: fixed; bottom: 32px; left: 50%;
          transform: translateX(-50%); z-index: 99999;
          padding: 14px 24px; border-radius: 999px;
          font-size: 14px; font-weight: 800; font-family: 'Nunito', sans-serif;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          animation: toastIn .3s cubic-bezier(.34,1.56,.64,1); white-space: nowrap;
        }
        .toast-success { background: var(--verde); color: white; }
        .toast-error   { background: #D94040; color: white; }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        @media (max-width: 991px) {
          .shelter-header, .shelter-main { padding-left: 24px; padding-right: 24px; }
        }
        @media (max-width: 575px) {
          .shelter-header, .shelter-main { padding-left: 16px; padding-right: 16px; }
          .shelter-title { font-size: 28px; }
          .btn-filtros-adv span:last-child { display: none; }
        }
      `}</style>

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