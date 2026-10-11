/**
 * AbrigoPerfil.tsx — PawAdoption
 * Rota: /abrigos/:id
 *
 * Endpoints:
 *   GET  /abrigos/:id                       → dados do abrigo, animais disponíveis e totais
 *   GET  /voluntarios/minhas_solicitacoes   → candidaturas do adotante logado (para mostrar o status)
 *   POST /voluntarios/solicitar/:abrigo_id  → { disponibilidade, habilidades }
 */

import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import type { Animal } from '../types'
import '../styles/Feed.css'

// ─── Tipos locais ─────────────────────────────────────────────────────────────

type StatusVoluntario = 'PENDENTE' | 'ATIVO' | 'INATIVO' | 'REJEITADO'

interface AbrigoPerfilData {
  usuario_id:     number
  razao_social:   string
  capacidade?:    number | null
  sobre?:         string | null
  site_url?:      string | null
  redes_sociais?: string | null
  usuario: {
    id:         number
    nome:       string
    email:      string
    telefone?:  string | null
    created_at: string
    endereco?: {
      logradouro?: string
      numero?:     string
      bairro?:     string
      cidade:      string
      estado:      string
    } | null
  }
  animais:          Animal[]
  totalAdotados:    number
  totalVoluntarios: number
}

interface MinhaCandidatura {
  id:        number
  abrigo_id: number
  status:    StatusVoluntario
}

// ─── Ícones (SVG — renderizam igual em qualquer sistema) ──────────────────────

const Icone = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
       style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
)

