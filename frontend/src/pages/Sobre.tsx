/**
 * Sobre.tsx — PawAdoption
 * Rota: /sobre
 *
 * Página institucional: missão, públicos atendidos, como a plataforma
 * garante adoções seguras e origem do projeto.
 *
 * Endpoints (somente para os números do topo; a página funciona sem eles):
 *   GET /animais → contagem de disponíveis e adotados
 *   GET /abrigos → contagem de abrigos parceiros
 */

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface AnimalResumo { id: number; status: string }
interface AbrigoResumo { id: number }

interface Numeros {
  disponiveis: number
  adotados:    number
  abrigos:     number
}

// ─── Ícones (SVG inline, herdam currentColor) ─────────────────────────────────

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const IconCoracao = () => (
  <Icon><path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" /></Icon>
)
const IconCasa = () => (
  <Icon><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></Icon>
)
const IconMaos = () => (
  <Icon>
    <path d="M7 11V6a2 2 0 0 1 4 0v5" /><path d="M11 10V4a2 2 0 0 1 4 0v6" />
    <path d="M15 10V7a2 2 0 0 1 4 0v7a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L3 14a2 2 0 0 1 3.4-2L7 13" />
  </Icon>
)
const IconEscudo = () => (
  <Icon><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></Icon>
)
const IconConversa = () => (
  <Icon><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></Icon>
)
const IconAlerta = () => (
  <Icon><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></Icon>
)

// ─── Conteúdo ─────────────────────────────────────────────────────────────────

const PUBLICOS = [
  {
    icone: <IconCoracao />, cor: 'var(--orange)', fundo: 'var(--orange-50)',
    titulo: 'Adotantes',
    texto: 'Encontre um animal pelo porte, espécie e cidade, conheça o abrigo responsável e envie sua solicitação de adoção direto pela plataforma.',
  },
  {
    icone: <IconCasa />, cor: 'var(--blue)', fundo: 'var(--blue-50)',
    titulo: 'Abrigos e protetores',
    texto: 'Cadastre os animais sob seus cuidados, acompanhe as solicitações recebidas, organize voluntários e gere relatórios das adoções.',
  },
  {
    icone: <IconMaos />, cor: '#2F7A50', fundo: '#E3F4EA',
    titulo: 'Lares temporários e voluntários',
    texto: 'Ofereça um lar provisório para um animal resgatado ou se candidate como voluntário em um abrigo perto de você.',
  },
]

const SEGURANCA = [
  {
    icone: <IconEscudo />,
    titulo: 'Anúncios validados',
    texto: 'Todo animal cadastrado passa pela revisão de um administrador antes de aparecer para adoção.',
  },
  {
    icone: <IconConversa />,
    titulo: 'Solicitação analisada',
    texto: 'Quem cuida do animal avalia cada pedido de adoção e decide com calma — sem pressa e sem leilão.',
  },
  {
    icone: <IconAlerta />,
    titulo: 'Canal de denúncia',
    texto: 'Qualquer usuário pode denunciar um anúncio suspeito, que é encaminhado à moderação.',
  },
]

// ─── CSS da página ────────────────────────────────────────────────────────────

