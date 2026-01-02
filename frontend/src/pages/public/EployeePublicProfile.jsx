// src/pages/public/EmployeePublicProfile.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAPI } from "../../services/api";
import QRCode from "qrcode";
import {
  Mail,
  Phone,
  Globe,
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Github,
  Share2,
  QrCode as QrIcon,
  Download,
  Copy,
  Check,
} from "lucide-react";
import "../../styles/pages/public-profile.css";

const EmployeePublicProfile = () => {
  const { companySlug, employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    loadProfile();
  }, [companySlug, employeeId]);

  useEffect(() => {
    if (employee && company) {
      generateQRCode();
    }
  }, [employee, company]);

  const loadProfile = async () => {
    try {
      const response = await fetchAPI(
        `/api/public/company/${companySlug}/employee/${employeeId}`
      );
      if (response.success) {
        setEmployee(response.employee);
        setCompany(response.company);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      const profileUrl = window.location.href;
      const theme = employee.themeSettings || company.themeSettings;
      const qr = await QRCode.toDataURL(profileUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: theme?.primaryColor || "#3B82F6",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qr);
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr-code-${employee?.fullName
      ?.toLowerCase()
      .replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando perfil...</p>
      </div>
    );

  if (!employee || !company)
    return (
      <div className="error-container">
        <h1>Perfil não encontrado</h1>
        <p>O funcionário pode não existir ou ter sido removido.</p>
        <a href="/" className="back-link">
          Voltar para a página inicial
        </a>
      </div>
    );

  const theme = employee.themeSettings || company.themeSettings;
  const primaryColor = theme?.primaryColor || "#3B82F6";
  const secondaryColor = theme?.secondaryColor || "#1E40AF";

  return (
    <div className="public-profile" style={{ "--primary-color": primaryColor }}>
      {/* Header com gradiente da empresa */}
      <div
        className="profile-header"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="header-content">
          {/* Logo da empresa */}
          <div className="company-brand">
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="company-logo"
              />
            )}
            <div className="company-info">
              <h2 className="company-name">{company.name}</h2>
              <p className="company-tagline">Perfil Profissional</p>
            </div>
          </div>

          {/* Ações de compartilhamento */}
          <div className="header-actions">
            <button onClick={copyProfileLink} className="share-btn">
              {copied ? <Check size={18} /> : <Share2 size={18} />}
              {copied ? "Copiado!" : "Compartilhar"}
            </button>
          </div>
        </div>
      </div>

      <div className="profile-container">
        {/* Sidebar Esquerda */}
        <div className="profile-sidebar">
          {/* Avatar e informações principais */}
          <div className="profile-card">
            <div className="avatar-section">
              {employee.avatarUrl ? (
                <img
                  src={employee.avatarUrl}
                  alt={employee.fullName}
                  className="profile-avatar"
                />
              ) : (
                <div
                  className="avatar-placeholder"
                  style={{ background: primaryColor }}
                >
                  <span>{employee.fullName?.charAt(0)}</span>
                </div>
              )}
              <div className="avatar-info">
                <h1 className="employee-name">{employee.fullName}</h1>
                <p className="employee-position">{employee.position}</p>
                <p className="employee-company">
                  <Briefcase size={14} /> {company.name}
                </p>
              </div>
            </div>

            {/* Informações de contato */}
            <div className="contact-section">
              <h3>Informações de Contato</h3>
              <div className="contact-list">
                {employee.email && (
                  <div className="contact-item">
                    <Mail size={18} />
                    <div>
                      <span className="contact-label">Email</span>
                      <a
                        href={`mailto:${employee.email}`}
                        className="contact-value"
                      >
                        {employee.email}
                      </a>
                    </div>
                  </div>
                )}
                {employee.phone && (
                  <div className="contact-item">
                    <Phone size={18} />
                    <div>
                      <span className="contact-label">Telefone</span>
                      <a
                        href={`tel:${employee.phone}`}
                        className="contact-value"
                      >
                        {employee.phone}
                      </a>
                    </div>
                  </div>
                )}
                {company.website && (
                  <div className="contact-item">
                    <Globe size={18} />
                    <div>
                      <span className="contact-label">Site da Empresa</span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-value"
                      >
                        {company.website.replace("https://", "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="qr-section">
              <h3>QR Code do Perfil</h3>
              <div className="qr-container">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
                ) : (
                  <div className="qr-placeholder">
                    <QrIcon size={32} />
                  </div>
                )}
                <div className="qr-actions">
                  <button onClick={copyProfileLink} className="qr-btn">
                    <Copy size={16} /> Copiar Link
                  </button>
                  <button onClick={downloadQRCode} className="qr-btn outline">
                    <Download size={16} /> Baixar QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="profile-main">
          {/* Navegação por Tabs */}
          <div className="tabs-navigation">
            <button
              className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              Sobre
            </button>
            <button
              className={`tab-btn ${activeTab === "bio" ? "active" : ""}`}
              onClick={() => setActiveTab("bio")}
            >
              Biografia
            </button>
            <button
              className={`tab-btn ${activeTab === "social" ? "active" : ""}`}
              onClick={() => setActiveTab("social")}
            >
              Redes Sociais
            </button>
            <button
              className={`tab-btn ${activeTab === "company" ? "active" : ""}`}
              onClick={() => setActiveTab("company")}
            >
              Empresa
            </button>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="tab-content">
            {activeTab === "info" && (
              <div className="info-tab">
                <div className="info-grid">
                  <div className="info-card">
                    <h3>Informações Profissionais</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <strong>Cargo:</strong>
                        <span>{employee.position || "Não informado"}</span>
                      </div>
                      <div className="info-item">
                        <strong>Empresa:</strong>
                        <span>{company.name}</span>
                      </div>
                      <div className="info-item">
                        <strong>Setor:</strong>
                        <span>{company.industry || "Não informado"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>Sobre a Empresa</h3>
                    <p className="company-description">
                      {company.description || "Nenhuma descrição disponível."}
                    </p>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="company-link"
                      >
                        <ExternalLink size={14} /> Visitar site da empresa
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bio" && (
              <div className="bio-tab">
                <div className="bio-card">
                  <h3>Biografia Profissional</h3>
                  <div className="bio-content">
                    {employee.bio ? (
                      <p>{employee.bio}</p>
                    ) : (
                      <p className="empty-bio">
                        {employee.fullName} ainda não adicionou uma biografia.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "social" && (
              <div className="social-tab">
                <div className="social-card">
                  <h3>Redes Sociais</h3>
                  <div className="social-grid">
                    {employee.socialLinks?.linkedin && (
                      <a
                        href={employee.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link linkedin"
                      >
                        <Linkedin size={20} />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {employee.socialLinks?.github && (
                      <a
                        href={employee.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link github"
                      >
                        <Github size={20} />
                        <span>GitHub</span>
                      </a>
                    )}
                    {employee.socialLinks?.twitter && (
                      <a
                        href={employee.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link twitter"
                      >
                        <Twitter size={20} />
                        <span>Twitter</span>
                      </a>
                    )}
                    {employee.socialLinks?.instagram && (
                      <a
                        href={employee.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link instagram"
                      >
                        <Instagram size={20} />
                        <span>Instagram</span>
                      </a>
                    )}
                    {employee.socialLinks?.facebook && (
                      <a
                        href={employee.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link facebook"
                      >
                        <Facebook size={20} />
                        <span>Facebook</span>
                      </a>
                    )}
                  </div>
                  {Object.values(employee.socialLinks || {}).every(
                    (v) => !v
                  ) && (
                    <p className="empty-social">
                      Nenhuma rede social disponível.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "company" && (
              <div className="company-tab">
                <div className="company-card">
                  <div className="company-header">
                    {company.logoUrl && (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="company-tab-logo"
                      />
                    )}
                    <div className="company-tab-info">
                      <h3>{company.name}</h3>
                      <p className="company-industry">
                        {company.industry || "Não informado"}
                      </p>
                    </div>
                  </div>

                  <div className="company-details">
                    {company.description && (
                      <div className="company-detail">
                        <h4>Sobre</h4>
                        <p>{company.description}</p>
                      </div>
                    )}

                    {company.website && (
                      <div className="company-detail">
                        <h4>Website</h4>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="website-link"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="profile-footer">
        <div className="footer-content">
          <p>
            Perfil profissional de {employee.fullName} na {company.name}
          </p>
          <p className="footer-note">
            Este perfil é gerenciado através do OphuaConnect
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeePublicProfile;
