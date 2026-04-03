export const Footer = () => {
  return (
    <footer id="footer" style={{ background: '#F5ECD7', color: '#7B4A2D', padding: '60px 40px 32px' }}>
      <style>{`
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        .footer-logo {
          font-size: 22px;
          font-weight: 900;
          color: #7B4A2D;
          margin-bottom: 14px;
          letter-spacing: -0.5px;
        }
        .footer-desc {
          font-size: 14px;
          line-height: 1.7;
          color: #94705B;
          font-weight: 480;
          max-width: 280px;
        }
        .footer-col-title {
          font-size: 13px;
          font-weight: 800;
          color: #7B4A2D;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0;
          margin: 0;
        }
        .footer-links a {
          color: #94705B !important;
          text-decoration: none;
          font-size: 14px;
          font-weight:480;
          transition: color 0.15s;
        }
        .footer-links a:hover { color: #7B4A2D !important; }
        .footer-bottom {
          border-top: 1px solid #94705B;
          padding-top: 24px;
          font-size: 13px;
          font-weight:480;
          text-align: center;
        }
        @media (max-width: 768px) {
          .footer-top { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="footer-container">
        <div className="footer-top">
          <div>
            <div className="footer-logo">PawAdoption</div>
            <p className="footer-desc">Conectando animais que precisam de amor com pessoas que têm amor para dar.</p>
          </div>
          <div>
            <div className="footer-col-title">Navegação</div>
            <ul className="footer-links">
              <li><a href="#animais">Animais</a></li>
              <li><a href="#como-funciona">Como funciona</a></li>
              <li><a href="#abrigos">Abrigos</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Contato</div>
            <ul className="footer-links">
              <li><a href="#">contato@pawadoption.com</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} PawAdoption. Feito com amor para os animais.
        </div>
      </div>
    </footer>
  )
}