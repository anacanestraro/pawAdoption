import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import cachorro from '../assets/cachorro.png'

const pets = [
  { nome: 'Lexie grey', raca: 'Pinscher' },
  { nome: 'Buckyzero', raca: 'Vira-lata' },
  { nome: 'Chew Pé-molhado', raca: 'Shitzu com traça' },
]

const abrigos = [
  { nome: 'Focinhos Carentes', cidade: 'Paranaguá - PR' },
  { nome: 'Lar Animais', cidade: 'Curitiba - PR' },
  { nome: 'Abrigo Feliz', cidade: 'Londrina - PR' },
]

const passos = [
  { num: '01', titulo: 'Cadastre-se', desc: 'Crie sua conta gratuitamente como adotante ou abrigo parceiro.' },
  { num: '02', titulo: 'Encontre um pet', desc: 'Navegue pelos animais disponíveis e encontre seu parceiro ideal.' },
  { num: '03', titulo: 'Adote com amor', desc: 'Entre em contato com o abrigo ou lar temporário e inicie o processo de adoção.' },
]

const navItems = [
  { emoji: '🏠', label: 'Abrigos', to: '#abrigos' },
  { emoji: '🐶', label: 'Cachorros', to: '#pets' },
  { emoji: '🐱', label: 'Gatos', to: '#pets' },
  { emoji: '❓', label: 'Como funciona?', to: '#como-funciona' },
]