const PAGE_STYLE = `
  .sobre-page { min-height: 100vh; background-color: var(--cream); color: var(--ink); }

  .sobre-wrap { max-width: 1120px; margin: 0 auto; padding: 0 80px; }

  /* Hero */
  .sobre-hero { padding: 64px 0 40px; text-align: center; }
  .sobre-eyebrow {
    display: inline-block; font-family: var(--display); font-weight: 800;
    font-size: 0.8rem; letter-spacing: .08em; text-transform: uppercase;
    color: var(--orange); background: var(--orange-50); border: 1.5px solid var(--orange-100);
    padding: 4px 14px; border-radius: 999px; transform: rotate(-2deg); margin-bottom: 18px;
  }
  .sobre-hero-titulo {
    font-family: var(--display); font-weight: 800; letter-spacing: -0.02em;
    font-size: clamp(2.2rem, 5vw, 3.4rem); line-height: 1.05; margin: 0 0 18px;
  }
  .sobre-hero-titulo span { color: var(--blue); }
  .sobre-hero-sub {
    font-size: 1.08rem; color: var(--ink-2); line-height: 1.6;
    max-width: 640px; margin: 0 auto;
  }

  /* Números */
  .sobre-numeros {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
    margin: 8px 0 72px;
  }
  .sobre-numero {
    background: var(--paper); border: 1.5px solid var(--line); border-radius: 24px;
    padding: 22px 20px; text-align: center; box-shadow: var(--shadow-sm);
    transition: transform .2s ease;
  }
  .sobre-numero:hover { transform: translateY(-2px); }
  .sobre-numero-valor { font-family: var(--display); font-weight: 800; font-size: 2.4rem; line-height: 1; }
  .sobre-numero-label { font-size: 0.85rem; font-weight: 700; color: var(--ink-3); margin-top: 8px; }

  /* Seções */
  .sobre-secao { margin-bottom: 72px; }
  .sobre-secao-titulo {
    font-family: var(--display); font-weight: 800; letter-spacing: -0.02em;
    font-size: clamp(1.6rem, 3vw, 2.1rem); line-height: 1.15; margin: 0 0 10px;
  }
  .sobre-secao-sub { color: var(--ink-2); font-size: 1rem; margin: 0 0 28px; max-width: 620px; }

  /* Missão */
  .sobre-missao { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: center; }
  .sobre-missao p { color: var(--ink-2); font-size: 1rem; line-height: 1.7; margin: 0 0 14px; }
  .sobre-destaque {
    background: var(--blue); color: #fff; border-radius: 32px; padding: 32px 30px;
    box-shadow: 0 6px 0 var(--blue-700); transform: rotate(-1.5deg);
  }
  .sobre-destaque-frase {
    font-family: var(--display); font-weight: 800; font-size: 1.5rem; line-height: 1.25; margin: 0 0 12px;
  }
  .sobre-destaque-autor { font-size: 0.9rem; font-weight: 700; opacity: .85; }

  /* Cards */
  .sobre-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .sobre-card {
    background: var(--paper); border: 1.5px solid var(--line); border-radius: 24px;
    padding: 24px 22px; transition: transform .2s ease, box-shadow .2s ease;
  }
  .sobre-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .sobre-card-icone {
    width: 52px; height: 52px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    transform: rotate(-4deg); margin-bottom: 16px;
  }
  .sobre-card-titulo { font-family: var(--display); font-weight: 800; font-size: 1.2rem; margin: 0 0 8px; color: var(--ink); }
  .sobre-card-texto  { font-size: 0.92rem; color: var(--ink-2); line-height: 1.6; margin: 0; }

  /* Segurança — lista horizontal */
  .sobre-seguranca {
    background: var(--paper); border: 1.5px solid var(--line); border-radius: 32px;
    padding: 32px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
  }
  .sobre-seg-item { display: flex; gap: 14px; align-items: flex-start; }
  .sobre-seg-icone { color: var(--blue); flex-shrink: 0; margin-top: 2px; }
  .sobre-seg-titulo { font-family: var(--display); font-weight: 800; font-size: 1.05rem; margin: 0 0 4px; color: var(--ink); }
  .sobre-seg-texto  { font-size: 0.88rem; color: var(--ink-2); line-height: 1.55; margin: 0; }

  /* Projeto */
  .sobre-projeto {
    border: 2px dashed var(--blue-100); border-radius: 32px; padding: 32px;
    display: flex; gap: 28px; align-items: center;
  }
  .sobre-projeto-selo {
    flex-shrink: 0; width: 88px; height: 88px; border-radius: 24px;
    background: var(--orange); color: #fff; box-shadow: 0 4px 0 var(--orange-700);
    display: flex; align-items: center; justify-content: center; text-align: center;
    font-family: var(--display); font-weight: 800; font-size: 1.05rem; line-height: 1.05;
    transform: rotate(-5deg);
  }
  .sobre-projeto p { color: var(--ink-2); line-height: 1.65; margin: 0; }
  .sobre-projeto strong { color: var(--ink); }

  /* CTA */
  .sobre-cta {
    background: var(--orange); border-radius: 32px; padding: 40px 36px;
    display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;
    margin-bottom: 72px; box-shadow: var(--shadow-orange);
  }
  .sobre-cta-titulo { font-family: var(--display); font-weight: 800; font-size: 1.7rem; color: #fff; margin: 0 0 4px; line-height: 1.15; }
  .sobre-cta-sub { color: rgba(255,255,255,.9); margin: 0; font-weight: 600; }
  .sobre-cta-btn {
    display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
    background: #fff; color: var(--orange-700);
    font-family: var(--display); font-weight: 800; font-size: 1rem;
    padding: 12px 26px; border-radius: 999px; box-shadow: 0 4px 0 var(--orange-700);
    transition: transform .2s ease;
  }
  .sobre-cta-btn:hover { transform: translateY(-2px); color: var(--orange-700); }

  [data-theme="dark"] .sobre-cta-btn { background: var(--paper); color: var(--orange); }

  /* Responsivo */
  @media (max-width: 991.98px) {
    .sobre-wrap { padding: 0 24px; }
    .sobre-missao { grid-template-columns: 1fr; gap: 28px; }
    .sobre-destaque { transform: none; }
    .sobre-cards, .sobre-seguranca { grid-template-columns: 1fr; }
  }
  @media (max-width: 575.98px) {
    .sobre-wrap { padding: 0 16px; }
    .sobre-hero { padding: 40px 0 28px; }
    .sobre-numeros { grid-template-columns: 1fr; margin-bottom: 52px; }
    .sobre-secao { margin-bottom: 52px; }
    .sobre-projeto { flex-direction: column; text-align: center; padding: 24px; }
    .sobre-seguranca, .sobre-cta { padding: 24px; }
  }
`

