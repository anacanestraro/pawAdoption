/**
 * CadastrarAnimal.tsx — PawAdoption
 * Rota: /animais/cadastrar  (ADOTANTE e ABRIGO)
 *
 * Endpoints:
 *   POST /animais/cadastrar  → cadastra animal (requer JWT)
 *   POST /animais/:id/fotos  → upload de 1 a 5 fotos (campo "fotos"), após a criação
 *   DELETE /animais/deletar/:id → desfaz o cadastro se o envio das fotos falhar
 *
 * Layout desktop — grid 2 colunas:
 *   esquerda : Foto  |  Características
 *   direita  : Informações básicas  |  Descrição
 *   rodapé   : aviso + erro + botões (span 2 colunas, centralizado)
 */

import '../styles/CadastrarAnimal.css'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import type { Animal } from '../types'

// ─── Tipos derivados dos types do projeto ─────────────────────────────────────

type Porte = NonNullable<Animal['porte']>   // 'PEQUENO' | 'MEDIO' | 'GRANDE'
type Sexo  = NonNullable<Animal['sexo']>    // 'MACHO' | 'FEMEA'

interface FormState {
  nome:      string
  especie:   string
  raca:      string
  idade:     string
  porte:     Porte | ''
  sexo:      Sexo  | ''
  descricao: string
}