/* ─────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────── */
const LandingNav = () => {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = usuario?.nome
    ? usuario.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <nav className="navbar navbar-expand-lg lp-navbar">
      <div className="container-fluid px-wide">

        {/* Logo — canto esquerdo, sempre visível */}
        <Link to="/" className="navbar-brand lp-nav-logo">PawAdoption</Link>

        {/* Toggler mobile */}
        <button
          className="navbar-toggler border-0 d-lg-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#landingNavCollapse"
          aria-controls="landingNavCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ color: '#7B4A2D' }}
        >
          <span style={{ fontSize: 24 }}>☰</span>
        </button>

        {/* Área colapsável: links + botão — empurrados à direita com ms-auto */}
        <div className="collapse navbar-collapse" id="landingNavCollapse">
          {/*
           * ms-auto empurra todo o bloco para a direita,
           * posicionando links e botão sobre a área creme do Figma.
           * gap via style para controlar espaçamento preciso.
           */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center" style={{ gap: '2rem' }}>
            <li className="nav-item"><a href="#pets" className="nav-link lp-nav-link">Animais</a></li>
            <li className="nav-item"><a href="#footer" className="nav-link lp-nav-link">Contate-nos</a></li>
            <li className="nav-item"><a href="#como-funciona" className="nav-link lp-nav-link">Sobre</a></li>
            {/* Botão "Entrar" inline com os links, separado por margem */}
            <li className="nav-item ms-2">
              {usuario ? (
                <div className="lp-avatar-wrapper position-relative" ref={menuRef}>
                  <div className="lp-avatar" onClick={() => setMenuOpen(v => !v)}>{initials}</div>
                  {menuOpen && (
                    <div className="lp-avatar-dropdown">
                      <div className="lp-avatar-name">
                        {usuario.nome}
                        <span>{usuario.tipo_usuario?.toLowerCase()}</span>
                      </div>
                      <Link to="/home" className="lp-dropdown-link">Ir para o app</Link>
                      <button onClick={() => { logout(); navigate('/login') }}>Sair</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="lp-entrar-btn">Entrar</Link>
              )}
            </li>
          </ul>
        </div>

      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────────────── */
export const Landing = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body, .landing-root {
          font-family: 'Noto Sans', sans-serif;
          overflow-x: hidden;
        }

        /* ── CSS Variables ── */
        :root {
          --creme:      #F5ECD7;
          --laranja:    #E8A87C;
          --marrom:     #7B4A2D;
          --marrom-esc: #3D2314;
          --laranja-md: #D4845A;
          --wide-px:    80px;    /* padding lateral global em desktop */
        }

        /*
         * Utilitário central: .px-wide
         * Substitui px-4 / container-xxl em todas as seções.
         * Garante padding lateral fixo de 80px no desktop,
         * reduzindo progressivamente em telas menores.
         */
        .px-wide {
          padding-left:  var(--wide-px) !important;
          padding-right: var(--wide-px) !important;
        }

        /* ══════════════════════════════════════
           NAVBAR
        ══════════════════════════════════════ */
        .lp-navbar {
          background: transparent;
          padding: 0;
          height: 88px;
          position: relative;
          z-index: 20;
        }
        .lp-nav-logo {
          font-size: 28px; font-weight: 900;
          color: var(--creme) !important;
          text-decoration: none; letter-spacing: -0.5px;
          font-family: 'Noto Sans', sans-serif;
        }
        .lp-nav-link {
          color: var(--marrom) !important;
          font-size: 16px; font-weight: 700;
          text-decoration: none; transition: opacity 0.15s;
          font-family: 'Noto Sans', sans-serif;
        }
        .lp-nav-link:hover { opacity: 0.7; }
        .lp-entrar-btn {
          background: var(--laranja); color: var(--marrom) !important;
          font-weight: 700; font-size: 16px;
          padding: 10px 40px; border-radius: 50px;
          text-decoration: none; font-family: 'Noto Sans', sans-serif;
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .lp-entrar-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 18px rgba(0,0,0,0.22); }

        .lp-avatar-wrapper { position: relative; }
        .lp-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: var(--marrom-esc); color: var(--creme);
          font-size: 17px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: 2px solid rgba(255,255,255,0.35);
          transition: transform 0.15s; user-select: none;
        }
        .lp-avatar:hover { transform: scale(1.07); }
        .lp-avatar-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: var(--creme); border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.14);
          min-width: 184px; overflow: hidden;
          animation: dropIn 0.15s ease; z-index: 100;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-avatar-name {
          padding: 14px 16px 10px; font-size: 13px; font-weight: 700;
          color: var(--marrom); border-bottom: 1px solid rgba(123,74,45,0.15);
        }
        .lp-avatar-name span {
          display: block; font-size: 11px; font-weight: 500;
          color: #A0704A; margin-top: 2px; text-transform: capitalize;
        }
        .lp-dropdown-link {
          display: block; padding: 11px 16px;
          font-size: 14px; font-weight: 600;
          color: var(--marrom) !important; text-decoration: none; transition: background 0.15s;
        }
        .lp-dropdown-link:hover { background: #eedfc6; }
        .lp-avatar-dropdown button {
          width: 100%; padding: 11px 16px; background: none; border: none;
          text-align: left; font-size: 14px; font-weight: 600;
          color: #832e25; cursor: pointer; font-family: 'Noto Sans', sans-serif;
          transition: background 0.15s; border-top: 1px solid rgba(123,74,45,0.1);
        }
        .lp-avatar-dropdown button:hover { background: #fdf2f2; }

        /* ══════════════════════════════════════
           HERO
        ══════════════════════════════════════ */
        .lp-hero {
          background: var(--laranja);
          position: relative;
          overflow: hidden;
          min-height: 100vh;
        }

        /*
         * Arco creme no canto superior direito.
         * É um círculo GRANDE (1400px) posicionado
         * muito acima e muito à direita, de modo que
         * apenas sua borda inferior-esquerda aparece
         * como uma curva — ocupando ~22% da largura.
         * Isso replica o Figma fielmente.
         */
        /*
         * Forma creme superior-direita — círculo amplo e orgânico.
         * Elemento quadrado muito grande (70vw × 70vw) posicionado
         * com top: 0 e right: 0. O border-radius 100% no canto
         * inferior-esquerdo cria a curva suave e fluida do Figma,
         * sem bordas rígidas nem recortes.
         * z-index: 1 garante que fique atrás do blob/imagem (z-index: 3)
         * mas visível sobre o fundo laranja da <section>.
         */
        /*
         * Arco creme superior-direito.
         * Quadrado de 46vw × 46vw ancorado em top:0 right:0.
         * border-radius: 0 0 0 100% → quarto-de-círculo perfeito
         * no canto inferior-esquerdo, curva suave sem recorte.
         * Ocupa ~46% da largura e ~46vw de altura — proporcional
         * ao Figma (cobre a navbar e a extremidade direita da hero).
         */
        .lp-hero-arc {
          width: 46vw;
          height: 46vw;
          background: var(--creme);
          position: absolute;
          top: 0;
          right: 0;
          border-radius: 0 0 0 100%;
          pointer-events: none;
          z-index: 1;
        }

        /* Coluna texto — Bootstrap col-lg-6 controla a largura */
        .lp-hero-text-col {
          position: relative;
          z-index: 3;
        }

        /* Coluna imagem — Bootstrap col-lg-6 controla a largura */
        .lp-hero-img-col {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Blob grande e imponente */
        .lp-blob-wrapper {
          position: relative;
          width: clamp(320px, 38vw, 560px);
          height: clamp(320px, 38vw, 560px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-blob {
          position: absolute;
          inset: 0;
          background: #E68F60;
          border-radius: 42% 58% 52% 48% / 48% 42% 58% 52%;
        }
        /* Imagem 80% do blob — proporcional, não "perdida" */
        .lp-dog-img {
          position: relative;
          z-index: 2;
          width: 80%;
          height: auto;
          display: block;
        }

        /* Tipografia e botões Hero */
        .lp-hero-title {
          font-size: clamp(28px, 3.4vw, 52px);
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -1px;
          font-family: 'Noto Sans', sans-serif;
          margin-bottom: 14px;
        }
        .lp-hero-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.87);
          margin-bottom: 32px;
          font-family: 'Noto Sans', sans-serif;
        }
        /* Botão primário: fundo BRANCO, texto marrom */
        .lp-hero-btn-primary {
          background: #fff;
          color: var(--marrom) !important;
          font-weight: 800;
          font-size: 15px;
          padding: 12px 34px;
          border-radius: 50px;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .lp-hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        /* Botão secundário: fundo transparente, borda branca, texto branco */
        .lp-hero-btn-secondary {
          background: transparent;
          color: #fff !important;
          font-weight: 700;
          font-size: 15px;
          padding: 12px 34px;
          border-radius: 50px;
          text-decoration: none;
          display: inline-block;
          border: 2px solid rgba(255,255,255,0.8);
          transition: border-color 0.15s, background 0.15s;
        }
        .lp-hero-btn-secondary:hover {
          border-color: #fff;
          background: rgba(255,255,255,0.1);
        }


        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-hero-left  { animation: fadeUp 0.6s ease both; }
        .lp-hero-right { animation: fadeUp 0.65s ease 0.15s both; }

        /* ══════════════════════════════════════
           SECTION HEADER
        ══════════════════════════════════════ */
        .lp-section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
        .lp-section-title {
          font-size: 22px; font-weight: 900; color: var(--marrom-esc);
          white-space: nowrap; font-family: 'Noto Sans', sans-serif;
        }
        .lp-section-title--light { color: var(--creme); }
        .lp-section-line { flex: 1; height: 2px; background: var(--laranja-md); opacity: 0.45; }
        .lp-section-line--light { background: var(--creme); opacity: 0.6; }
        .lp-section-arrow {
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--laranja-md);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 15px; flex-shrink: 0;
          cursor: pointer; transition: background 0.15s;
        }
        .lp-section-arrow:hover { background: #A66B42; }

        /* ══════════════════════════════════════
           NAV GRID (Navegue)
        ══════════════════════════════════════ */
        .lp-nav-grid {
          background: var(--laranja); border-radius: 18px; padding: 32px 28px;
        }
        .lp-nav-item {
          display: flex; flex-direction: column;
          align-items: center; gap: 14px; text-decoration: none;
        }
        .lp-nav-icon {
          width: 88px; height: 88px; border-radius: 50%;
          background: var(--laranja-md);
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; transition: transform 0.15s;
        }
        .lp-nav-item:hover .lp-nav-icon { transform: scale(1.06); }
        .lp-nav-label {
          background: var(--marrom-esc); color: var(--creme);
          font-size: 13px; font-weight: 700;
          padding: 7px 20px; border-radius: 50px; text-align: center;
          font-family: 'Noto Sans', sans-serif;
        }

        /* ══════════════════════════════════════
           CTA CARDS
        ══════════════════════════════════════ */
        .lp-cta-card {
          background: var(--marrom-esc); border-radius: 14px; padding: 24px 32px;
          display: flex; align-items: center; justify-content: space-between;
          text-decoration: none; transition: transform 0.15s, background 0.15s; height: 100%;
        }
        .lp-cta-card:hover { transform: translateY(-2px); background: #2e1a0f; }
        .lp-cta-label { font-size: 18px; font-weight: 800; color: var(--creme); font-family: 'Noto Sans', sans-serif; }
        .lp-cta-icon { font-size: 32px; opacity: 0.85; }

        /* ══════════════════════════════════════
           ACTION CARDS
        ══════════════════════════════════════ */
        .lp-action-card {
          background: var(--laranja); border-radius: 14px; padding: 24px 32px;
          display: flex; align-items: center; gap: 22px;
          text-decoration: none; transition: transform 0.15s; height: 100%;
        }
        .lp-action-card:hover { transform: translateY(-2px); }
        .lp-action-icon { font-size: 42px; flex-shrink: 0; }
        .lp-action-title { font-size: 17px; font-weight: 800; color: var(--marrom-esc); margin-bottom: 5px; font-family: 'Noto Sans', sans-serif; }
        .lp-action-desc { font-size: 13px; color: var(--marrom); line-height: 1.55; margin: 0; font-family: 'Noto Sans', sans-serif; }

        /* ══════════════════════════════════════
           PET & ABRIGO CARDS
        ══════════════════════════════════════ */
        .lp-card {
          background: var(--laranja); border-radius: 14px;
          overflow: hidden; transition: transform 0.2s; height: 100%;
        }
        .lp-card:hover { transform: translateY(-4px); }
        .lp-card-img {
          width: 100%; height: 200px; background: var(--laranja-md);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.3); font-size: 12px;
        }
        .lp-card-body { padding: 16px 20px 22px; }
        .lp-card-name { font-size: 17px; font-weight: 800; color: var(--marrom-esc); margin-bottom: 3px; font-family: 'Noto Sans', sans-serif; }
        .lp-card-sub { font-size: 13px; color: var(--marrom); margin-bottom: 14px; font-family: 'Noto Sans', sans-serif; }
        .lp-card-btn {
          display: inline-block; background: var(--marrom-esc); color: var(--creme) !important;
          font-size: 13px; font-weight: 700; padding: 9px 24px; border-radius: 50px;
          text-decoration: none; font-family: 'Noto Sans', sans-serif; transition: background 0.15s;
        }
        .lp-card-btn:hover { background: #2e1a0f; }

        /* ══════════════════════════════════════
           PASSO CARDS
        ══════════════════════════════════════ */
        .lp-passo-card { background: var(--creme); border-radius: 16px; padding: 44px 28px 40px; height: 100%; }
        .lp-passo-num { font-size: 56px; font-weight: 900; color: var(--laranja); line-height: 1; margin-bottom: 16px; letter-spacing: -2px; font-family: 'Noto Sans', sans-serif; }
        .lp-passo-title { font-size: 19px; font-weight: 800; color: var(--marrom-esc); margin-bottom: 10px; font-family: 'Noto Sans', sans-serif; }
        .lp-passo-desc { font-size: 14px; color: var(--marrom); line-height: 1.65; margin: 0; font-family: 'Noto Sans', sans-serif; }

        /* ══════════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════════ */
        @media (max-width: 991.98px) {
          :root { --wide-px: 24px; }
          .lp-hero-img-col { display: none !important; }
          .lp-hero-text-col { flex: 0 0 100%; max-width: 100%; }
          .lp-hero { min-height: auto; padding-bottom: 60px; }
        }
        @media (max-width: 767.98px) {
          :root { --wide-px: 16px; }
          .lp-nav-icon { width: 66px; height: 66px; font-size: 26px; }
        }
      `}</style>

      <div className="landing-root">

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="lp-hero">
          <LandingNav />

          {/* Arco creme — canto superior direito */}
          <div className="lp-hero-arc" />

          {/* Conteúdo: texto (col-lg-6) + imagem (col-lg-6) */}
          <div
            className="container-fluid px-wide"
            style={{ position: 'relative', zIndex: 2 }}
          >
            <div
              className="row align-items-center g-0"
              style={{ minHeight: 'calc(100vh - 88px)' }}
            >
              {/* ── Texto ── */}
              <div className="col-12 col-lg-6 lp-hero-text-col lp-hero-left">
                <h1 className="lp-hero-title">
                  Adotar salva vidas.<br />
                  Comece sua história hoje!
                </h1>
                <p className="lp-hero-subtitle">
                  Adote um pet ou apoie um abrigo parceiro.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Link to="/home" className="lp-hero-btn-primary">Adotar</Link>
                  <a href="#como-funciona" className="lp-hero-btn-secondary">Como ajudar?</a>
                </div>
              </div>

              {/* ── Blob + imagem: some em mobile ── */}
              <div className="col-lg-6 lp-hero-img-col lp-hero-right d-none d-lg-flex">
                <div className="lp-blob-wrapper">
                  <div className="lp-blob" />
                  <img src={cachorro} alt="cachorro e gato" className="lp-dog-img" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            NAVEGUE
        ══════════════════════════════════════ */}
        <section className="py-5" style={{ background: 'var(--creme)' }}>
          <div className="container-fluid px-wide">
            <div className="lp-section-header">
              <span className="lp-section-title">Navegue</span>
              <div className="lp-section-line" />
              <div className="lp-section-arrow">→</div>
            </div>
            <div className="lp-nav-grid">
              <div className="row g-4 justify-content-center">
                {navItems.map((item, i) => (
                  <div className="col-6 col-sm-3" key={i}>
                    <a href={item.to} className="lp-nav-item">
                      <div className="lp-nav-icon">{item.emoji}</div>
                      <span className="lp-nav-label">{item.label}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            CTA: Cadastro + Ações
        ══════════════════════════════════════ */}
        <section className="pb-5" style={{ background: 'var(--creme)' }}>
          <div className="container-fluid px-wide">
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <Link to="/cadastro" className="lp-cta-card">
                  <span className="lp-cta-label">Cadastre-se como adotante</span>
                  <span className="lp-cta-icon">🐾</span>
                </Link>
              </div>
              <div className="col-12 col-md-6">
                <Link to="/cadastro" className="lp-cta-card">
                  <span className="lp-cta-label">Cadastre-se como abrigo</span>
                  <span className="lp-cta-icon">🏠</span>
                </Link>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <a href="#" className="lp-action-card">
                  <span className="lp-action-icon">🤲</span>
                  <div>
                    <div className="lp-action-title">Faça uma doação</div>
                    <p className="lp-action-desc">Ajude-nos a continuar na luta contra o abandono animal</p>
                  </div>
                </a>
              </div>
              <div className="col-12 col-md-6">
                <a href="#" className="lp-action-card">
                  <span className="lp-action-icon">🙋</span>
                  <div>
                    <div className="lp-action-title">Quero me voluntariar</div>
                    <p className="lp-action-desc">Torne-se voluntário em um abrigo próximo à você e ajude na causa animal</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            PETS
        ══════════════════════════════════════ */}
        <section id="pets" className="pb-5" style={{ background: 'var(--creme)' }}>
          <div className="container-fluid px-wide">
            <div className="lp-section-header">
              <span className="lp-section-title">Conheça alguns dos nossos pets</span>
              <div className="lp-section-line" />
              <div className="lp-section-arrow">→</div>
            </div>
            <div className="row g-4">
              {pets.map((p, i) => (
                <div className="col-12 col-md-6 col-lg-4" key={i}>
                  <div className="lp-card">
                    <div className="lp-card-img">foto</div>
                    <div className="lp-card-body">
                      <div className="lp-card-name">{p.nome}</div>
                      <div className="lp-card-sub">{p.raca}</div>
                      <Link to="/home" className="lp-card-btn">Conhecer</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            ABRIGOS
        ══════════════════════════════════════ */}
        <section id="abrigos" className="pb-5" style={{ background: 'var(--creme)' }}>
          <div className="container-fluid px-wide">
            <div className="lp-section-header">
              <span className="lp-section-title">Conheça alguns dos nossos abrigos</span>
              <div className="lp-section-line" />
              <div className="lp-section-arrow">→</div>
            </div>
            <div className="row g-4">
              {abrigos.map((a, i) => (
                <div className="col-12 col-md-6 col-lg-4" key={i}>
                  <div className="lp-card">
                    <div className="lp-card-img">foto</div>
                    <div className="lp-card-body">
                      <div className="lp-card-name">{a.nome}</div>
                      <div className="lp-card-sub">{a.cidade}</div>
                      <Link to="/home" className="lp-card-btn">Conhecer</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            COMO FUNCIONA
        ══════════════════════════════════════ */}
        <section id="como-funciona" className="py-5" style={{ background: 'var(--laranja)' }}>
          <div className="container-fluid px-wide">
            <div className="lp-section-header">
              <span className="lp-section-title lp-section-title--light">Como funciona?</span>
              <div className="lp-section-line lp-section-line--light" />
              <div className="lp-section-arrow">→</div>
            </div>
            <div className="row g-4">
              {passos.map((p, i) => (
                <div className="col-12 col-md-4" key={i}>
                  <div className="lp-passo-card">
                    <div className="lp-passo-num">{p.num}</div>
                    <div className="lp-passo-title">{p.titulo}</div>
                    <p className="lp-passo-desc">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />

      </div>
    </>
  )
}

export default Landing