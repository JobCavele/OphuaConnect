// src/pages/public/CompanyProfile.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAPI } from "../../services/api";
import {
  Building,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Github,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import "../../styles/pages/public-company.css";

const CompanyProfile = () => {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    loadCompanyProfile();
  }, [slug]);

  const loadCompanyProfile = async () => {
    try {
      const response = await fetchAPI(`/api/public/company/${slug}`);
      if (response.success) {
        setCompany(response.company);
        setEmployees(response.employees || []);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (!company) return <div>Empresa não encontrada</div>;

  const theme = company.themeSettings || {};
  const primaryColor = theme.primaryColor || "#3B82F6";
  const secondaryColor = theme.secondaryColor || "#1E40AF";

  return (
    <div
      className="public-company-profile"
      style={{ "--primary-color": primaryColor }}
    >
      {/* Hero Section */}
      <div
        className="company-hero"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="hero-content">
          <div className="company-hero-info">
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="hero-logo"
              />
            )}
            <div className="hero-text">
              <h1>{company.name}</h1>
              <p className="hero-tagline">{company.description}</p>
              <div className="hero-meta">
                {company.industry && (
                  <span className="meta-item">
                    <Briefcase size={16} /> {company.industry}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meta-item"
                  >
                    <Globe size={16} /> Site Oficial
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <Users size={24} />
              <div>
                <h3>{employees.length}</h3>
                <p>Funcionários</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="company-content">
        {/* Tabs de Navegação */}
        <div className="company-tabs">
          <button
            className={`tab ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            Sobre a Empresa
          </button>
          <button
            className={`tab ${activeTab === "team" ? "active" : ""}`}
            onClick={() => setActiveTab("team")}
          >
            Nossa Equipe ({employees.length})
          </button>
          <button
            className={`tab ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            Contato
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="tab-content">
          {activeTab === "about" && (
            <div className="about-tab">
              <div className="about-content">
                <h2>Sobre a {company.name}</h2>
                <p className="company-description">{company.description}</p>

                {company.socialLinks &&
                  Object.values(company.socialLinks).some((v) => v) && (
                    <div className="company-social">
                      <h3>Redes Sociais</h3>
                      <div className="social-links">
                        {company.socialLinks.facebook && (
                          <a
                            href={company.socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Facebook size={20} /> Facebook
                          </a>
                        )}
                        {company.socialLinks.instagram && (
                          <a
                            href={company.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Instagram size={20} /> Instagram
                          </a>
                        )}
                        {company.socialLinks.linkedin && (
                          <a
                            href={company.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Linkedin size={20} /> LinkedIn
                          </a>
                        )}
                        {company.socialLinks.twitter && (
                          <a
                            href={company.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Twitter size={20} /> Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="team-tab">
              <h2>Nossa Equipe</h2>
              {employees.length > 0 ? (
                <div className="team-grid">
                  {employees.map((employee) => (
                    <div key={employee.id} className="employee-card">
                      {employee.avatarUrl && (
                        <img
                          src={employee.avatarUrl}
                          alt={employee.fullName}
                          className="employee-avatar"
                        />
                      )}
                      <div className="employee-info">
                        <h3>{employee.fullName}</h3>
                        <p className="employee-position">{employee.position}</p>
                        <p className="employee-bio">
                          {employee.bio?.substring(0, 100)}...
                        </p>
                        <a
                          href={`/company/${slug}/employee/${employee.id}`}
                          className="view-profile-btn"
                        >
                          Ver Perfil <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-team">Nenhum funcionário cadastrado ainda.</p>
              )}
            </div>
          )}

          {activeTab === "contact" && (
            <div className="contact-tab">
              <h2>Entre em Contato</h2>
              <div className="contact-info">
                {company.website && (
                  <div className="contact-item">
                    <Globe size={20} />
                    <div>
                      <strong>Website</strong>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}

                {company.email && (
                  <div className="contact-item">
                    <Mail size={20} />
                    <div>
                      <strong>Email</strong>
                      <a href={`mailto:${company.email}`}>{company.email}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