const INITIAL_FORM: FormState = {
  nome: '', especie: '', raca: '', idade: '', porte: '', sexo: '', descricao: '',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PAW_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%232D1B14' fill-opacity='0.03'><ellipse cx='22' cy='30' rx='4' ry='5'/><ellipse cx='31' cy='24' rx='3.5' ry='4.5'/><ellipse cx='40' cy='24' rx='3.5' ry='4.5'/><ellipse cx='49' cy='30' rx='4' ry='5'/><path d='M30 43c0-5.5 3-9 7-9s7 3.5 7 9c0 3.5-2.5 5-5 5s-1.5 1-2 1-1.5-1-3.5-1-3.5-1.5-3.5-5z'/><ellipse cx='82' cy='90' rx='3' ry='4'/><ellipse cx='89' cy='85' rx='2.8' ry='3.8'/><ellipse cx='96' cy='85' rx='2.8' ry='3.8'/><ellipse cx='103' cy='90' rx='3' ry='4'/><path d='M88 100c0-4.5 2.5-7.5 5.5-7.5s5.5 3 5.5 7.5c0 3-2 4-4 4s-1.2.8-1.5.8-1.2-.8-2.5-.8-3-1-3-4z'/></g></svg>")`

// RN08 — de 1 a 5 fotos por animal (mesmos limites do back)
const MAX_FOTOS      = 5
const MAX_TAMANHO_MB = 5
const TIPOS_ACEITOS  = ['image/jpeg', 'image/png', 'image/webp']

interface FotoSelecionada {
  id:      string
  file:    File
  preview: string
}

const ESPECIES_COMUNS = ['Cachorro', 'Gato', 'Coelho', 'Ave', 'Roedor', 'Réptil', 'Outro']

// ─── Chip de seleção ─────────────────────────────────────────────────────────

interface ChipProps {
  label: string; icon?: string; selected: boolean; onClick: () => void; color?: string
}

const Chip = ({ label, icon, selected, onClick, color = 'var(--blue)' }: ChipProps) => (
  <button
    type="button"
    className={`ca-chip${selected ? ' ca-chip--on' : ''}`}
    style={selected ? { borderColor: color, background: color + '15', color } : {}}
    onClick={onClick}
  >
    {icon && <span className="ca-chip-icon">{icon}</span>}
    {label}
  </button>
)

// ─── Galeria de upload (1 a 5 fotos) ──────────────────────────────────────────

const GALERIA_STYLE = `
  .ca-galeria { display: flex; flex-direction: column; gap: 10px; }
  .ca-galeria-capa {
    position: relative; width: 100%; aspect-ratio: 4/3;
    border-radius: 14px; overflow: hidden;
    border: 2px solid var(--line); background: var(--cream);
  }
  .ca-galeria-capa img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ca-galeria-tag {
    position: absolute; top: 10px; left: 10px;
    background: var(--blue); color: #fff;
    font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 999px;
  }
  .ca-galeria-thumbs { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .ca-galeria-thumb {
    position: relative; aspect-ratio: 1/1; border-radius: 10px; overflow: hidden;
    border: 2px solid var(--line); background: var(--cream); padding: 0; cursor: pointer;
  }
  .ca-galeria-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ca-galeria-thumb--capa { border-color: var(--blue); }
  .ca-galeria-remover {
    position: absolute; top: 3px; right: 3px;
    width: 22px; height: 22px; border-radius: 50%;
    border: none; background: rgba(0,0,0,0.6); color: #fff;
    font-size: 12px; font-weight: 800; line-height: 1; cursor: pointer;
    display: grid; place-items: center;
  }
  .ca-galeria-add {
    aspect-ratio: 1/1; border-radius: 10px;
    border: 2px dashed var(--line-2); background: var(--cream); color: var(--ink-3);
    font-size: 22px; font-weight: 700; cursor: pointer;
    display: grid; place-items: center; transition: border-color .15s, color .15s;
  }
  .ca-galeria-add:hover { border-color: var(--blue-300); color: var(--blue); }
  .ca-galeria-info {
    display: flex; justify-content: space-between; gap: 8px;
    font-size: 0.76rem; color: var(--ink-3); font-weight: 600;
  }
`

interface GaleriaProps {
  fotos:      FotoSelecionada[]
  onAdicionar: (files: File[]) => void
  onRemover:   (id: string) => void
  onTornarCapa: (id: string) => void
}

const GaleriaUpload = ({ fotos, onAdicionar, onRemover, onTornarCapa }: GaleriaProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const abrirSeletor = () => inputRef.current?.click()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    onAdicionar(Array.from(e.dataTransfer.files))
  }

  const dragProps = {
    onDragOver:  (e: React.DragEvent) => { e.preventDefault(); setDragging(true) },
    onDragLeave: () => setDragging(false),
    onDrop:      handleDrop,
  }

  const input = (
    <input
      ref={inputRef} type="file" accept={TIPOS_ACEITOS.join(',')} multiple
      style={{ display: 'none' }}
      onChange={e => {
        onAdicionar(Array.from(e.target.files ?? []))
        e.target.value = ''   // permite escolher o mesmo arquivo de novo depois de remover
      }}
    />
  )

  // Nenhuma foto ainda: área grande de upload
  if (fotos.length === 0) {
    return (
      <div
        className={`ca-upload${dragging ? ' ca-upload--drag' : ''}`}
        {...dragProps}
        onClick={abrirSeletor}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && abrirSeletor()}
        aria-label="Adicionar fotos do animal"
      >
        {input}
        <div className="ca-upload-placeholder">
          <div className="ca-upload-icon">🐾</div>
          <p className="ca-upload-label">Arraste até {MAX_FOTOS} fotos ou clique para selecionar</p>
          <p className="ca-upload-hint">JPG, PNG ou WEBP até {MAX_TAMANHO_MB}MB cada · mínimo 1 foto</p>
        </div>
      </div>
    )
  }

  const [capa, ...resto] = fotos

  return (
    <div className="ca-galeria" {...dragProps}
         style={dragging ? { outline: '2px dashed var(--blue)', outlineOffset: 4, borderRadius: 14 } : undefined}>
      {input}

      <div className="ca-galeria-capa">
        <img src={capa.preview} alt="Foto de capa" />
        <span className="ca-galeria-tag">Capa</span>
      </div>

      <div className="ca-galeria-thumbs">
        {[capa, ...resto].map((f, i) => (
          <button
            key={f.id}
            type="button"
            className={`ca-galeria-thumb${i === 0 ? ' ca-galeria-thumb--capa' : ''}`}
            onClick={() => onTornarCapa(f.id)}
            title={i === 0 ? 'Foto de capa' : 'Usar como capa'}
          >
            <img src={f.preview} alt={`Foto ${i + 1}`} />
            <span
              role="button"
              tabIndex={0}
              className="ca-galeria-remover"
              aria-label={`Remover foto ${i + 1}`}
              onClick={e => { e.stopPropagation(); onRemover(f.id) }}
              onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onRemover(f.id) } }}
            >
              ✕
            </span>
          </button>
        ))}
        {fotos.length < MAX_FOTOS && (
          <button type="button" className="ca-galeria-add" onClick={abrirSeletor} aria-label="Adicionar mais fotos">
            +
          </button>
        )}
      </div>

      <div className="ca-galeria-info">
        <span>{fotos.length}/{MAX_FOTOS} fotos</span>
        <span>Clique numa miniatura para usar como capa</span>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const CadastrarAnimal = () => {
  const { usuario } = useAuth()
  const navigate    = useNavigate()

  const [form,        setForm]        = useState<FormState>(INITIAL_FORM)
  const [fotos,       setFotos]       = useState<FotoSelecionada[]>([])
  const [loading,     setLoading]     = useState(false)
  const [erro,        setErro]        = useState('')
  const [step,        setStep]        = useState<'form' | 'sucesso'>('form')

  const isAbrigo = usuario?.tipo_usuario === 'ABRIGO'

  const set = (field: keyof FormState) => (val: string) =>
    setForm(prev => ({ ...prev, [field]: val }))

  // Libera as URLs de preview quando a tela é desmontada
  const fotosRef = useRef(fotos)
  fotosRef.current = fotos
  useEffect(() => () => fotosRef.current.forEach(f => URL.revokeObjectURL(f.preview)), [])

  const adicionarFotos = (files: File[]) => {
    setErro('')
    const vagas = MAX_FOTOS - fotos.length
    if (vagas <= 0) return setErro(`Você já escolheu ${MAX_FOTOS} fotos, que é o máximo.`)

    const invalidas = files.filter(f => !TIPOS_ACEITOS.includes(f.type))
    const grandes   = files.filter(f => TIPOS_ACEITOS.includes(f.type) && f.size > MAX_TAMANHO_MB * 1024 * 1024)
    const validas   = files.filter(f => !invalidas.includes(f) && !grandes.includes(f))
    const aceitas   = validas.slice(0, vagas)

    const avisos: string[] = []
    if (invalidas.length) avisos.push(`${invalidas.length} arquivo(s) ignorado(s): use JPG, PNG ou WEBP.`)
    if (grandes.length)   avisos.push(`${grandes.length} foto(s) acima de ${MAX_TAMANHO_MB}MB ignorada(s).`)
    if (validas.length > vagas) avisos.push(`Só cabem mais ${vagas} foto(s); o máximo é ${MAX_FOTOS}.`)
    if (avisos.length) setErro(avisos.join(' '))

    setFotos(prev => [
      ...prev,
      ...aceitas.map(file => ({
        id:      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ])
  }

  const removerFoto = (id: string) =>
    setFotos(prev => {
      const alvo = prev.find(f => f.id === id)
      if (alvo) URL.revokeObjectURL(alvo.preview)
      return prev.filter(f => f.id !== id)
    })

  // A primeira foto é a capa (aparece nos cards do feed)
  const tornarCapa = (id: string) =>
    setFotos(prev => {
      const alvo = prev.find(f => f.id === id)
      return alvo ? [alvo, ...prev.filter(f => f.id !== id)] : prev
    })

  const limparFotos = () => {
    fotos.forEach(f => URL.revokeObjectURL(f.preview))
    setFotos([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    if (!form.nome.trim())    return setErro('O nome do animal é obrigatório.')
    if (!form.especie.trim()) return setErro('A espécie é obrigatória.')
    if (!form.porte)          return setErro('Selecione o porte do animal.')
    if (!form.sexo)           return setErro('Selecione o sexo do animal.')
    if (fotos.length === 0)   return setErro('Adicione pelo menos 1 foto do animal.')

    setLoading(true)
    try {
      const payload: Pick<Animal, 'nome' | 'especie'> &
        Partial<Pick<Animal, 'raca' | 'idade' | 'porte' | 'sexo' | 'descricao'>> = {
          nome:      form.nome.trim(),
          especie:   form.especie.trim(),
          raca:      form.raca.trim()      || undefined,
          idade:     form.idade            ? Number(form.idade) : undefined,
          porte:     form.porte            as Porte,
          sexo:      form.sexo             as Sexo,
          descricao: form.descricao.trim() || undefined,
        }

      const { data: novoAnimal } = await api.post<Animal>('/animais/cadastrar', payload)

      const formData = new FormData()
      fotos.forEach(f => formData.append('fotos', f.file))

      try {
        await api.post(`/animais/${novoAnimal.id}/fotos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } catch (erroFotos: any) {
        // Desfaz o cadastro para não deixar um animal sem fotos (RN08)
        await api.delete(`/animais/deletar/${novoAnimal.id}`).catch(() => {})
        throw erroFotos
      }

      limparFotos()
      setStep('sucesso')
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Erro ao cadastrar animal. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Sucesso ──────────────────────────────────────────────────────────────

  if (step === 'sucesso') {
    return (
      <div className="ca-page" style={{ backgroundImage: PAW_BG }}>
        <div className="ca-success">
          <div className="ca-success-icon">🐾</div>
          <h2 className="ca-success-title">Animal cadastrado!</h2>
          <p className="ca-success-desc">
            {isAbrigo
              ? 'O animal já está disponível para adoção no feed.'
              : 'Seu cadastro foi enviado para validação. Em breve estará visível.'}
          </p>
          <div className="ca-success-actions">
            <button className="ca-btn ca-btn--primary" onClick={() => navigate('/home')}>
              Ver animais
            </button>
            <button className="ca-btn ca-btn--ghost" onClick={() => {
              setForm(INITIAL_FORM); limparFotos(); setStep('form')
            }}>
              Cadastrar outro
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Formulário ───────────────────────────────────────────────────────────

  return (
    <div className="ca-page" style={{ backgroundImage: PAW_BG }}>
      <style>{GALERIA_STYLE}</style>

      {/* Header */}
      <div className="ca-header">
        <div className="ca-header-inner">
          <button type="button" className="ca-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
            ←
          </button>
          <div>
            <h1 className="ca-title">
              Cadastrar animal <span className="ca-title-emoji">🐾</span>
            </h1>
            <p className="ca-subtitle">
              {isAbrigo
                ? 'O animal ficará disponível para adoção imediatamente.'
                : 'O animal passará por validação antes de aparecer no feed.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="ca-body">
        <form className="ca-form" onSubmit={handleSubmit} noValidate>

          {/* ── COL ESQ — Foto ── */}
          <section className="ca-section ca-section--foto">
            <h2 className="ca-section-title">📷 Fotos <span className="ca-required">*</span></h2>
            <GaleriaUpload
              fotos={fotos}
              onAdicionar={adicionarFotos}
              onRemover={removerFoto}
              onTornarCapa={tornarCapa}
            />
          </section>

          {/* ── COL DIR — Informações básicas ── */}
          <section className="ca-section ca-section--basico">
            <h2 className="ca-section-title">📋 Informações básicas</h2>

            <div className="ca-field">
              <label className="ca-label" htmlFor="nome">
                Nome do animal <span className="ca-required">*</span>
              </label>
              <input
                id="nome" className="ca-input" type="text"
                placeholder="Ex: Thor, Mel, Bolinha…"
                value={form.nome} onChange={e => set('nome')(e.target.value)}
                maxLength={100} required
              />
            </div>

            <div className="ca-row">
              <div className="ca-field">
                <label className="ca-label" htmlFor="especie">
                  Espécie <span className="ca-required">*</span>
                </label>
                <input
                  id="especie" className="ca-input" type="text"
                  placeholder="Ex: Cachorro, Gato…"
                  value={form.especie} onChange={e => set('especie')(e.target.value)}
                  list="especies-list" maxLength={50} required
                />
                <datalist id="especies-list">
                  {ESPECIES_COMUNS.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div className="ca-field">
                <label className="ca-label" htmlFor="raca">Raça</label>
                <input
                  id="raca" className="ca-input" type="text"
                  placeholder="Ex: Golden, SRD…"
                  value={form.raca} onChange={e => set('raca')(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="ca-field">
              <label className="ca-label" htmlFor="idade">Idade (em anos)</label>
              <input
                id="idade" className="ca-input ca-input--sm" type="number"
                min={0} max={30} placeholder="0 = filhote"
                value={form.idade} onChange={e => set('idade')(e.target.value)}
              />
            </div>
          </section>

          {/* ── COL ESQ — Características ── */}
          <section className="ca-section ca-section--caract">
            <h2 className="ca-section-title">✨ Características</h2>

            <div className="ca-field">
              <label className="ca-label">Porte <span className="ca-required">*</span></label>
              <div className="ca-chip-group">
                <Chip label="Pequeno" icon="🐩" color="#4A9B6F"
                  selected={form.porte === 'PEQUENO'} onClick={() => set('porte')('PEQUENO')} />
                <Chip label="Médio"   icon="🐕" color="#5B7FA6"
                  selected={form.porte === 'MEDIO'}   onClick={() => set('porte')('MEDIO')} />
                <Chip label="Grande"  icon="🦮" color="#C0692B"
                  selected={form.porte === 'GRANDE'}  onClick={() => set('porte')('GRANDE')} />
              </div>
            </div>

            <div className="ca-field">
              <label className="ca-label">Sexo <span className="ca-required">*</span></label>
              <div className="ca-chip-group">
                <Chip label="Macho" icon="♂" color="var(--blue)"
                  selected={form.sexo === 'MACHO'} onClick={() => set('sexo')('MACHO')} />
                <Chip label="Fêmea" icon="♀" color="#D4537E"
                  selected={form.sexo === 'FEMEA'} onClick={() => set('sexo')('FEMEA')} />
              </div>
            </div>
          </section>

          {/* ── COL DIR — Descrição ── */}
          <section className="ca-section ca-section--descricao">
            <h2 className="ca-section-title">💬 Descrição</h2>
            <div className="ca-field">
              <label className="ca-label" htmlFor="descricao">
                Conte um pouco sobre o animal
              </label>
              <textarea
                id="descricao"
                className="ca-input ca-textarea"
                placeholder="Personalidade, necessidades especiais, histórico, se é vacinado…"
                value={form.descricao}
                onChange={e => set('descricao')(e.target.value)}
                rows={5}
                maxLength={1000}
              />
              <span className="ca-char-count">{form.descricao.length}/1000</span>
            </div>
          </section>

          {/* ── RODAPÉ (span 2 colunas) ── */}
          <div className="ca-footer">
            {!isAbrigo && (
              <div className="ca-notice">
                <span className="ca-notice-icon">ℹ️</span>
                <p>
                  Como adotante, seu animal ficará com status <strong>Pendente</strong> até
                  ser validado por um administrador.
                </p>
              </div>
            )}

            {erro && (
              <div className="ca-error" role="alert">
                <span>⚠️</span> {erro}
              </div>
            )}

            <div className="ca-form-actions">
              <button type="button" className="ca-btn ca-btn--ghost"
                onClick={() => navigate(-1)} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="ca-btn ca-btn--primary" disabled={loading}>
                {loading
                  ? <span className="ca-spinner" />
                  : isAbrigo ? '✓ Publicar animal' : '✓ Enviar para validação'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}