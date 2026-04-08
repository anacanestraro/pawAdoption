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
    <div className="landing-nav-bar" style={{ position: 'relative', zIndex: 10 }}>
      <Link to="/" className="landing-nav-logo">PawAdoption</Link>

      <div className="d-flex align-items-center gap-4">
        <ul className="landing-nav-links">
          <li><a href="#pets">Animais</a></li>
          <li><a href="#footer">Contate-nos</a></li>
          <li><a href="#como-funciona">Sobre</a></li>
        </ul>

        {usuario ? (
          <div className="landing-avatar-wrapper" ref={menuRef}>
            <div className="landing-avatar" onClick={() => setMenuOpen(v => !v)}>{initials}</div>
            {menuOpen && (
              <div className="landing-avatar-dropdown">
                <div className="landing-avatar-name">
                  {usuario.nome}
                  <span>{usuario.tipo_usuario?.toLowerCase()}</span>
                </div>
                <Link to="/home" className="landing-dropdown-link">Ir para o app</Link>
                <button onClick={() => { logout(); navigate('/login') }}>Sair</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="landing-entrar-btn">Entrar</Link>
        )}
      </div>
    </div>
  )
}

export const Landing = () => {
  return (
    <>
      <style>{`
        .landing-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 90px;
          height: 100px;
        }
        .landing-nav-logo {
          font-size: 34px; font-weight: 900;
          color: #F5ECD7 !important;
          text-decoration: none; letter-spacing: -0.5px;
        }
        .landing-nav-links {
          display: flex; align-items: center; gap: 116px;
          list-style: none; margin: 0; padding: 100px;
        }
        .landing-nav-links a {
          color: #7B4A2D !important; text-decoration: none;
          font-size: 20px; font-weight: 700; transition: opacity 0.15s;
        }
        .landing-nav-links a:hover { opacity: 0.75; }
        .landing-entrar-btn {
          background: #E8A87C; color: #7B4A2D !important;
          font-weight: 700; font-size: 20px;
          padding: 10px 48px; border-radius: 50px;
          text-decoration: none; transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .landing-entrar-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
        .landing-avatar-wrapper { position: relative; }
        .landing-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: #7B4A2D; color: #F5ECD7;
          font-size: 20px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: 2px solid rgba(255,255,255,0.4);
          transition: transform 0.15s; user-select: none;
        }
        .landing-avatar:hover { transform: scale(1.07); }
        .landing-avatar-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: #F5ECD7; border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          min-width: 180px; overflow: hidden;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .landing-avatar-name {
          padding: 14px 16px 10px; font-size: 13px; font-weight: 700;
          color: #7B4A2D; border-bottom: 1px solid rgba(123,74,45,0.15);
        }
        .landing-avatar-name span {
          display: block; font-size: 11px; font-weight: 500;
          color: #A0704A; margin-top: 2px; text-transform: capitalize;
        }
        .landing-dropdown-link {
          display: block; padding: 11px 16px;
          font-size: 14px; font-weight: 600;
          color: #7B4A2D !important; text-decoration: none; transition: background 0.15s;
        }
        .landing-dropdown-link:hover { background: #eedfc6; }
        .landing-avatar-dropdown button {
          width: 100%; padding: 11px 16px; background: none; border: none;
          text-align: left; font-size: 14px; font-weight: 600;
          color: #832e25; cursor: pointer; font-family: inherit;
          transition: background 0.15s; border-top: 1px solid rgba(123,74,45,0.1);
        }
        .landing-avatar-dropdown button:hover { background: #fdf2f2; }

        /* ── Hero ── */
        .hero {
          min-height: 100vh; background: #E8A87C;
          position: relative; overflow: hidden;
        }
        .hero-title {
          font-size: clamp(32px, 5vw, 56px); font-weight: 900;
          color: #fff; line-height: 1.1; letter-spacing: -1px;
        }
        .hero-subtitle { font-size: 16px; color: rgba(255,255,255,0.85); }
        .hero-btn-primary {
          background: #fff; color: #7B4A2D !important;
          font-weight: 800; font-size: 15px; padding: 12px 32px;
          border-radius: 50px; text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .hero-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        .hero-btn-secondary {
          background: transparent; color: #fff !important;
          font-weight: 700; font-size: 15px; padding: 12px 32px;
          border-radius: 50px; text-decoration: none;
          border: 2px solid rgba(255,255,255,0.7);
          transition: border-color 0.15s, background 0.15s;
        }
        .hero-btn-secondary:hover { border-color: #fff; background: rgba(255,255,255,0.1); }
        .hero-right {
          position: relative; width: 700px; height: 700px; flex-shrink: 0;
        }
        .hero-circle {
          width: 2250px; height: 2250px; border-radius: 50%;
          background: #F5ECD7; position: absolute;
          top: -1500px; right: -1500px; z-index: 1;
        }
        .blob-shape { border-radius: 40% 60% 55% 45% / 50% 40% 50% 50%; }
        .blob-wrapper {
          display: flex !important; position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          align-items: center; justify-content: center;
          margin-left: 0; padding: 0; z-index: 2;
          margin-top: 30px;
        }
        .blob-inner {
          background: #E68F60;
          width: clamp(450px, 55vw, 720px);
          height: clamp(450px, 55vw, 720px);
        }
        .deco-circle-outline {
          position: absolute; border-radius: 50%;
          border: 3px solid #7B4A2D; pointer-events: none;
        }
        .deco-squiggle { position: absolute; pointer-events: none; opacity: 0.45; }
        .tri-down {
          width: 0; height: 0;
          border-left: 8px solid transparent; border-right: 8px solid transparent;
          border-top: 13px solid #7B4A2D;
          position: absolute; pointer-events: none;
        }
        .tri-right-deco {
          width: 0; height: 0;
          border-top: 7px solid transparent; border-bottom: 7px solid transparent;
          border-left: 12px solid #7B4A2D;
          position: absolute; pointer-events: none;
        }

        /* ── Section header ── */
        .section-header { display: flex; align-items: center; gap: 16px; }
        .section-header-title { font-size: 26px; font-weight: 900; color: #3D2314; white-space: nowrap; }
        .section-header-title-light { color: #F5ECD7; }
        .section-header-line { flex: 1; height: 2px; background: #C4845A; opacity: 0.4; }
        .section-header-line-light { background: #F5ECD7; }
        .section-header-arrow {
          width: 36px; height: 36px; border-radius: 50%; background: #C4845A;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 16px; flex-shrink: 0;
          cursor: pointer; transition: background 0.15s;
        }
        .section-header-arrow:hover { background: #A66B42; }

        /* ── Nav grid ── */
        .nav-grid {
          background: #E8A87C; border-radius: 16px; padding: 28px;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        .nav-item { display: flex; flex-direction: column; align-items: center; gap: 12px; text-decoration: none; }
        .nav-item-icon {
          width: 80px; height: 80px; border-radius: 50%; background: #D4845A;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; transition: transform 0.15s;
        }
        .nav-item:hover .nav-item-icon { transform: scale(1.05); }
        .nav-item-label {
          background: #3D2314; color: #F5ECD7;
          font-size: 13px; font-weight: 700;
          padding: 6px 16px; border-radius: 50px; text-align: center;
        }

        /* ── CTA cards ── */
        .cta-card {
          background: #3D2314; border-radius: 14px; padding: 24px 28px;
          display: flex; align-items: center; justify-content: space-between;
          text-decoration: none; transition: transform 0.15s, background 0.15s;
        }
        .cta-card:hover { transform: translateY(-2px); background: #2e1a0f; }
        .cta-card-label { font-size: 18px; font-weight: 800; color: #F5ECD7; }
        .cta-card-icon { font-size: 32px; opacity: 0.8; }

        /* ── Action cards ── */
        .action-card {
          background: #E8A87C; border-radius: 14px; padding: 24px 28px;
          display: flex; align-items: center; gap: 20px;
          text-decoration: none; transition: transform 0.15s;
        }
        .action-card:hover { transform: translateY(-2px); }
        .action-card-icon { font-size: 40px; flex-shrink: 0; }
        .action-card-title { font-size: 17px; font-weight: 800; color: #3D2314; margin-bottom: 4px; }
        .action-card-desc { font-size: 13px; color: #7B4A2D; line-height: 1.5; }

        /* ── Pet/Abrigo cards ── */
        .pet-card, .abrigo-card {
          background: #E8A87C; border-radius: 14px; overflow: hidden; transition: transform 0.2s;
        }
        .pet-card:hover, .abrigo-card:hover { transform: translateY(-3px); }
        .card-img-placeholder {
          width: 100%; height: 180px; background: #D4845A;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.3); font-size: 13px;
        }
        .card-name { font-size: 16px; font-weight: 800; color: #3D2314; margin-bottom: 2px; }
        .card-sub { font-size: 13px; color: #7B4A2D; margin-bottom: 12px; }
        .card-btn {
          display: inline-block; background: #3D2314; color: #F5ECD7 !important;
          font-size: 13px; font-weight: 700; padding: 8px 20px; border-radius: 50px;
          text-decoration: none; transition: background 0.15s;
        }
        .card-btn:hover { background: #2e1a0f; }

        /* ── Passo card ── */
        .passo-card { background: #F5ECD7; border-radius: 16px; padding: 50px 24px; }
        .passo-num { font-size: 48px; font-weight: 900; color: #E8A87C; line-height: 1; margin-bottom: 16px; letter-spacing: -2px; }
        .passo-titulo { font-size: 18px; font-weight: 800; color: #3D2314; margin-bottom: 8px; }
        .passo-desc { font-size: 14px; color: #7B4A2D; line-height: 1.6; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-left-anim { animation: fadeUp 0.6s ease both; }
        .hero-right-anim { animation: fadeUp 0.6s ease 0.15s both; }

        @media (max-width: 768px) {
          .hero-right { display: none; }
          .nav-grid { grid-template-columns: repeat(2, 1fr); }
          .landing-nav-links { display: none; }
        }
      `}</style>

      {/* ── Hero (com navbar dentro) ── */}
      <section className="hero">
        <LandingNav />

        <div className="deco-circle-outline" style={{ width: 44, height: 44, top: '22%', left: '46%' }} />
        <svg className="deco-squiggle" style={{ top: '20%', left: '6%' }} width="70" height="28" viewBox="0 0 70 28">
          <path d="M4 22 Q15 4 25 14 Q36 24 47 14 Q58 4 66 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <svg className="deco-squiggle" style={{ bottom: '12%', right: '26%' }} width="100" height="48" viewBox="0 0 80 28">
          <path d="M4 22 Q16 4 28 14 Q40 24 52 14 Q64 4 76 10" fill="none" stroke="#7B4A2D" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        {[[0,0],[1,0],[2,0],[0,1],[1,1],[0,2],[1,2],[2,2],[0,3],[1,3],[0,4],[1,4]].map(([col,row],i) => (
          <div key={i} className="tri-down" style={{ top: `${42+row*5}%`, left: `${50+col*3}%` }} />
        ))}
        {[[0,0],[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2]].map(([col,row],i) => (
          <div key={`tr${i}`} className="tri-right-deco" style={{ bottom: `${22+row*5}%`, left: `${3+col*3.2}%` }} />
        ))}

        <div className="container-xxl mx-auto px-4 py-5 d-flex align-items-center justify-content-between gap-4" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-left-anim" style={{ flex: 1, maxWidth: 500 }}>
            <h1 className="hero-title mb-3">
              Adotar salva vidas.<br />
              Comece sua história hoje!
            </h1>
            <p className="hero-subtitle mb-4">Adote um pet ou apoie um abrigo parceiro.</p>
            <div className="d-flex gap-3 flex-wrap">
              <Link to="/home" className="hero-btn-primary">Adotar</Link>
              <a href="#como-funciona" className="hero-btn-secondary">Como ajudar?</a>
            </div>
          </div>
          <div className="hero-right hero-right-anim">
            <div className="hero-circle" />
            <div className="blob-wrapper">
              <div className="blob-shape blob-inner" />
              <img src={cachorro} alt="cachorro" style={{ position: 'absolute', width: '58%', height: 'auto', zIndex: 3 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Navegue ── */}
      <section className="py-5" style={{ background: '#F5ECD7' }}>
        <div className="container-xxl mx-auto px-4">
          <div className="section-header mb-4">
            <span className="section-header-title">Navegue</span>
            <div className="section-header-line" />
            <div className="section-header-arrow">→</div>
          </div>
          <div className="nav-grid">
            {navItems.map((item, i) => (
              <a href={item.to} className="nav-item" key={i}>
                <div className="nav-item-icon">{item.emoji}</div>
                <span className="nav-item-label">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Cadastro + Ações ── */}
      <section className="pb-5" style={{ background: '#F5ECD7' }}>
        <div className="container-xxl mx-auto px-4">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <Link to="/cadastro" className="cta-card h-100">
                <span className="cta-card-label">Cadastre-se como adotante</span>
                <span className="cta-card-icon">🐾</span>
              </Link>
            </div>
            <div className="col-md-6">
              <Link to="/cadastro" className="cta-card h-100">
                <span className="cta-card-label">Cadastre-se como abrigo</span>
                <span className="cta-card-icon">🏠</span>
              </Link>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <a href="#" className="action-card h-100">
                <span className="action-card-icon">🤲</span>
                <div>
                  <div className="action-card-title">Faça uma doação</div>
                  <div className="action-card-desc">Ajude-nos a continuar na luta contra o abandono animal</div>
                </div>
              </a>
            </div>
            <div className="col-md-6">
              <a href="#" className="action-card h-100">
                <span className="action-card-icon">🙋</span>
                <div>
                  <div className="action-card-title">Quero me voluntariar</div>
                  <div className="action-card-desc">Torne-se voluntário em um abrigo próximo à você e ajude na causa animal</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pets ── */}
      <section id="pets" className="pb-5" style={{ background: '#F5ECD7' }}>
        <div className="container-xxl mx-auto px-4">
          <div className="section-header mb-4">
            <span className="section-header-title">Conheça alguns dos nossos pets</span>
            <div className="section-header-line" />
            <div className="section-header-arrow">→</div>
          </div>
          <div className="row g-4">
            {pets.map((p, i) => (
              <div className="col-md-4" key={i}>
                <div className="pet-card">
                  <div className="card-img-placeholder">foto</div>
                  <div className="p-3">
                    <div className="card-name">{p.nome}</div>
                    <div className="card-sub">{p.raca}</div>
                    <Link to="/home" className="card-btn">Conhecer</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Abrigos ── */}
      <section id="abrigos" className="pb-5" style={{ background: '#F5ECD7' }}>
        <div className="container-xxl mx-auto px-4">
          <div className="section-header mb-4">
            <span className="section-header-title">Conheça alguns dos nossos abrigos</span>
            <div className="section-header-line" />
            <div className="section-header-arrow">→</div>
          </div>
          <div className="row g-4">
            {abrigos.map((a, i) => (
              <div className="col-md-4" key={i}>
                <div className="abrigo-card">
                  <div className="card-img-placeholder">foto</div>
                  <div className="p-3">
                    <div className="card-name">{a.nome}</div>
                    <div className="card-sub">{a.cidade}</div>
                    <Link to="/home" className="card-btn">Conhecer</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como-funciona" className="py-5" style={{ background: '#E8A87C' }}>
        <div className="container-xxl mx-auto px-4">
          <div className="section-header mb-4">
            <span className="section-header-title section-header-title-light">Como funciona?</span>
            <div className="section-header-line section-header-line-light" />
            <div className="section-header-arrow">→</div>
          </div>
          <div className="row g-4">
            {passos.map((p, i) => (
              <div className="col-md-4" key={i}>
                <div className="passo-card">
                  <div className="passo-num">{p.num}</div>
                  <div className="passo-titulo">{p.titulo}</div>
                  <p className="passo-desc mb-0">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Landing