// ─── Página ───────────────────────────────────────────────────────────────────

export const Sobre = () => {
  const { usuario } = useAuth()
  const ehAbrigo = usuario?.tipo_usuario === 'ABRIGO'

  const [numeros, setNumeros] = useState<Numeros | null>(null)

  useEffect(() => {
    // Números são decorativos: se a API falhar, a página segue sem eles
    Promise.all([
      api.get<AnimalResumo[]>('/animais'),
      api.get<AbrigoResumo[]>('/abrigos'),
    ])
      .then(([animais, abrigos]) => setNumeros({
        disponiveis: animais.data.filter(a => a.status === 'DISPONIVEL').length,
        adotados:    animais.data.filter(a => a.status === 'ADOTADO').length,
        abrigos:     abrigos.data.length,
      }))
      .catch(() => setNumeros(null))
  }, [])

  const cta = ehAbrigo
    ? { titulo: 'Tem um peludo esperando um lar?', sub: 'Cadastre o animal e ele aparece para adotantes da região.', label: 'Cadastrar animal', to: '/animais/cadastrar' }
    : { titulo: 'Pronto para conhecer seu novo amigo?', sub: 'Veja os animais disponíveis agora mesmo.', label: 'Ver animais', to: '/home' }

  return (
    <div className="sobre-page">
      <style>{PAGE_STYLE}</style>

      <div className="sobre-wrap">

        {/* Hero */}
        <header className="sobre-hero fade-in">
          <div className="sobre-eyebrow">Sobre o PawAdoption</div>
          <h1 className="sobre-hero-titulo">
            Conectando quem precisa de um lar<br />
            a <span>quem tem amor de sobra.</span>
          </h1>
          <p className="sobre-hero-sub">
            O PawAdoption é uma plataforma gratuita que aproxima abrigos, protetores
            independentes, lares temporários e adotantes — para que mais animais
            encontrem uma família responsável.
          </p>
        </header>

        {/* Números (só aparecem se a API responder) */}
        {numeros && (
          <section className="sobre-numeros" aria-label="PawAdoption em números">
            <div className="sobre-numero">
              <div className="sobre-numero-valor" style={{ color: 'var(--blue)' }}>{numeros.disponiveis}</div>
              <div className="sobre-numero-label">Animais esperando um lar</div>
            </div>
            <div className="sobre-numero">
              <div className="sobre-numero-valor" style={{ color: 'var(--orange)' }}>{numeros.adotados}</div>
              <div className="sobre-numero-label">Adoções concluídas</div>
            </div>
            <div className="sobre-numero">
              <div className="sobre-numero-valor" style={{ color: '#2F7A50' }}>{numeros.abrigos}</div>
              <div className="sobre-numero-label">Abrigos parceiros</div>
            </div>
          </section>
        )}

        {/* Missão */}
        <section className="sobre-secao sobre-missao">
          <div>
            <h2 className="sobre-secao-titulo">Nossa missão</h2>
            <p>
              Abrigos e protetores fazem um trabalho enorme com poucos recursos, e boa
              parte da divulgação ainda acontece em grupos de mensagem e redes sociais,
              onde os anúncios se perdem e é difícil saber quem é confiável.
            </p>
            <p>
              Reunimos tudo em um só lugar: anúncios revisados, perfis dos abrigos,
              solicitações de adoção organizadas e um caminho claro do primeiro clique
              até o animal chegar em casa.
            </p>
          </div>
          <div className="sobre-destaque">
            <p className="sobre-destaque-frase">
              Adoção responsável começa com informação clara dos dois lados.
            </p>
            <div className="sobre-destaque-autor">— Equipe PawAdoption</div>
          </div>
        </section>

        {/* Para quem é */}
        <section className="sobre-secao">
          <h2 className="sobre-secao-titulo">Feito para todo mundo que cuida</h2>
          <p className="sobre-secao-sub">Cada perfil tem as ferramentas certas para o seu papel na adoção.</p>
          <div className="sobre-cards">
            {PUBLICOS.map(p => (
              <article key={p.titulo} className="sobre-card">
                <div className="sobre-card-icone" style={{ color: p.cor, background: p.fundo }}>
                  {p.icone}
                </div>
                <h3 className="sobre-card-titulo">{p.titulo}</h3>
                <p className="sobre-card-texto">{p.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Segurança */}
        <section className="sobre-secao">
          <h2 className="sobre-secao-titulo">Adoções mais seguras</h2>
          <p className="sobre-secao-sub">Cuidados que tomamos para proteger animais e famílias.</p>
          <div className="sobre-seguranca">
            {SEGURANCA.map(s => (
              <div key={s.titulo} className="sobre-seg-item">
                <div className="sobre-seg-icone">{s.icone}</div>
                <div>
                  <h3 className="sobre-seg-titulo">{s.titulo}</h3>
                  <p className="sobre-seg-texto">{s.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projeto */}
        <section className="sobre-secao">
          <div className="sobre-projeto">
            <div className="sobre-projeto-selo">IFPR</div>
            <p>
              O PawAdoption nasceu como <strong>Trabalho de Conclusão de Curso</strong> no{' '}
              <strong>IFPR Campus Paranaguá</strong>, com o objetivo de levar
              tecnologia a uma causa que depende muito de trabalho voluntário.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="sobre-cta">
          <div>
            <h2 className="sobre-cta-titulo">{cta.titulo}</h2>
            <p className="sobre-cta-sub">{cta.sub}</p>
          </div>
          <Link to={cta.to} className="sobre-cta-btn">{cta.label} →</Link>
        </section>

      </div>
    </div>
  )
}