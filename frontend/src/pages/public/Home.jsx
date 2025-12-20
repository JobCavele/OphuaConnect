// src/pages/public/Home.jsx
import { Link } from "react-router-dom";
import "../../styles/pages/Home.css";
import logo from "../../assets/ophuaconnect-logo.png";

export default function Home() {
  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container nav-container">
          <div className="nav-logo">
            <img
              src={logo}
              alt="OphuaConnect"
              className="logo-image"
              style={{ height: "40px", width: "auto" }}
            />
            <span>OphuaConnect</span>
          </div>

          <div className="nav-links">
            <a href="#features" className="nav-link">
              Funcionalidades
            </a>
            <a href="#pricing" className="nav-link">
              Preços
            </a>
            <a href="#about" className="nav-link">
              Sobre
            </a>
            <Link to="/login" className="nav-link">
              Entrar
            </Link>
            <Link to="/register" className="btn btn-primary">
              Começar Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Conecte sua <span className="text-primary">Empresa</span> e{" "}
              <span className="text-secondary">Equipe</span>
            </h1>
            <p className="hero-subtitle">
              Plataforma completa para cartões de visita digitais, gestão de
              equipes e perfis profissionais com temas personalizados.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Criar Conta Gratuita
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Entrar na Plataforma
              </Link>
            </div>
          </div>

          <div className="hero-preview">
            <div className="preview-card">
              <div className="preview-card-header">
                <div className="preview-company">
                  <div className="company-avatar">TC</div>
                  <div>
                    <h4>TechCorp Inc.</h4>
                    <p className="text-light">Empresa Verificada</p>
                  </div>
                </div>
                <div className="qr-code-placeholder"></div>
              </div>
              <div className="preview-card-body">
                <div className="employee-preview">
                  <div className="employee-avatar">JS</div>
                  <div>
                    <h4>João Silva</h4>
                    <p className="text-light">Desenvolvedor Full Stack</p>
                  </div>
                </div>
                <div className="employee-details">
                  <div className="detail-item">
                    <span className="detail-label">Departamento</span>
                    <span className="detail-value">Tecnologia</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">joao@techcorp.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Tudo que sua empresa precisa</h2>
            <p className="section-subtitle">
              Uma plataforma completa para gestão digital de contatos e equipes
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon bg-primary">🏢</div>
              <h3>Perfil Empresarial</h3>
              <p className="text-light">
                Página profissional da sua empresa com tema personalizado e
                informações completas.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-secondary">👥</div>
              <h3>Gestão de Equipe</h3>
              <p className="text-light">
                Administre funcionários, permissões e acessos com controle
                total.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-accent">📱</div>
              <h3>QR Codes Dinâmicos</h3>
              <p className="text-light">
                Compartilhe contatos instantaneamente com QR codes
                personalizados.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-success">🎨</div>
              <h3>Temas Personalizados</h3>
              <p className="text-light">
                Cores extraídas do seu logotipo para uma identidade visual
                consistente.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-warning">🔗</div>
              <h3>Links de Convite</h3>
              <p className="text-light">
                Convide funcionários com links únicos para cada empresa.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-danger">🛡️</div>
              <h3>Segurança Avançada</h3>
              <p className="text-light">
                Controle de acesso, criptografia e aprovação de funcionários.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="text-white">
              Pronto para transformar suas conexões?
            </h2>
            <p className="text-white cta-subtitle">
              Junte-se a empresas que já usam o OphuaConnect para gerenciar seus
              perfis digitais.
            </p>
            <Link to="/register" className="btn btn-lg bg-surface text-primary">
              Começar Agora Gratuitamente
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <img
                  src={logo}
                  alt="OphuaConnect"
                  style={{ height: "32px", width: "auto", marginBottom: "8px" }}
                />
                <span>OphuaConnect</span>
              </div>
              <p className="text-light">
                Conectando empresas e profissionais através da tecnologia.
              </p>
            </div>

            <div className="footer-section">
              <h4>Produto</h4>
              <ul className="footer-links">
                <li>
                  <a href="#features">Funcionalidades</a>
                </li>
                <li>
                  <a href="#pricing">Preços</a>
                </li>
                <li>
                  <Link to="/login">Entrar</Link>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Empresa</h4>
              <ul className="footer-links">
                <li>
                  <a href="#about">Sobre</a>
                </li>
                <li>
                  <a href="#contact">Contato</a>
                </li>
                <li>
                  <a href="#careers">Carreiras</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li>
                  <a href="#privacy">Privacidade</a>
                </li>
                <li>
                  <a href="#terms">Termos</a>
                </li>
                <li>
                  <a href="#cookies">Cookies</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} OphuaConnect. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
