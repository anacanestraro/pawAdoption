/**
 * Landing.tsx — PawAdoption v2
 * Integrado com a API real do backend.
 *
 * Endpoints usados:
 *   GET  /animais                          → listar animais disponíveis (público)
 *   GET  /abrigos                          → listar abrigos ativos (público, inclui usuario)
 *   POST /auth/login                       → login (via AuthContext)
 *   POST /voluntarios/solicitar/:abrigo_id → voluntariado (requer JWT)
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../api/api'
import type { Animal, Abrigo } from '../types'
import { AppNavbar } from '../components/AppNavbar'
import { AppFooter } from '../components/AppFooter'

// ─── i18n ────────────────────────────────────────────────────────────────────

const STRINGS: Record<string, Record<string, string>> = {
  en: {
    'hero.badge': 'Furry friends waiting for you 🐾', 'hero.woof': 'WOOF!',
    'hero.title.1': 'Find your', 'hero.title.2': 'fluffy', 'hero.title.3': 'soulmate.',
    'hero.sub': 'Thousands of pets are dreaming of belly rubs and forever homes. Browse, match, and bring home your new best friend — totally free.',
    'hero.cta.adopt': 'Adopt a friend', 'hero.cta.how': 'See how it works',
    'hero.stat.shelters': 'Partner shelters', 'hero.stat.tails': 'Happy tails',
    'cat.all': 'All', 'cat.dogs': 'Dogs', 'cat.cats': 'Cats', 'cat.small': 'Small',
    'featured.eyebrow': 'Featured friends', 'featured.title': "Meet this week's adoptable pals.",
    'featured.seeAll': 'See all pets', 'pet.meet': 'Meet', 'pet.new': 'NEW!', 'pet.available': 'AVAILABLE',
    'pet.small': 'Small', 'pet.medium': 'Medium', 'pet.large': 'Large',
    'pet.male': 'M', 'pet.female': 'F', 'pet.years': 'yr',
    'support.vol.eyebrow': 'I want to help', 'support.vol.title.1': 'Volunteer your time.',
    'support.vol.title.2': 'Become a hero. 🦸',
    'support.vol.desc': 'Walk dogs, foster kittens, help at adoption events. Just 4 hours a month makes a huge difference.',
    'support.vol.b1': 'Flexible scheduling', 'support.vol.b2': 'Free training included', 'support.vol.b3': 'Open to ages 16+',
    'support.vol.cta': 'Sign me up!', 'support.vol.login': 'Log in to volunteer',
    'support.vol.success': 'Request sent! The shelter will contact you soon. 🐾',
    'support.vol.pick': 'Choose a shelter to volunteer at:',
    'support.donate.eyebrow': 'Make a difference',
    'support.donate.title': 'Help feed shelter pets. Every bit counts! 🦴',
    'support.donate.desc': '100% goes straight to partner shelters. No fees, no cuts — just kibble.',
    'support.donate.btn': 'Donate now',
    'shelters.eyebrow': 'Partner shelters', 'shelters.title': 'The heroes doing the real work. 🏠',
    'shelters.viewAll': 'All shelters', 'shelters.since': 'Since',
    'shelters.visit': 'Visit shelter', 'shelters.tag.verified': 'Verified',
    'shelters.loading': 'Loading shelters...', 'shelters.empty': 'No shelters found.',
    'shelters.capacity': 'Capacity',
    'how.eyebrow': 'How it works', 'how.title': 'Four wags. Two weeks. One forever friend.',
    'how.s1.t': 'Tell us about you', 'how.s1.d': 'Share your home, schedule, and dream pal. Takes 3 minutes!',
    'how.s2.t': 'Meet your matches', 'how.s2.d': 'We curate a shortlist of pets that match your vibe.',
    'how.s3.t': 'Visit a shelter', 'how.s3.d': 'Book a meet-and-greet near you. No pressure, all snuggles.',
    'how.s4.t': 'Welcome them home!', 'how.s4.d': 'Sign the papers, pack the toys. The fun part begins. 🎉',
    'how.step': 'STEP',
    'loading': 'Loading...', 'error': 'Error loading data.',
  },
  pt: {
    'hero.badge': 'Amigos peludos esperando por você 🐾', 'hero.woof': 'AU AU!',
    'hero.title.1': 'Encontre sua', 'hero.title.2': 'fofa', 'hero.title.3': 'alma gêmea.',
    'hero.sub': 'Milhares de pets estão sonhando com cafuné e um lar para sempre. Navegue, conecte e leve para casa seu novo melhor amigo — totalmente grátis.',
    'hero.cta.adopt': 'Adotar um amigo', 'hero.cta.how': 'Veja como funciona',
    'hero.stat.shelters': 'Abrigos parceiros', 'hero.stat.tails': 'Finais felizes',
    'cat.all': 'Todos', 'cat.dogs': 'Cachorros', 'cat.cats': 'Gatos', 'cat.small': 'Pequenos',
    'featured.eyebrow': 'Pets em destaque', 'featured.title': 'Conheça os adotáveis da semana.',
    'featured.seeAll': 'Ver todos os pets', 'pet.meet': 'Conhecer', 'pet.new': 'NOVO!', 'pet.available': 'DISPONÍVEL',
    'pet.small': 'Pequeno', 'pet.medium': 'Médio', 'pet.large': 'Grande',
    'pet.male': 'M', 'pet.female': 'F', 'pet.years': 'ano',
    'support.vol.eyebrow': 'Quero ajudar', 'support.vol.title.1': 'Doe seu tempo.',
    'support.vol.title.2': 'Vire um herói. 🦸',
    'support.vol.desc': 'Passeie com cães, cuide de filhotes, ajude em eventos. Só 4 horas por mês fazem uma grande diferença.',
    'support.vol.b1': 'Horário flexível', 'support.vol.b2': 'Treinamento gratuito', 'support.vol.b3': 'Aberto para maiores de 16',
    'support.vol.cta': 'Quero me voluntariar!', 'support.vol.login': 'Entre para se voluntariar',
    'support.vol.success': 'Solicitação enviada! O abrigo entrará em contato em breve. 🐾',
    'support.vol.pick': 'Escolha um abrigo para se voluntariar:',
    'support.donate.eyebrow': 'Faça a diferença',
    'support.donate.title': 'Ajude a alimentar os pets dos abrigos. 🦴',
    'support.donate.desc': '100% vai direto para os abrigos parceiros. Sem taxas, só ração.',
    'support.donate.btn': 'Fazer doação',
    'shelters.eyebrow': 'Abrigos parceiros', 'shelters.title': 'Os heróis que fazem o trabalho de verdade. 🏠',
    'shelters.viewAll': 'Todos os abrigos', 'shelters.since': 'Desde',
    'shelters.visit': 'Visitar abrigo', 'shelters.tag.verified': 'Verificado',
    'shelters.loading': 'Carregando abrigos...', 'shelters.empty': 'Nenhum abrigo encontrado.',
    'shelters.capacity': 'Capacidade',
    'how.eyebrow': 'Como funciona', 'how.title': 'Quatro passos. Duas semanas. Um amigo para sempre.',
    'how.s1.t': 'Conte sobre você', 'how.s1.d': 'Compartilhe sua casa, rotina e o pet dos seus sonhos. Leva 3 minutos!',
    'how.s2.t': 'Veja seus matches', 'how.s2.d': 'Curamos uma lista de pets que combinam com seu estilo.',
    'how.s3.t': 'Visite um abrigo', 'how.s3.d': 'Marque uma visita perto de você. Sem pressão, só carinho.',
    'how.s4.t': 'Bem-vindo ao lar!', 'how.s4.d': 'Assine os papéis, prepare os brinquedos. A diversão começa. 🎉',
    'how.step': 'PASSO',
    'loading': 'Carregando...', 'error': 'Erro ao carregar dados.',
  },
}

const I18nCtx = createContext({ lang: 'pt', t: (k: string) => k, setLang: (_: string) => {} })
const useI18n = () => useContext(I18nCtx)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TONES: [string, string][] = [
  ['#5b94d4', '#175EA8'],
  ['#ec8060', '#D34C25'],
  ['#FFD27A', '#FFC857'],
  ['#7DCFA8', '#4FB286'],
]

const Photo = ({ label, tone = 0, ratio = '4/3', radius = 22, emoji = '🐾' }: {
  label: string; tone?: number; ratio?: string; radius?: number; emoji?: string
}) => {
  const [from, to] = TONES[tone % TONES.length]
  return (
    <div style={{
      aspectRatio: ratio, width: '100%', borderRadius: radius,
      background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 64, opacity: 0.35 }}>{emoji}</span>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.22) 0%, transparent 50%)' }} />
      <span style={{
        position: 'absolute', bottom: 10, left: 10,
        fontSize: 10, letterSpacing: '.06em', color: to,
        textTransform: 'uppercase', padding: '4px 10px',
        background: 'rgba(255,255,255,0.92)', borderRadius: 999, fontWeight: 700,
      }}>{label}</span>
    </div>
  )
}

const porteEmoji = (porte?: string) =>
  porte === 'PEQUENO' ? '🐩' : porte === 'GRANDE' ? '🐕' : '🦮'

const especieEmoji = (especie: string) => {
  const e = especie.toLowerCase()
  if (e.includes('gat') || e.includes('cat')) return '🐱'
  if (e.includes('coelh') || e.includes('rabbit')) return '🐇'
  return '🐕'
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

const SectionHeader = ({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) => (
  <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-4">
    <div>
      {eyebrow && (
        <div className="d-inline-flex align-items-center gap-2 mb-3" style={{
          padding: '5px 14px', borderRadius: 999,
          background: 'var(--orange-100)', color: 'var(--orange)',
          fontSize: 12, fontWeight: 800, letterSpacing: '.04em',
          textTransform: 'uppercase', fontFamily: 'var(--display)',
        }}>🐾 {eyebrow}</div>
      )}
      <h2 style={{
        margin: 0, fontSize: 'clamp(26px, 3.4vw, 42px)', lineHeight: 1.05,
        letterSpacing: '-0.02em', color: 'var(--ink)',
        fontFamily: 'var(--display)', fontWeight: 800,
      }}>{title}</h2>
    </div>
    {action}
  </div>
)

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = ({ totalAnimais, totalAbrigos }: { totalAnimais: number; totalAbrigos: number }) => {
  const { t } = useI18n()
  return (
    <section className="container-fluid px-wide" style={{ paddingTop: 52, paddingBottom: 24 }}>
      <div className="row align-items-center g-5">

        <div className="col-12 col-lg-6 fade-in">
          <div className="d-inline-flex align-items-center gap-2 mb-4" style={{
            padding: '7px 16px 7px 7px', borderRadius: 999,
            background: 'var(--paper)', border: '2px solid var(--blue-100)',
            fontSize: 13, fontWeight: 700, color: 'var(--blue)', boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--orange)', color: 'white', fontWeight: 800, fontSize: 11, letterSpacing: '.04em' }}>
              {t('hero.woof')}
            </span>
            {totalAnimais > 0 ? `${totalAnimais} ${t('hero.badge')}` : t('hero.badge')}
          </div>

          <h1 style={{
            margin: 0, fontSize: 'clamp(44px, 5.5vw, 84px)', lineHeight: 0.95,
            letterSpacing: '-0.025em', color: 'var(--ink)',
            fontFamily: 'var(--display)', fontWeight: 800,
          }}>
            {t('hero.title.1')}<br />
            <span style={{ color: 'var(--blue)' }}>{t('hero.title.2')}</span>{' '}
            <span style={{ color: 'var(--orange)', display: 'inline-block', transform: 'rotate(-3deg)' }}>
              {t('hero.title.3')}
            </span>
          </h1>

          <p style={{ marginTop: 22, marginBottom: 0, maxWidth: 460, fontSize: 17, lineHeight: 1.55, color: 'var(--ink-2)', fontWeight: 500 }}>
            {t('hero.sub')}
          </p>

          <div className="d-flex flex-wrap gap-3 mt-4">
            <Link to="/home" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 26px', borderRadius: 999,
              background: 'var(--orange)', color: 'white', textDecoration: 'none',
              fontSize: 16, fontWeight: 800, fontFamily: 'var(--display)',
              boxShadow: 'var(--shadow-orange)', transition: 'transform .15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {t('hero.cta.adopt')} →
            </Link>
            <a href="#how-it-works" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 26px', borderRadius: 999,
              background: 'var(--paper)', color: 'var(--blue)',
              border: '2px solid var(--blue-100)', textDecoration: 'none',
              fontSize: 16, fontWeight: 700, fontFamily: 'var(--display)',
            }}>
              ▶ {t('hero.cta.how')}
            </a>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-4">
            {[
              { n: totalAnimais > 0 ? `${totalAnimais}+` : '...', l: 'Pets disponíveis', c: 'var(--orange)' },
              { n: totalAbrigos > 0 ? `${totalAbrigos}` : '...', l: t('hero.stat.shelters'), c: 'var(--blue)' },
              { n: '98%', l: t('hero.stat.tails'), c: '#4FB286' },
            ].map(s => (
              <div key={s.l} className="d-flex align-items-center gap-2" style={{
                padding: '9px 14px 9px 9px', borderRadius: 999,
                background: 'var(--paper)', border: '2px solid var(--line)',
              }}>
                <div style={{ padding: '4px 10px', borderRadius: 999, background: s.c, color: 'white', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 13 }}>{s.n}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6 d-none d-lg-block fade-in" style={{ position: 'relative', minHeight: 520 }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <svg viewBox="0 0 500 500" style={{ width: '100%', height: '100%' }}>
              <path fill="var(--blue)" opacity="0.1" d="M421 312c-19 65-79 116-149 134-71 18-130-9-181-58-50-49-77-117-46-178 32-61 96-100 175-104 79-3 152 25 191 83 39 58 29 58 10 123z" />
            </svg>
          </div>
          <div style={{
            position: 'absolute', inset: '20px 30px 50px 30px', borderRadius: 32,
            border: '3px solid var(--paper)', boxShadow: 'var(--shadow-pop)',
            overflow: 'hidden', zIndex: 1,
          }}>
            <Photo label="ADOTE UM PET" tone={1} ratio="auto" radius={28} emoji="🐕" />
          </div>
          <div style={{
            position: 'absolute', left: -16, bottom: 60, zIndex: 2,
            background: 'var(--paper)', borderRadius: 20,
            border: '2px solid var(--blue-100)', boxShadow: 'var(--shadow-md)',
            padding: 14, width: 220, display: 'flex', gap: 10, alignItems: 'center',
            transform: 'rotate(-3deg)',
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--orange-100)', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 26 }}>🐕</div>
            <div>
              <div style={{ fontSize: 10, color: '#4FB286', fontWeight: 700, letterSpacing: '.08em', marginBottom: 2 }}>● ADOTADO</div>
              <div style={{ fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: 700 }}>Buddy → Novo lar!</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>Há 2 minutos</div>
            </div>
          </div>
          <div style={{ position: 'absolute', right: 60, bottom: 0, zIndex: 2, fontSize: 38, transform: 'rotate(20deg)' }}>🦴</div>
        </div>
      </div>
    </section>
  )
}

// ─── Animal Card ──────────────────────────────────────────────────────────────

const AnimalCard = ({ animal, index }: { animal: Animal; index: number }) => {
  const { t } = useI18n()
  const emoji = especieEmoji(animal.especie)
  const isNew = new Date().getTime() - new Date(animal.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
  const porteLabel = animal.porte === 'PEQUENO' ? t('pet.small') : animal.porte === 'GRANDE' ? t('pet.large') : t('pet.medium')
  const sexoLabel  = animal.sexo === 'FEMEA' ? t('pet.female') : t('pet.male')

  return (
    <article style={{
      background: 'var(--paper)', borderRadius: 28,
      border: '2px solid var(--line)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', height: '100%',
      transition: 'transform .18s, box-shadow .18s', cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-pop)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ position: 'relative', padding: 12, paddingBottom: 0 }}>
        {animal.fotos && (animal.fotos as any[]).length > 0 ? (
          <img
            src={`${import.meta.env.VITE_API_URL}${(animal.fotos as any[])[0].url_foto}`}
            alt={animal.nome}
            style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 20 }}
          />
        ) : (
          <Photo label={animal.nome.toUpperCase()} tone={index} ratio="1/1" radius={20} emoji={emoji} />
        )}
        <div style={{
          position: 'absolute', top: 22, left: 22, padding: '5px 12px',
          borderRadius: 999, fontSize: 11, fontWeight: 800,
          background: 'var(--paper)', color: isNew ? 'var(--orange)' : 'var(--blue)',
          display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: 'var(--display)', boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isNew ? 'var(--orange)' : 'var(--blue-300)' }} />
          {isNew ? t('pet.new') : t('pet.available')}
        </div>
        <button style={{
          position: 'absolute', top: 22, right: 22, width: 36, height: 36,
          borderRadius: 999, background: 'var(--paper)', border: 'none',
          display: 'grid', placeItems: 'center', fontSize: 17,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer',
        }}>🤍</button>
      </div>

      <div style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="d-flex align-items-baseline justify-content-between gap-2">
          <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.1, color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: 800 }}>{animal.nome}</h3>
          <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {sexoLabel} · {animal.idade ? `${animal.idade} ${t('pet.years')}` : '?'}
          </span>
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>
          {animal.raca || animal.especie}
        </div>
        <div className="d-flex flex-wrap gap-2 mt-3">
          {animal.porte && (
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'var(--blue-100)', color: 'var(--blue)', fontWeight: 700 }}>
              {porteEmoji(animal.porte)} {porteLabel}
            </span>
          )}
          {animal.especie && (
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'var(--cream-2)', color: 'var(--ink-2)', fontWeight: 700 }}>
              {emoji} {animal.especie}
            </span>
          )}
        </div>
        <Link to="/home" style={{
          marginTop: 'auto', paddingTop: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px 0', borderRadius: 999,
          background: 'var(--blue)', color: 'white', textDecoration: 'none',
          fontSize: 14, fontWeight: 800, fontFamily: 'var(--display)',
          boxShadow: '0 4px 0 var(--blue-700)',
        }}>
          {t('pet.meet')} {animal.nome} →
        </Link>
      </div>
    </article>
  )
}

// ─── Featured Pets ────────────────────────────────────────────────────────────

const FeaturedPets = () => {
  const { t } = useI18n()
  const [animais, setAnimais] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filtro, setFiltro] = useState('Todos')

  const FILTROS = [
    { key: 'Todos',    label: t('cat.all'),   emoji: '🏠' },
    { key: 'Cachorro', label: t('cat.dogs'),  emoji: '🐕' },
    { key: 'Gato',     label: t('cat.cats'),  emoji: '🐱' },
    { key: 'PEQUENO',  label: t('cat.small'), emoji: '🐇' },
  ]

  useEffect(() => {
    setLoading(true)
    api.get<Animal[]>('/animais')
      .then(res => setAnimais(res.data.filter(a => a.status === 'DISPONIVEL')))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const animaisFiltrados = animais.filter(a => {
    if (filtro === 'Todos') return true
    if (filtro === 'PEQUENO') return a.porte === 'PEQUENO'
    return a.especie.toLowerCase().includes(filtro.toLowerCase())
  }).slice(0, 8)

  return (
    <section id="pets" className="container-fluid px-wide mt-5 pt-3">
      <SectionHeader
        eyebrow={t('featured.eyebrow')}
        title={t('featured.title')}
        action={
          <Link to="/home" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 999,
            background: 'var(--paper)', color: 'var(--blue)',
            border: '2px solid var(--blue-100)', textDecoration: 'none',
            fontSize: 14, fontWeight: 800, fontFamily: 'var(--display)',
          }}>
            {t('featured.seeAll')} →
          </Link>
        }
      />

      <div className="d-flex flex-wrap gap-2 mb-4">
        {FILTROS.map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)} style={{
            padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
            fontSize: 14, fontWeight: 700, fontFamily: 'var(--display)',
            background: filtro === f.key ? 'var(--blue)' : 'var(--paper)',
            color: filtro === f.key ? 'white' : 'var(--ink-2)',
            border: `2px solid ${filtro === f.key ? 'var(--blue)' : 'var(--blue-100)'}`,
            boxShadow: filtro === f.key ? '0 3px 0 var(--blue-700)' : 'none',
          }}>
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5" style={{ color: 'var(--ink-3)', fontSize: 16 }}>
          <span style={{ fontSize: 32 }}>🐾</span><br />{t('loading')}
        </div>
      ) : error ? (
        <div className="text-center py-5" style={{ color: 'var(--orange)', fontSize: 15 }}>{t('error')}</div>
      ) : animaisFiltrados.length === 0 ? (
        <div className="text-center py-5" style={{ color: 'var(--ink-3)', fontSize: 15 }}>
          Nenhum pet disponível nesta categoria no momento.
        </div>
      ) : (
        <div className="row g-4">
          {animaisFiltrados.map((a, i) => (
            <div className="col-12 col-md-6 col-lg-3" key={a.id}>
              <AnimalCard animal={a} index={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Support Row ──────────────────────────────────────────────────────────────

const SupportRow = ({ abrigos }: { abrigos: Abrigo[] }) => {
  const { t } = useI18n()
  const { usuario } = useAuth()
  const [abrigoSelecionado, setAbrigoSelecionado] = useState<number | null>(null)
  const [volStatus, setVolStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleVoluntariar = async () => {
    if (!usuario || !abrigoSelecionado) return
    setVolStatus('loading')
    try {
      await api.post(`/voluntarios/solicitar/${abrigoSelecionado}`)
      setVolStatus('success')
    } catch {
      setVolStatus('error')
    }
  }

  return (
    <section className="container-fluid px-wide mt-5 pt-3">
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div style={{
            background: 'var(--orange)', color: 'white',
            borderRadius: 32, padding: 36, position: 'relative', overflow: 'hidden',
            boxShadow: 'var(--shadow-pop)', height: '100%',
          }}>
            <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.15, fontSize: 140 }}>🐾</div>
            <div className="row g-4 align-items-center" style={{ position: 'relative', zIndex: 1 }}>
              <div className="col-12 col-md-6">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', fontSize: 12, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'var(--display)' }}>
                  ❤️ {t('support.donate.eyebrow')}
                </div>
                <h3 style={{ margin: 0, fontSize: 30, lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: 'var(--display)', fontWeight: 800 }}>
                  {t('support.donate.title')}
                </h3>
                <p style={{ marginTop: 12, fontSize: 15, opacity: 0.95, lineHeight: 1.55, fontWeight: 500 }}>
                  {t('support.donate.desc')}
                </p>
                <button style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 999, background: 'var(--paper)', color: 'var(--orange)', border: 'none', fontSize: 15, fontWeight: 800, fontFamily: 'var(--display)', cursor: 'pointer', boxShadow: '0 4px 0 rgba(0,0,0,0.15)' }}>
                  ❤️ {t('support.donate.btn')}
                </button>
              </div>
              <div className="col-12 col-md-6 d-none d-md-block" style={{ textAlign: 'center', fontSize: 120, opacity: 0.25 }}>🦴</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div style={{ background: 'var(--paper)', borderRadius: 32, border: '3px solid var(--blue-100)', padding: 28, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.06, fontSize: 140 }}>🙌</div>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--blue-100)', display: 'grid', placeItems: 'center', marginBottom: 16, transform: 'rotate(-6deg)', fontSize: 30 }}>🙌</div>
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, background: 'var(--blue-100)', color: 'var(--blue)', fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 10, alignSelf: 'flex-start', fontFamily: 'var(--display)' }}>
              {t('support.vol.eyebrow')}
            </div>
            <h3 style={{ margin: 0, fontSize: 26, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: 800 }}>
              {t('support.vol.title.1')} <span style={{ color: 'var(--blue)' }}>{t('support.vol.title.2')}</span>
            </h3>
            <p style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, fontWeight: 500 }}>{t('support.vol.desc')}</p>
            <ul style={{ margin: '14px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 7 }}>
              {[t('support.vol.b1'), t('support.vol.b2'), t('support.vol.b3')].map(b => (
                <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--blue)', color: 'white', display: 'grid', placeItems: 'center', fontSize: 11 }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>

            {volStatus === 'success' ? (
              <div style={{ marginTop: 18, padding: '14px 18px', borderRadius: 14, background: '#e8f5e9', color: '#2e7d32', fontSize: 14, fontWeight: 600 }}>
                {t('support.vol.success')}
              </div>
            ) : usuario ? (
              <div style={{ marginTop: 18, position: 'relative', zIndex: 1 }}>
                {abrigos.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>{t('support.vol.pick')}</label>
                    <select value={abrigoSelecionado ?? ''} onChange={e => setAbrigoSelecionado(Number(e.target.value))} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2px solid var(--blue-100)', background: 'var(--paper)', fontSize: 14, color: 'var(--ink)', cursor: 'pointer' }}>
                      <option value="">Selecione...</option>
                      {abrigos.map(a => (
                        <option key={a.usuario_id} value={a.usuario_id}>
                          {(a as any).usuario?.nome ?? `Abrigo #${a.usuario_id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button onClick={handleVoluntariar} disabled={!abrigoSelecionado || volStatus === 'loading'} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 18px', borderRadius: 999, background: abrigoSelecionado ? 'var(--orange)' : 'var(--line)', color: abrigoSelecionado ? 'white' : 'var(--ink-3)', border: 'none', fontSize: 15, fontWeight: 800, fontFamily: 'var(--display)', cursor: abrigoSelecionado ? 'pointer' : 'not-allowed', boxShadow: abrigoSelecionado ? 'var(--shadow-orange)' : 'none' }}>
                  {volStatus === 'loading' ? '...' : `${t('support.vol.cta')} ↗`}
                </button>
                {volStatus === 'error' && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--orange)' }}>Erro ao enviar. Tente novamente.</p>}
              </div>
            ) : (
              <Link to="/login" style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 18px', borderRadius: 999, background: 'var(--orange)', color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 800, fontFamily: 'var(--display)', boxShadow: 'var(--shadow-orange)', position: 'relative', zIndex: 1 }}>
                {t('support.vol.login')} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Partner Shelters ─────────────────────────────────────────────────────────

const PartnerShelters = ({ abrigos, loading, error }: { abrigos: Abrigo[]; loading: boolean; error: boolean }) => {
  const { t } = useI18n()
  return (
    <section id="abrigos" className="container-fluid px-wide mt-5 pt-3">
      <SectionHeader
        eyebrow={t('shelters.eyebrow')}
        title={t('shelters.title')}
        action={
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 999, background: 'var(--blue)', color: 'white', border: 'none', fontSize: 14, fontWeight: 800, fontFamily: 'var(--display)', boxShadow: '0 4px 0 var(--blue-700)', cursor: 'pointer' }}>
            {t('shelters.viewAll')} →
          </button>
        }
      />
      {loading ? (
        <div className="text-center py-5" style={{ color: 'var(--ink-3)' }}><span style={{ fontSize: 32 }}>🏠</span><br />{t('shelters.loading')}</div>
      ) : error ? (
        <div className="text-center py-5" style={{ color: 'var(--orange)' }}>{t('error')}</div>
      ) : abrigos.length === 0 ? (
        <div className="text-center py-5" style={{ color: 'var(--ink-3)' }}>{t('shelters.empty')}</div>
      ) : (
        <div className="row g-4">
          {abrigos.slice(0, 3).map((a, i) => (
            <div className="col-12 col-md-4" key={a.usuario_id}>
              <article style={{ background: 'var(--paper)', borderRadius: 28, border: '2px solid var(--line)', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform .18s, box-shadow .18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-pop)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ padding: 12, paddingBottom: 0, position: 'relative' }}>
                  <Photo label={((a as any).usuario?.nome ?? 'ABRIGO').toUpperCase()} ratio="16/10" tone={i} radius={18} emoji="🏠" />
                  <span style={{ position: 'absolute', top: 22, left: 22, fontSize: 11, padding: '5px 12px', borderRadius: 999, fontWeight: 800, background: 'var(--paper)', color: 'var(--blue)', fontFamily: 'var(--display)', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    {t('shelters.tag.verified')}
                  </span>
                </div>
                <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 21, lineHeight: 1.1, color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: 800 }}>{(a as any).usuario?.nome ?? '—'}</h3>
                    {(a as any).usuario?.endereco && (
                      <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>
                        📍 {(a as any).usuario.endereco.cidade}, {(a as any).usuario.endereco.estado}
                      </div>
                    )}
                    {a.razao_social && <div style={{ marginTop: 2, fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>{a.razao_social}</div>}
                  </div>
                  <div className="row g-3" style={{ paddingTop: 12, borderTop: '2px dashed var(--line)' }}>
                    {a.capacidade != null && (
                      <div className="col-6">
                        <div style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{t('shelters.capacity')}</div>
                        <div style={{ fontSize: 24, marginTop: 2, color: 'var(--orange)', fontFamily: 'var(--display)', fontWeight: 800 }}>{a.capacidade}</div>
                      </div>
                    )}
                    {(a as any).usuario?.created_at && (
                      <div className="col-6">
                        <div style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{t('shelters.since')}</div>
                        <div style={{ fontSize: 24, marginTop: 2, color: 'var(--blue)', fontFamily: 'var(--display)', fontWeight: 800 }}>{new Date((a as any).usuario.created_at).getFullYear()}</div>
                      </div>
                    )}
                  </div>
                  <button style={{ width: '100%', padding: '12px 0', borderRadius: 999, background: 'var(--blue-50)', border: '2px solid var(--blue-100)', color: 'var(--blue)', fontSize: 14, fontWeight: 800, fontFamily: 'var(--display)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {t('shelters.visit')} ↗
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const HowItWorks = () => {
  const { t } = useI18n()
  const steps = [
    { n: '01', tk: 'how.s1.t', dk: 'how.s1.d', emoji: '🏠', color: '#175EA8' },
    { n: '02', tk: 'how.s2.t', dk: 'how.s2.d', emoji: '✨', color: '#D34C25' },
    { n: '03', tk: 'how.s3.t', dk: 'how.s3.d', emoji: '📍', color: '#4FB286' },
    { n: '04', tk: 'how.s4.t', dk: 'how.s4.d', emoji: '❤️', color: '#D34C25' },
  ]
  return (
    <section id="how-it-works" className="container-fluid px-wide mt-5 pt-3">
      <SectionHeader eyebrow={t('how.eyebrow')} title={t('how.title')} />
      <div className="row g-4">
        {steps.map(s => (
          <div className="col-12 col-sm-6 col-lg-3" key={s.n}>
            <div style={{ padding: 24, borderRadius: 28, background: 'var(--paper)', border: '2px solid var(--line)', height: '100%', transition: 'transform .18s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ width: 54, height: 54, borderRadius: 16, background: s.color, display: 'grid', placeItems: 'center', marginBottom: 16, boxShadow: '0 4px 0 rgba(0,0,0,0.16)', transform: 'rotate(-4deg)', fontSize: 26 }}>{s.emoji}</div>
              <div style={{ fontSize: 11, color: s.color, letterSpacing: '.06em', marginBottom: 5, fontFamily: 'var(--display)', fontWeight: 800, textTransform: 'uppercase' }}>{t('how.step')} {s.n}</div>
              <h4 style={{ margin: 0, fontSize: 19, lineHeight: 1.15, color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: 800 }}>{t(s.tk)}</h4>
              <p style={{ marginTop: 8, marginBottom: 0, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, fontWeight: 500 }}>{t(s.dk)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── CTA Cadastro ─────────────────────────────────────────────────────────────

const CtaCadastro = () => {
  const { usuario } = useAuth()
  if (usuario) return null
  return (
    <section className="container-fluid px-wide mt-5 pt-3">
      <div className="row g-4">
        <div className="col-12 col-md-6">
          <Link to="/cadastro" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderRadius: 20, background: '#2D1B14', textDecoration: 'none', transition: 'transform .15s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span style={{ fontSize: 18, fontWeight: 800, color: '#FFF9F1', fontFamily: 'var(--display)' }}>Cadastre-se como adotante</span>
            <span style={{ fontSize: 28 }}>🐾</span>
          </Link>
        </div>
        <div className="col-12 col-md-6">
          <Link to="/cadastro" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderRadius: 20, background: 'var(--blue)', textDecoration: 'none', transition: 'transform .15s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span style={{ fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'var(--display)' }}>Cadastre-se como abrigo</span>
            <span style={{ fontSize: 28 }}>🏠</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export const Landing = () => {
  const [lang, setLang] = useState(() => localStorage.getItem('paw_lang') || 'pt')
  const { theme } = useTheme()   // ← tema vem do contexto global
  const [abrigos, setAbrigos] = useState<Abrigo[]>([])
  const [abrigosLoading, setAbrigosLoading] = useState(true)
  const [abrigosError, setAbrigosError] = useState(false)
  const [totalAnimais, setTotalAnimais] = useState(0)

  const t = useCallback((k: string) => STRINGS[lang]?.[k] || STRINGS.en[k] || k, [lang])

  useEffect(() => {
    api.get<Abrigo[]>('/abrigos')
      .then(res => setAbrigos(res.data))
      .catch(() => setAbrigosError(true))
      .finally(() => setAbrigosLoading(false))
  }, [])

  useEffect(() => {
    api.get<Animal[]>('/animais')
      .then(res => setTotalAnimais(res.data.filter((a: Animal) => a.status === 'DISPONIVEL').length))
      .catch(() => {})
  }, [])

  useEffect(() => {
    localStorage.setItem('paw_lang', lang)
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  }, [lang])

  return (
    <I18nCtx.Provider value={{ lang, t, setLang }}>
      <>
        <AppNavbar lang={lang} setLang={setLang} />

        <main>
          <Hero totalAnimais={totalAnimais} totalAbrigos={abrigos.length} />
          <FeaturedPets />
          <SupportRow abrigos={abrigos} />
          <PartnerShelters abrigos={abrigos} loading={abrigosLoading} error={abrigosError} />
          <HowItWorks />
          <CtaCadastro />
        </main>

        <AppFooter />
      </>
    </I18nCtx.Provider>
  )
}

export default Landing