const ICONES = {
  email:  'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm18 2-10 7L2 6',
  fone:   'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
  local:  'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  site:   'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  social: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z',
  cal:    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  seta:   'M5 12h14M12 5l7 7-7 7',
  voltar: 'M19 12H5M12 19l-7-7 7-7',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CANDIDATURA: Record<StatusVoluntario, { titulo: string; texto: string; bg: string; fg: string; border: string }> = {
  PENDENTE:  { titulo: 'Candidatura enviada', texto: 'O abrigo ainda está avaliando sua candidatura.', bg: '#FFF3CD', fg: '#856404', border: '#FFECB5' },
  ATIVO:     { titulo: 'Você é voluntário aqui! 🎉', texto: 'Sua candidatura foi aprovada.', bg: '#E3F4EA', fg: '#2F7A50', border: '#BFE3CC' },
  INATIVO:   { titulo: 'Voluntariado encerrado', texto: 'Você não está mais ativo como voluntário neste abrigo.', bg: '#F1F1F4', fg: '#5A6070', border: '#DADCE3' },
  REJEITADO: { titulo: 'Candidatura não aprovada', texto: 'O abrigo não aprovou sua candidatura desta vez.', bg: '#FFF5F5', fg: '#842029', border: '#f5c2c7' },
}

const especieEmoji = (e: string) => {
  const l = e.toLowerCase()
  if (l.includes('gat')) return '🐱'
  if (l.includes('coelh')) return '🐇'
  if (l.includes('ave') || l.includes('pass')) return '🦜'
  return '🐕'
}

const idadeLabel = (n?: number) => {
  if (n === undefined || n === null) return ''
  if (n === 0) return 'Filhote'
  return `${n} ${n === 1 ? 'ano' : 'anos'}`
}

const porteLabel = (p?: Animal['porte']) =>
  p === 'PEQUENO' ? 'Pequeno' : p === 'GRANDE' ? 'Grande' : p === 'MEDIO' ? 'Médio' : ''

const iniciais = (nome: string) =>
  nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')

const linkExterno = (url: string) => (url.startsWith('http') ? url : `https://${url}`)

// Patinhas brancas translúcidas para a capa
const PAW_COVER = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 120 120'><g fill='%23FFFFFF' fill-opacity='0.10'><ellipse cx='22' cy='30' rx='4' ry='5'/><ellipse cx='31' cy='24' rx='3.5' ry='4.5'/><ellipse cx='40' cy='24' rx='3.5' ry='4.5'/><ellipse cx='49' cy='30' rx='4' ry='5'/><path d='M30 43c0-5.5 3-9 7-9s7 3.5 7 9c0 3.5-2.5 5-5 5s-1.5 1-2 1-1.5-1-3.5-1-3.5-1.5-3.5-5z'/><ellipse cx='82' cy='90' rx='3' ry='4'/><ellipse cx='89' cy='85' rx='2.8' ry='3.8'/><ellipse cx='96' cy='85' rx='2.8' ry='3.8'/><ellipse cx='103' cy='90' rx='3' ry='4'/><path d='M88 100c0-4.5 2.5-7.5 5.5-7.5s5.5 3 5.5 7.5c0 3-2 4-4 4s-1.2.8-1.5.8-1.2-.8-2.5-.8-3-1-3-4z'/></g></svg>")`

// ─── CSS da página ────────────────────────────────────────────────────────────

const PAGE_STYLE = `
  .ap-wrap {
    max-width: 1120px;
    margin: 0 auto;
    padding: 24px 24px 64px;
  }

  /* Capa */
  .ap-cover {
    position: relative;
    height: 220px;
    border-radius: 28px;
    background-color: var(--blue);
    background-image: ${PAW_COVER}, linear-gradient(120deg, #175EA8 0%, #2E7BC9 45%, #E8A87C 100%);
    background-size: 140px 140px, cover;
    overflow: hidden;
  }
  .ap-voltar {
    position: absolute; top: 18px; left: 18px;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 999px;
    background: rgba(255,255,255,0.18); color: #fff;
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    font-size: 0.82rem; font-weight: 800; text-decoration: none;
    transition: background .15s;
  }
  .ap-voltar:hover { background: rgba(255,255,255,0.3); }

  /* Identidade */
  .ap-identidade {
    display: flex; align-items: flex-end; gap: 22px;
    padding: 0 28px;
    margin-top: -64px;
    position: relative;
    flex-wrap: wrap;
  }
  .ap-avatar {
    width: 132px; height: 132px; border-radius: 50%;
    background: linear-gradient(135deg, #FFD9B0 0%, #E8A87C 100%);
    color: #7A3E14;
    border: 6px solid var(--cream);
    display: grid; place-items: center;
    font-family: 'Baloo 2', system-ui; font-size: 2.6rem; font-weight: 800;
    letter-spacing: -0.02em;
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.35);
    flex-shrink: 0;
  }
  .ap-nome-bloco { flex: 1; min-width: 220px; padding-bottom: 6px; }
  .ap-nome {
    font-family: 'Baloo 2', system-ui; font-size: 2rem; font-weight: 800;
    color: var(--ink); margin: 0; line-height: 1.1; letter-spacing: -0.02em;
  }
  .ap-meta {
    display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 6px;
    font-size: 0.86rem; font-weight: 600; color: var(--ink-3);
  }
  .ap-meta span { display: inline-flex; align-items: center; gap: 5px; }
  .ap-acoes { display: flex; gap: 10px; padding-bottom: 8px; flex-wrap: wrap; }

  .ap-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 20px; border-radius: 999px;
    font-family: 'Baloo 2', system-ui; font-size: 0.92rem; font-weight: 800;
    text-decoration: none; cursor: pointer; border: none; white-space: nowrap;
    transition: transform .15s;
  }
  .ap-btn:hover { transform: translateY(-1px); }
  .ap-btn--laranja { background: var(--orange); color: #fff; box-shadow: 0 5px 0 var(--orange-700); }
  .ap-btn--contorno { background: var(--paper); color: var(--blue); border: 2px solid var(--blue-100); }

  /* Números */
  .ap-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    margin: 26px 0 28px;
    background: var(--paper); border: 1.5px solid var(--line); border-radius: 20px;
    overflow: hidden;
  }
  .ap-stat { padding: 16px 18px; text-align: center; }
  .ap-stat + .ap-stat { border-left: 1.5px solid var(--line); }
  .ap-stat-valor {
    font-family: 'Baloo 2', system-ui; font-size: 1.7rem; font-weight: 800;
    color: var(--blue); line-height: 1;
  }
  .ap-stat-label { font-size: 0.78rem; font-weight: 700; color: var(--ink-3); margin-top: 4px; }

  /* Corpo */
  .ap-corpo {
    display: grid;
    grid-template-columns: 330px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  .ap-lateral { display: flex; flex-direction: column; gap: 18px; }
  .ap-card {
    background: var(--paper); border: 1.5px solid var(--line);
    border-radius: 20px; padding: 20px;
  }
  .ap-card-titulo {
    font-family: 'Baloo 2', system-ui; font-size: 1.05rem; font-weight: 800;
    color: var(--ink); margin: 0 0 12px;
  }
  .ap-contato { display: flex; flex-direction: column; gap: 11px; }
  .ap-contato-item {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 0.86rem; color: var(--ink-2); line-height: 1.45; word-break: break-word;
  }
  .ap-contato-item svg { color: var(--blue); margin-top: 2px; }
  .ap-contato-item a { color: var(--blue); font-weight: 700; text-decoration: none; }
  .ap-contato-item a:hover { text-decoration: underline; }

  .ap-secao-topo {
    display: flex; align-items: baseline; justify-content: space-between;
    gap: 12px; margin-bottom: 14px;
  }
  .ap-secao-titulo {
    font-family: 'Baloo 2', system-ui; font-size: 1.35rem; font-weight: 800;
    color: var(--ink); margin: 0; letter-spacing: -0.01em;
  }
  .ap-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 16px;
  }

  /* Card de animal */
  .ap-animal {
    background: var(--paper); border: 1.5px solid var(--line); border-radius: 18px;
    overflow: hidden; text-decoration: none; display: flex; flex-direction: column;
    transition: transform .15s, box-shadow .15s;
  }
  .ap-animal:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .ap-animal-foto { position: relative; aspect-ratio: 4 / 3; background: var(--cream-2); }
  .ap-animal-foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ap-animal-info { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .ap-animal-nome { font-family: 'Baloo 2', system-ui; font-size: 1.05rem; font-weight: 800; color: var(--ink); line-height: 1.1; }
  .ap-animal-sub { font-size: 0.8rem; color: var(--ink-3); }
  .ap-animal-cta {
    margin-top: auto; padding-top: 6px;
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.82rem; font-weight: 800; color: var(--orange);
  }

  .ap-vazio {
    background: var(--paper); border: 1.5px dashed var(--line-2); border-radius: 20px;
    padding: 40px 20px; text-align: center; color: var(--ink-3); font-size: 0.9rem;
  }

  @media (max-width: 991.98px) {
    .ap-corpo { grid-template-columns: 1fr; }
    .ap-lateral { order: 2; }
  }
  @media (max-width: 640px) {
    .ap-wrap { padding: 16px 16px 48px; }
    .ap-cover { height: 150px; border-radius: 22px; }
    .ap-identidade { padding: 0 8px; margin-top: -52px; gap: 14px; }
    .ap-avatar { width: 104px; height: 104px; font-size: 2rem; border-width: 5px; }
    .ap-nome { font-size: 1.6rem; }
    .ap-stats { grid-template-columns: repeat(2, 1fr); }
    .ap-stat:nth-child(3) { border-left: none; }
    .ap-stat:nth-child(n+3) { border-top: 1.5px solid var(--line); }
    .ap-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  }
`

// ─── Card de animal ───────────────────────────────────────────────────────────

const AnimalCard = ({ animal }: { animal: Animal }) => {
  const fotoUrl = animal.fotos?.[0]?.url_foto
    ? `${import.meta.env.VITE_API_URL}${animal.fotos[0].url_foto}`
    : null

  const sub = [animal.raca || animal.especie, idadeLabel(animal.idade), porteLabel(animal.porte)]
    .filter(Boolean).join(' · ')

  return (
    <Link to={`/adotar/${animal.id}`} className="ap-animal">
      <div className="ap-animal-foto">
        {fotoUrl ? (
          <img src={fotoUrl} alt={animal.nome} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #FFD9B0 0%, #E8A87C 100%)',
            display: 'grid', placeItems: 'center', fontSize: 44,
          }}>
            {especieEmoji(animal.especie)}
          </div>
        )}
        {animal.status === 'PROCESSO_ADOCAO' && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: '#FFF3CD', color: '#856404', border: '1px solid #FFECB5',
            fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 999,
            letterSpacing: '.04em', textTransform: 'uppercase',
          }}>Em processo</span>
        )}
      </div>
      <div className="ap-animal-info">
        <span className="ap-animal-nome">{animal.nome}</span>
        <span className="ap-animal-sub">{sub}</span>
        <span className="ap-animal-cta">
          Conhecer <Icone d={ICONES.seta} size={14} />
        </span>
      </div>
    </Link>
  )
}

