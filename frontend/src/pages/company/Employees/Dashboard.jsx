// src/pages/employee/Dashboard.jsx
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useTheme } from "../../../hooks/useTheme";
import { fetchAPI } from "../../../services/api";
import QRCode from "qrcode";
import {
  Building,
  User,
  Mail,
  Phone,
  Globe,
  Share2,
  QrCode,
  Eye,
  Copy,
  Download,
  Palette,
  Edit,
  Check,
  Briefcase,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Github,
  ChevronRight,
} from "lucide-react";
import "../../../styles/pages/employee.css";

const EmployeeDashboard = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState("view");
  const [formData, setFormData] = useState({});
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Carrega dados do perfil
  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      generateQRCode();
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(`/api/employee/profile/${user.id}`);
      if (response.success) {
        const profileData = response.profile;
        setProfile(profileData);
        setFormData({
          fullName: profileData.fullName || "",
          position: profileData.position || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          avatarUrl: profileData.avatarUrl || "",
          socialLinks: profileData.socialLinks || {},
        });
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/employee/upload-avatar/${user.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          avatarUrl: data.avatarUrl,
        }));
        await loadProfile();
        alert("Foto atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao enviar foto");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const generateQRCode = async () => {
    try {
      const profileUrl = `${window.location.origin}/company/${user.company?.slug}/employee/${user.id}`;
      const qr = await QRCode.toDataURL(profileUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: theme.primary || "#3B82F6",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qr);
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetchAPI(`/api/employee/profile/${user.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.success) {
        setProfile(response.profile);
        setMode("view");
        updateUser(response.profile);
        alert("Perfil atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar alterações");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr-code-${profile?.fullName
      ?.toLowerCase()
      .replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareProfile = () => {
    const profileUrl = `${window.location.origin}/company/${user.company?.slug}/employee/${user.id}`;
    copyToClipboard(profileUrl);
  };

  if (loading)
    return (
      <div
        className="loading-screen"
        style={{ background: theme.primary + "10" }}
      >
        <div
          className="spinner"
          style={{ borderTopColor: theme.primary }}
        ></div>
        <p style={{ color: theme.primary }}>Carregando seu perfil...</p>
      </div>
    );

  if (!profile) return <div>Erro ao carregar perfil</div>;

  return (
    <div
      className="employee-dashboard"
      style={{
        "--company-primary": theme.primary,
        "--company-secondary": theme.secondary,
      }}
    >
      {/* Header da Empresa */}
      <div className="company-header" style={{ background: theme.primary }}>
        <div className="company-header-content">
          <div className="company-brand">
            {user.company?.logoUrl && (
              <img
                src={user.company.logoUrl}
                alt={user.company.name}
                className="company-header-logo"
              />
            )}
            <div className="company-header-info">
              <h1 className="company-name">{user.company?.name}</h1>
              <p className="company-tagline">Portal do Funcionário</p>
            </div>
          </div>

          <div className="employee-welcome">
            <div className="welcome-text">
              <span className="welcome-greeting">Olá,</span>
              <h2 className="employee-name">{profile.fullName}</h2>
              <p className="employee-position">{profile.position}</p>
            </div>
            <div className="avatar-container">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="employee-avatar"
                />
              ) : (
                <div
                  className="avatar-placeholder"
                  style={{ background: theme.primary }}
                >
                  <User size={40} />
                </div>
              )}

              {mode === "edit" && (
                <div className="avatar-upload-overlay">
                  <label htmlFor="avatar-upload" className="upload-label">
                    {uploadingAvatar ? (
                      <div className="uploading-spinner"></div>
                    ) : (
                      <>
                        <Edit size={20} />
                        <span>Alterar foto</span>
                      </>
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="upload-input"
                    disabled={uploadingAvatar}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modo de Visualização/Edição */}
      <div className="view-mode-toggle">
        <button
          className={`mode-btn ${mode === "view" ? "active" : ""}`}
          onClick={() => setMode("view")}
          style={{
            background: mode === "view" ? theme.primary : "transparent",
            color: mode === "view" ? "white" : theme.primary,
          }}
        >
          <Eye size={18} /> Visualizar
        </button>
        <button
          className={`mode-btn ${mode === "edit" ? "active" : ""}`}
          onClick={() => setMode("edit")}
          style={{
            background: mode === "edit" ? theme.primary : "transparent",
            color: mode === "edit" ? "white" : theme.primary,
          }}
        >
          <Edit size={18} /> Editar
        </button>
      </div>

      <div className="dashboard-content">
        {/* Seção Principal */}
        <div className="main-section">
          {/* Card de Perfil */}
          <div className="profile-section">
            <div
              className="section-header"
              style={{ borderLeft: `4px solid ${theme.primary}` }}
            >
              <h3>Meu Perfil</h3>
              <p>Suas informações profissionais</p>
            </div>

            <div className="profile-content">
              {/* Informações Básicas */}
              <div className="info-grid">
                <div className="info-group">
                  <label>Nome Completo</label>
                  {mode === "edit" ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName || ""}
                      onChange={handleInputChange}
                      className="profile-input"
                      style={{ borderColor: theme.primary }}
                    />
                  ) : (
                    <div className="info-value">{profile.fullName}</div>
                  )}
                </div>

                <div className="info-group">
                  <label>Cargo</label>
                  {mode === "edit" ? (
                    <input
                      type="text"
                      name="position"
                      value={formData.position || ""}
                      onChange={handleInputChange}
                      className="profile-input"
                      style={{ borderColor: theme.primary }}
                    />
                  ) : (
                    <div className="info-value">{profile.position}</div>
                  )}
                </div>

                <div className="info-group">
                  <label>Email</label>
                  <div className="info-value">{user.email}</div>
                </div>

                <div className="info-group">
                  <label>Telefone</label>
                  {mode === "edit" ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      className="profile-input"
                      style={{ borderColor: theme.primary }}
                    />
                  ) : (
                    <div className="info-value">
                      {profile.phone || "Não informado"}
                    </div>
                  )}
                </div>
              </div>

              {/* Biografia */}
              <div className="bio-section">
                <label>Sobre</label>
                {mode === "edit" ? (
                  <textarea
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                    className="bio-input"
                    style={{ borderColor: theme.primary }}
                    rows={4}
                    placeholder="Conte um pouco sobre sua experiência..."
                  />
                ) : (
                  <div className="bio-content">
                    {profile.bio || "Nenhuma biografia adicionada."}
                  </div>
                )}
              </div>

              {/* Redes Sociais */}
              <div className="social-section">
                <label>Redes Sociais</label>
                <div className="social-grid">
                  {[
                    {
                      key: "linkedin",
                      icon: <Linkedin size={20} />,
                      label: "LinkedIn",
                    },
                    {
                      key: "github",
                      icon: <Github size={20} />,
                      label: "GitHub",
                    },
                    {
                      key: "twitter",
                      icon: <Twitter size={20} />,
                      label: "Twitter",
                    },
                    {
                      key: "instagram",
                      icon: <Instagram size={20} />,
                      label: "Instagram",
                    },
                    {
                      key: "facebook",
                      icon: <Facebook size={20} />,
                      label: "Facebook",
                    },
                  ].map((social) => (
                    <div key={social.key} className="social-item">
                      <div
                        className="social-icon"
                        style={{ color: theme.primary }}
                      >
                        {social.icon}
                      </div>
                      {mode === "edit" ? (
                        <input
                          type="url"
                          value={formData.socialLinks?.[social.key] || ""}
                          onChange={(e) =>
                            handleSocialChange(social.key, e.target.value)
                          }
                          className="social-input"
                          style={{ borderColor: theme.primary }}
                          placeholder={`${social.label} URL`}
                        />
                      ) : (
                        <div className="social-url">
                          {profile.socialLinks?.[social.key] || "Não informado"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card de Compartilhamento */}
          <div className="share-section" style={{ borderColor: theme.primary }}>
            <div
              className="section-header"
              style={{ borderLeft: `4px solid ${theme.primary}` }}
            >
              <h3>Compartilhar Perfil</h3>
              <p>Divulgue seu perfil profissional</p>
            </div>

            <div className="share-content">
              {/* QR Code */}
              <div className="qr-code-container">
                <div className="qr-code-wrapper">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="qr-code-image"
                    />
                  ) : (
                    <div
                      className="qr-code-placeholder"
                      style={{ background: theme.primary + "20" }}
                    >
                      <QrCode size={40} style={{ color: theme.primary }} />
                    </div>
                  )}
                </div>

                <div className="qr-code-actions">
                  <button
                    onClick={shareProfile}
                    className="share-action-btn"
                    style={{
                      background: theme.primary,
                      borderColor: theme.primary,
                    }}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? "Copiado!" : "Copiar Link"}
                  </button>

                  <button
                    onClick={downloadQRCode}
                    className="share-action-btn outline"
                    style={{
                      borderColor: theme.primary,
                      color: theme.primary,
                    }}
                  >
                    <Download size={18} />
                    Baixar QR Code
                  </button>
                </div>
              </div>

              {/* Link do Perfil */}
              <div className="profile-link">
                <label>Link do seu perfil:</label>
                <div className="link-container">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/company/${user.company?.slug}/employee/${user.id}`}
                    className="link-input"
                    style={{ borderColor: theme.primary }}
                  />
                  <button
                    onClick={shareProfile}
                    className="copy-btn"
                    style={{ background: theme.primary }}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar da Empresa */}
        <div className="company-sidebar">
          {/* Card da Empresa */}
          <div className="company-card" style={{ borderColor: theme.primary }}>
            <div
              className="card-header"
              style={{ background: theme.primary + "10" }}
            >
              <h4 style={{ color: theme.primary }}>Sobre a Empresa</h4>
            </div>

            <div className="card-body">
              {user.company?.logoUrl && (
                <img
                  src={user.company.logoUrl}
                  alt={user.company.name}
                  className="company-sidebar-logo"
                />
              )}

              <h5 className="company-title">{user.company?.name}</h5>

              {user.company?.description && (
                <p className="company-description">
                  {user.company.description}
                </p>
              )}

              <div className="company-details">
                {user.company?.industry && (
                  <div className="detail-item">
                    <Briefcase size={14} />
                    <span>{user.company.industry}</span>
                  </div>
                )}

                {user.company?.website && (
                  <a
                    href={user.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-item link"
                    style={{ color: theme.primary }}
                  >
                    <Globe size={14} />
                    <span>Site da Empresa</span>
                    <ChevronRight size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="action-buttons">
            {mode === "edit" ? (
              <>
                <button
                  onClick={handleSave}
                  className="action-btn primary"
                  style={{ background: theme.primary }}
                >
                  <Check size={18} />
                  Salvar Alterações
                </button>
                <button
                  onClick={() => setMode("view")}
                  className="action-btn outline"
                  style={{ borderColor: theme.primary, color: theme.primary }}
                >
                  Cancelar Edição
                </button>
              </>
            ) : (
              <button
                onClick={() => setMode("edit")}
                className="action-btn primary"
                style={{ background: theme.primary }}
              >
                <Edit size={18} />
                Editar Perfil
              </button>
            )}
          </div>

          {/* Preview do Tema */}
          <div className="theme-preview">
            <h5 style={{ color: theme.primary }}>Identidade Visual</h5>
            <div className="theme-colors">
              <div
                className="color-primary"
                style={{ background: theme.primary }}
                title="Cor Primária"
              />
              <div
                className="color-secondary"
                style={{ background: theme.secondary || theme.primary + "80" }}
                title="Cor Secundária"
              />
            </div>
            <p className="theme-note">Cores da sua empresa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
