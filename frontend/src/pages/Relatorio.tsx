/**
 * Relatorio.tsx — PawAdoption
 * Rota: /home/relatorio  (ABRIGO e ADOTANTE tutor)
 *
 * Endpoint:
 *   GET /animais/relatorio → resumo, totais por espécie e lista dos animais sob cuidados do usuário
 *
 * RF08 — relatório de animais (adotados e disponíveis)
 * RN15 — inclui apenas animais sob cuidados do usuário
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import '../styles/Feed.css'

// ─── Tipos locais ─────────────────────────────────────────────────────────────

type StatusAnimal = 'PENDENTE' | 'DISPONIVEL' | 'ADOTADO' | 'PROCESSO_ADOCAO'

interface AnimalRelatorio {
  id:          number
  nome:        string
  especie:     string
  raca?:       string | null
  idade?:      number | null
  porte?:      'PEQUENO' | 'MEDIO' | 'GRANDE' | null
  sexo?:       'MACHO' | 'FEMEA' | null
  status:      StatusAnimal
  created_at:  string
  data_adocao?: string | null
  adotante?:   { usuario: { nome: string; email: string } } | null
}

interface RelatorioData {
  geradoEm: string
  resumo: {
    total:       number
    disponiveis: number
    emProcesso:  number
    pendentes:   number
    adotados:    number
  }
  porEspecie: { especie: string; total: number; adotados: number }[]
  animais:    AnimalRelatorio[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_INFO: Record<StatusAnimal, { label: string; bg: string; fg: string; border: string }> = {
  DISPONIVEL:      { label: 'Disponível',  bg: 'var(--blue-50)', fg: 'var(--blue)', border: 'var(--blue-100)' },
  PROCESSO_ADOCAO: { label: 'Em processo', bg: '#FFF3CD', fg: '#856404', border: '#FFECB5' },
  PENDENTE:        { label: 'Em validação', bg: '#F1F1F4', fg: '#5A6070', border: '#DADCE3' },
  ADOTADO:         { label: 'Adotado',     bg: '#E3F4EA', fg: '#2F7A50', border: '#BFE3CC' },
}

const formatarData = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—'

const porteLabel = (p?: AnimalRelatorio['porte']) =>
  p === 'PEQUENO' ? 'Pequeno' : p === 'GRANDE' ? 'Grande' : p === 'MEDIO' ? 'Médio' : '—'

const sexoLabel = (s?: AnimalRelatorio['sexo']) =>
  s === 'MACHO' ? 'Macho' : s === 'FEMEA' ? 'Fêmea' : '—'

const idadeLabel = (n?: number | null) => {
  if (n === undefined || n === null) return '—'
  if (n === 0) return 'Filhote'
  return `${n} ${n === 1 ? 'ano' : 'anos'}`
}

// Dias entre o cadastro e a adoção
const diasAteAdocao = (a: AnimalRelatorio) => {
  if (!a.data_adocao) return null
  const dias = Math.round((new Date(a.data_adocao).getTime() - new Date(a.created_at).getTime()) / 86_400_000)
  return Math.max(dias, 0)
}

// ─── CSS da página (inclui regras de impressão) ───────────────────────────────

const PAGE_STYLE = `
  .rel-body { padding: 28px 80px 56px; display: flex; flex-direction: column; gap: 24px; }

  .rel-resumo { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
  .rel-tile {
    background: var(--paper); border: 1.5px solid var(--line); border-radius: 18px;
    padding: 16px 18px;
  }
  .rel-tile-valor { font-family: 'Baloo 2', system-ui; font-size: 2rem; font-weight: 800; line-height: 1; }
  .rel-tile-label { font-size: 0.8rem; font-weight: 700; color: var(--ink-3); margin-top: 6px; }

  .rel-card {
    background: var(--paper); border: 1.5px solid var(--line); border-radius: 20px;
    padding: 20px 22px;
  }
  .rel-card-titulo {
    font-family: 'Baloo 2', system-ui; font-size: 1.15rem; font-weight: 800;
    color: var(--ink); margin: 0 0 14px; display: flex; align-items: center; gap: 8px;
  }

  .rel-barra-linha { display: grid; grid-template-columns: 110px 1fr 90px; gap: 12px; align-items: center; }
  .rel-barra-linha + .rel-barra-linha { margin-top: 10px; }
  .rel-barra-nome { font-size: 0.86rem; font-weight: 700; color: var(--ink-2); text-transform: capitalize; }
  .rel-barra-trilho { height: 12px; border-radius: 999px; background: var(--cream-2); overflow: hidden; display: flex; }
  .rel-barra-num { font-size: 0.8rem; font-weight: 700; color: var(--ink-3); text-align: right; }

  .rel-tabela-wrap { overflow-x: auto; }
  .rel-tabela { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
  .rel-tabela th {
    text-align: left; font-size: 0.72rem; font-weight: 800; color: var(--ink-3);
    letter-spacing: .06em; text-transform: uppercase;
    padding: 8px 10px; border-bottom: 1.5px solid var(--line); white-space: nowrap;
  }
  .rel-tabela td {
    padding: 10px; border-bottom: 1px solid var(--line); color: var(--ink-2); vertical-align: top;
  }
  .rel-tabela tr:last-child td { border-bottom: none; }
  .rel-tabela td strong { color: var(--ink); }
  .rel-vazio { font-size: 0.86rem; color: var(--ink-3); padding: 8px 0; }

  .rel-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 999px; border: 2px solid var(--blue-100);
    background: var(--paper); color: var(--blue);
    font-family: 'Baloo 2', system-ui; font-size: 0.9rem; font-weight: 800; cursor: pointer;
  }

  @media (max-width: 991.98px) { .rel-body { padding: 20px 24px 40px; } }
  @media (max-width: 600px) { .rel-barra-linha { grid-template-columns: 80px 1fr 70px; } }

  /* Impressão / salvar em PDF: só o relatório, fundo branco */
  @media print {
    .appnav, footer, .rel-no-print { display: none !important; }
    body, .feed-page, .feed-header { background: #fff !important; }
    .rel-body { padding: 0; }
    .rel-card, .rel-tile { break-inside: avoid; border-color: #ccc; }
    .rel-tabela-wrap { overflow: visible; }
  }
`

// ─── Página ───────────────────────────────────────────────────────────────────

export const Relatorio = () => {
  const { usuario } = useAuth()
  const ehAbrigo = usuario?.tipo_usuario === 'ABRIGO'

  const [dados,   setDados]   = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro,    setErro]    = useState('')

  const fetchRelatorio = async () => {
    setLoading(true)
    setErro('')
    try {
      const { data } = await api.get<RelatorioData>('/animais/relatorio')
      setDados(data)
    } catch (e: any) {
      setErro(e?.response?.data?.error || 'Erro ao gerar o relatório.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRelatorio() }, [])

  // ─── Estados ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="feed-page" style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        Gerando relatório…
      </div>
    )
  }

  if (erro || !dados) {
    return (
      <div className="feed-page" style={{ padding: '60px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: '#FFF5F5', border: '1.5px solid #f5c2c7',
          borderRadius: 12, padding: '16px 20px', maxWidth: 520, width: '100%',
          color: '#842029', fontWeight: 700, fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span>⚠️ {erro || 'Erro ao gerar o relatório.'}</span>
          <button onClick={fetchRelatorio} style={{
            background: 'none', border: 'none', color: '#842029',
            fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem',
          }}>Tentar novamente</button>
        </div>
      </div>
    )
  }

  const { resumo, porEspecie, animais } = dados
  const adotados    = animais.filter(a => a.status === 'ADOTADO')
  const naoAdotados = animais.filter(a => a.status !== 'ADOTADO')

  const temposAdocao = adotados.map(diasAteAdocao).filter((d): d is number => d !== null)
  const mediaDias = temposAdocao.length
    ? Math.round(temposAdocao.reduce((s, d) => s + d, 0) / temposAdocao.length)
    : null

  const tiles = [
    { valor: resumo.total,       label: 'Animais sob cuidados', cor: 'var(--ink)' },
    { valor: resumo.disponiveis, label: 'Disponíveis',          cor: 'var(--blue)' },
    { valor: resumo.emProcesso,  label: 'Em processo de adoção', cor: '#B7791F' },
    { valor: resumo.adotados,    label: 'Adotados',             cor: '#2F7A50' },
    ...(resumo.pendentes > 0 || !ehAbrigo
      ? [{ valor: resumo.pendentes, label: 'Em validação', cor: '#5A6070' }]
      : []),
  ]

  const maiorEspecie = Math.max(1, ...porEspecie.map(e => e.total))

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="feed-page">
      <style>{PAGE_STYLE}</style>

      {/* Cabeçalho */}
      <div className="feed-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 className="feed-title">Relatório de animais</h1>
            <p className="feed-subtitle" style={{ marginBottom: 0 }}>
              {ehAbrigo ? 'Animais sob cuidados do abrigo' : 'Animais que você anunciou como lar temporário'}
              {usuario?.nome && <> · <strong>{usuario.nome}</strong></>}
              <br />
              Gerado em {new Date(dados.geradoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>
          {resumo.total > 0 && (
            <button className="rel-btn rel-no-print" onClick={() => window.print()}>
              🖨️ Imprimir / salvar PDF
            </button>
          )}
        </div>
      </div>

      <div className="rel-body">
        {resumo.total === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            <div style={{ fontSize: 44 }}>📊</div>
            <div style={{ fontFamily: "'Baloo 2', system-ui", fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-2)' }}>
              Nenhum animal sob seus cuidados ainda
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              <Link to="/animais/cadastrar" style={{ color: 'var(--blue)', fontWeight: 800 }}>Cadastre um animal</Link>
              {' '}para começar a acompanhar os números.
            </div>
          </div>
        ) : (
          <>
            {/* Resumo */}
            <div className="rel-resumo">
              {tiles.map(t => (
                <div key={t.label} className="rel-tile">
                  <div className="rel-tile-valor" style={{ color: t.cor }}>{t.valor}</div>
                  <div className="rel-tile-label">{t.label}</div>
                </div>
              ))}
            </div>

            {/* Por espécie */}
            <section className="rel-card">
              <h2 className="rel-card-titulo">Por espécie</h2>
              {porEspecie.map(e => (
                <div key={e.especie} className="rel-barra-linha">
                  <span className="rel-barra-nome">{e.especie}</span>
                  <div className="rel-barra-trilho" title={`${e.adotados} adotado(s) de ${e.total}`}>
                    <div style={{ width: `${(e.adotados / maiorEspecie) * 100}%`, background: '#4FB286' }} />
                    <div style={{ width: `${((e.total - e.adotados) / maiorEspecie) * 100}%`, background: 'var(--blue-300)' }} />
                  </div>
                  <span className="rel-barra-num">{e.adotados}/{e.total} adot.</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: '0.76rem', color: 'var(--ink-3)', fontWeight: 700 }}>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#4FB286', marginRight: 6 }} />Adotados</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--blue-300)', marginRight: 6 }} />Ainda sob cuidados</span>
              </div>
            </section>

            {/* Adotados */}
            <section className="rel-card">
              <h2 className="rel-card-titulo">
                🏠 Adotados <span className="feed-count">{adotados.length}</span>
              </h2>
              {mediaDias !== null && (
                <p style={{ fontSize: '0.84rem', color: 'var(--ink-2)', margin: '-6px 0 12px' }}>
                  Tempo médio do cadastro até a adoção: <strong>{mediaDias} dia{mediaDias !== 1 ? 's' : ''}</strong>
                </p>
              )}
              {adotados.length === 0 ? (
                <div className="rel-vazio">Nenhum animal adotado ainda.</div>
              ) : (
                <div className="rel-tabela-wrap">
                  <table className="rel-tabela">
                    <thead>
                      <tr>
                        <th>Animal</th>
                        <th>Espécie / raça</th>
                        <th>Cadastrado em</th>
                        <th>Adotado em</th>
                        <th>Adotado por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adotados.map(a => (
                        <tr key={a.id}>
                          <td><strong>{a.nome}</strong></td>
                          <td>{[a.especie, a.raca].filter(Boolean).join(' · ')}</td>
                          <td>{formatarData(a.created_at)}</td>
                          <td>{formatarData(a.data_adocao)}</td>
                          <td>
                            {a.adotante?.usuario.nome ?? '—'}
                            {a.adotante?.usuario.email && (
                              <div style={{ fontSize: '0.76rem', color: 'var(--ink-3)' }}>{a.adotante.usuario.email}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Sob cuidados */}
            <section className="rel-card">
              <h2 className="rel-card-titulo">
                🐾 Disponíveis e em andamento <span className="feed-count">{naoAdotados.length}</span>
              </h2>
              {naoAdotados.length === 0 ? (
                <div className="rel-vazio">Todos os seus animais já foram adotados. 🎉</div>
              ) : (
                <div className="rel-tabela-wrap">
                  <table className="rel-tabela">
                    <thead>
                      <tr>
                        <th>Animal</th>
                        <th>Espécie / raça</th>
                        <th>Porte</th>
                        <th>Sexo</th>
                        <th>Idade</th>
                        <th>Situação</th>
                        <th>Cadastrado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {naoAdotados.map(a => {
                        const info = STATUS_INFO[a.status]
                        return (
                          <tr key={a.id}>
                            <td><strong>{a.nome}</strong></td>
                            <td>{[a.especie, a.raca].filter(Boolean).join(' · ')}</td>
                            <td>{porteLabel(a.porte)}</td>
                            <td>{sexoLabel(a.sexo)}</td>
                            <td>{idadeLabel(a.idade)}</td>
                            <td>
                              <span style={{
                                display: 'inline-block', whiteSpace: 'nowrap',
                                background: info.bg, color: info.fg, border: `1px solid ${info.border}`,
                                fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 999,
                              }}>
                                {info.label}
                              </span>
                            </td>
                            <td>{formatarData(a.created_at)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}