// ─── Seção de candidatura ─────────────────────────────────────────────────────

interface CandidaturaProps {
  abrigoId:    number
  candidatura: MinhaCandidatura | null
  onEnviada:   (c: MinhaCandidatura) => void
}

const SecaoCandidatura = ({ abrigoId, candidatura, onEnviada }: CandidaturaProps) => {
  const [disponibilidade, setDisponibilidade] = useState('')
  const [habilidades,     setHabilidades]     = useState('')
  const [loading,         setLoading]         = useState(false)
  const [erro,            setErro]            = useState('')

  // Já se candidatou: mostra só o status
  if (candidatura) {
    const info = STATUS_CANDIDATURA[candidatura.status]
    return (
      <div style={{
        background: info.bg, border: `1.5px solid ${info.border}`, color: info.fg,
        borderRadius: 14, padding: '14px 16px',
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{info.titulo}</div>
        <div style={{ fontSize: '0.84rem', marginTop: 2 }}>{info.texto}</div>
        <Link to="/home/voluntarios" style={{ display: 'inline-block', marginTop: 8, fontSize: '0.82rem', fontWeight: 800, color: info.fg }}>
          Ver minhas candidaturas →
        </Link>
      </div>
    )
  }

  const podeEnviar = disponibilidade.trim().length > 0 && !loading

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!podeEnviar) return
    setLoading(true)
    setErro('')
    try {
      const { data } = await api.post<MinhaCandidatura>(`/voluntarios/solicitar/${abrigoId}`, {
        disponibilidade: disponibilidade.trim(),
        habilidades:     habilidades.trim() || undefined,
      })
      onEnviada(data)
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Erro ao enviar candidatura. Tente novamente.')
      setLoading(false)
    }
  }

  const estiloCampo: React.CSSProperties = {
    width: '100%', padding: '10px 13px',
    borderRadius: 11, border: '1.5px solid var(--line-2)',
    background: 'var(--cream)', color: 'var(--ink)',
    fontFamily: "'Nunito', system-ui",
    fontSize: '0.88rem', fontWeight: 600,
    outline: 'none', resize: 'vertical', lineHeight: 1.55,
  }

  const estiloLabel: React.CSSProperties = { fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-2)' }

  return (
    <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
        Conte quando você pode ajudar e no que você é bom. O abrigo avalia e entra em contato.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="ap-disp" style={estiloLabel}>
          Disponibilidade <span style={{ color: 'var(--orange)' }}>*</span>
        </label>
        <textarea
          id="ap-disp"
          value={disponibilidade}
          onChange={e => setDisponibilidade(e.target.value)}
          placeholder="Ex.: sábados de manhã, terças após as 18h…"
          rows={2}
          maxLength={500}
          style={estiloCampo}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="ap-hab" style={estiloLabel}>
          Habilidades <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>(opcional)</span>
        </label>
        <textarea
          id="ap-hab"
          value={habilidades}
          onChange={e => setHabilidades(e.target.value)}
          placeholder="Ex.: passeios, fotografia, transporte, limpeza…"
          rows={3}
          maxLength={500}
          style={estiloCampo}
        />
      </div>

      {erro && (
        <div style={{
          background: '#FFF5F5', border: '1.5px solid #f5c2c7',
          borderRadius: 10, padding: '10px 13px',
          fontSize: '0.82rem', fontWeight: 700, color: '#842029',
        }}>
          ⚠️ {erro}
        </div>
      )}

      <button
        type="submit"
        disabled={!podeEnviar}
        className="ap-btn ap-btn--laranja"
        style={{
          justifyContent: 'center', marginTop: 4,
          opacity: podeEnviar ? 1 : 0.55,
          cursor: podeEnviar ? 'pointer' : 'not-allowed',
        }}
      >
        {loading ? 'Enviando…' : 'Enviar candidatura'}
      </button>
    </form>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export const AbrigoPerfil = () => {
  const { id } = useParams<{ id: string }>()
  const { usuario } = useAuth()
  const ehAdotante = usuario?.tipo_usuario === 'ADOTANTE'
  const ehDono     = usuario?.id === Number(id)

  const [abrigo,      setAbrigo]      = useState<AbrigoPerfilData | null>(null)
  const [candidatura, setCandidatura] = useState<MinhaCandidatura | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [erro,        setErro]        = useState('')

  const voluntarioRef = useRef<HTMLDivElement>(null)

  const fetchAbrigo = async () => {
    setLoading(true)
    setErro('')
    try {
      const { data } = await api.get<AbrigoPerfilData>(`/abrigos/${id}`)
      setAbrigo(data)

      // Para adotantes, verifica se já existe candidatura neste abrigo
      if (ehAdotante) {
        const { data: minhas } = await api.get<MinhaCandidatura[]>('/voluntarios/minhas_solicitacoes')
        setCandidatura(minhas.find(c => c.abrigo_id === Number(id)) ?? null)
      }
    } catch (e: any) {
      setErro(e?.response?.status === 404 ? 'Abrigo não encontrado.' : 'Erro ao carregar o abrigo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAbrigo() }, [id, ehAdotante])

  const irParaVoluntariado = () =>
    voluntarioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  // ─── Estados de carregamento / erro ─────────────────────────────────────────

  if (loading) {
    return (
      <div className="feed-page" style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🐾</div>
        Carregando abrigo…
      </div>
    )
  }

  if (erro || !abrigo) {
    return (
      <div className="feed-page" style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--ink-2)' }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🏠</div>
        <div style={{ fontFamily: "'Baloo 2', system-ui", fontSize: '1.2rem', fontWeight: 800 }}>{erro || 'Abrigo não encontrado.'}</div>
        <Link to="/abrigos" style={{ display: 'inline-block', marginTop: 12, color: 'var(--blue)', fontWeight: 800 }}>
          ← Voltar para abrigos
        </Link>
      </div>
    )
  }

  const u           = abrigo.usuario
  const endereco    = u.endereco
  const nomeExibido = abrigo.razao_social || u.nome
  const membroDesde = new Date(u.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const stats = [
    { valor: abrigo.animais.length,   label: 'para adoção' },
    { valor: abrigo.totalAdotados,    label: abrigo.totalAdotados === 1 ? 'adotado' : 'adotados' },
    { valor: abrigo.totalVoluntarios, label: abrigo.totalVoluntarios === 1 ? 'voluntário' : 'voluntários' },
    { valor: abrigo.capacidade ?? '—', label: 'de capacidade' },
  ]

  const enderecoCompleto = endereco
    ? [
        endereco.logradouro && `${endereco.logradouro}${endereco.numero ? `, ${endereco.numero}` : ''}`,
        endereco.bairro,
        `${endereco.cidade}/${endereco.estado}`,
      ].filter(Boolean).join(' · ')
    : null

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="feed-page">
      <style>{PAGE_STYLE}</style>

      <div className="ap-wrap">
        {/* Capa */}
        <div className="ap-cover">
          <Link to="/abrigos" className="ap-voltar">
            <Icone d={ICONES.voltar} size={14} /> Abrigos
          </Link>
        </div>

        {/* Identidade */}
        <div className="ap-identidade">
          <div className="ap-avatar">{iniciais(nomeExibido)}</div>

          <div className="ap-nome-bloco">
            <h1 className="ap-nome">{nomeExibido}</h1>
            <div className="ap-meta">
              {endereco && (
                <span><Icone d={ICONES.local} size={14} /> {endereco.cidade}, {endereco.estado}</span>
              )}
              <span><Icone d={ICONES.cal} size={14} /> Na PawAdoption desde {membroDesde}</span>
            </div>
          </div>

          <div className="ap-acoes">
            {ehDono && (
              <>
                <Link to="/animais/cadastrar" className="ap-btn ap-btn--laranja">+ Cadastrar animal</Link>
                <Link to="/home/voluntarios" className="ap-btn ap-btn--contorno">Voluntários</Link>
              </>
            )}
            {ehAdotante && !candidatura && (
              <button onClick={irParaVoluntariado} className="ap-btn ap-btn--laranja">🙌 Quero ser voluntário</button>
            )}
            {!ehDono && (
              <a href={`mailto:${u.email}`} className="ap-btn ap-btn--contorno">
                <Icone d={ICONES.email} size={15} /> Contato
              </a>
            )}
          </div>
        </div>

        {/* Números */}
        <div className="ap-stats">
          {stats.map(s => (
            <div key={s.label} className="ap-stat">
              <div className="ap-stat-valor">{s.valor}</div>
              <div className="ap-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Corpo */}
        <div className="ap-corpo">
          {/* Lateral */}
          <aside className="ap-lateral">
            <section className="ap-card">
              <h2 className="ap-card-titulo">Sobre</h2>
              {abrigo.sobre ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', margin: 0, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {abrigo.sobre}
                </p>
              ) : (
                <p style={{ fontSize: '0.86rem', color: 'var(--ink-3)', margin: 0, fontStyle: 'italic' }}>
                  {ehDono
                    ? 'Seu abrigo ainda não tem uma apresentação. Conte sua história para os adotantes!'
                    : 'Este abrigo ainda não escreveu uma apresentação.'}
                </p>
              )}
            </section>

            <section className="ap-card">
              <h2 className="ap-card-titulo">Contato</h2>
              <div className="ap-contato">
                <div className="ap-contato-item">
                  <Icone d={ICONES.email} />
                  <a href={`mailto:${u.email}`}>{u.email}</a>
                </div>
                {u.telefone && (
                  <div className="ap-contato-item">
                    <Icone d={ICONES.fone} />
                    <a href={`tel:${u.telefone}`}>{u.telefone}</a>
                  </div>
                )}
                {enderecoCompleto && (
                  <div className="ap-contato-item">
                    <Icone d={ICONES.local} />
                    <span>{enderecoCompleto}</span>
                  </div>
                )}
                {abrigo.site_url && (
                  <div className="ap-contato-item">
                    <Icone d={ICONES.site} />
                    <a href={linkExterno(abrigo.site_url)} target="_blank" rel="noopener noreferrer">{abrigo.site_url}</a>
                  </div>
                )}
                {abrigo.redes_sociais && (
                  <div className="ap-contato-item">
                    <Icone d={ICONES.social} />
                    <span>{abrigo.redes_sociais}</span>
                  </div>
                )}
              </div>
            </section>

            {ehAdotante && (
              <section ref={voluntarioRef} className="ap-card" style={{ border: '2px solid var(--orange-100)' }}>
                <h2 className="ap-card-titulo">Seja voluntário</h2>
                <SecaoCandidatura
                  abrigoId={abrigo.usuario_id}
                  candidatura={candidatura}
                  onEnviada={setCandidatura}
                />
              </section>
            )}
          </aside>

          {/* Animais */}
          <section style={{ minWidth: 0 }}>
            <div className="ap-secao-topo">
              <h2 className="ap-secao-titulo">Animais para adoção</h2>
              <span className="feed-count">{abrigo.animais.length}</span>
            </div>

            {abrigo.animais.length === 0 ? (
              <div className="ap-vazio">
                <div style={{ fontSize: 36, marginBottom: 8 }}>🐾</div>
                {ehDono
                  ? <>Você ainda não tem animais disponíveis. <Link to="/animais/cadastrar" style={{ color: 'var(--blue)', fontWeight: 800 }}>Cadastrar o primeiro</Link></>
                  : 'Nenhum animal disponível para adoção neste abrigo no momento.'}
              </div>
            ) : (
              <div className="ap-grid">
                {abrigo.animais.map(a => <AnimalCard key={a.id} animal={a} />)}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}