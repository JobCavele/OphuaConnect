// src/pages/company/Dashboard.jsx
import { useEffect, useState } from "react";
import { companyAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import {
  Building,
  Users,
  UserCheck,
  UserX,
  QrCode,
  Share2,
  Settings,
  BarChart,
  Link as LinkIcon,
  Copy,
  Check,
  Plus,
  Eye,
  Palette,
  Download,
  ExternalLink,
  Globe,
  Briefcase,
} from "lucide-react";
import "../../styles/pages/company.css";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log("🔍 DEBUG DASHBOARD:");
  console.log("1. Tema do contexto:", theme);
  console.log("2. Usuário:", user);
  console.log("3. Empresa do usuário:", user?.company);
  console.log("4. Tema da empresa:", user?.company?.themeSettings);
  console.log(
    "5. localStorage companyTheme:",
    localStorage.getItem("companyTheme")
  );

  useEffect(() => {
    loadData();
  }, []);
  // src/pages/company/Dashboard.jsx - Adicione este useEffect
  useEffect(() => {
    // FORÇA aplicação do tema se ainda for azul
    if (theme.primary === "#3B82F6" && data?.company?.themeSettings) {
      console.log("⚠️ Tema ainda padrão, forçando...");

      const companyTheme = {
        primary: data.company.themeSettings.primaryColor,
        secondary: data.company.themeSettings.secondaryColor,
      };

      // Aplica
      document.documentElement.style.setProperty(
        "--primary-color",
        companyTheme.primary
      );
      document.documentElement.style.setProperty(
        "--secondary-color",
        companyTheme.secondary
      );

      // Atualiza estado
      localStorage.setItem("companyTheme", JSON.stringify(companyTheme));

      console.log("✅ Tema forçado:", companyTheme);
    }
  }, [data, theme]);

  const loadData = async () => {
    try {
      const profile = await companyAPI.getProfile();
      const dashboard = await companyAPI.getDashboard(profile.slug);
      setData(dashboard);
      setLink(`${window.location.origin}/register/employee/${profile.slug}`);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <p style={{ color: theme.primary }}>Carregando dashboard...</p>
      </div>
    );
  console.log("🔵 ===== DASHBOARD DEBUG =====");
  console.log("🔵 Tema do useTheme():", theme);
  console.log("🔵 Dados da empresa:", data?.company);
  console.log("🔵 ThemeSettings dos dados:", data?.company?.themeSettings);
  console.log(
    "🔵 Variável CSS --primary-color:",
    getComputedStyle(document.documentElement).getPropertyValue(
      "--primary-color"
    )
  );
  console.log(
    "🔵 Variável CSS --secondary-color:",
    getComputedStyle(document.documentElement).getPropertyValue(
      "--secondary-color"
    )
  );

  return (
    <div
      className="company-dashboard"
      style={{
        "--company-primary": theme.primary,
        "--company-secondary": theme.secondary,
      }}
    >
      {/* Header da Empresa */}
      <div
        className="company-dashboard-header"
        style={{
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${
            theme.secondary || "#1e40af"
          } 100%)`,
        }}
      >
        <div className="dashboard-header-content">
          <div className="dashboard-brand">
            {data?.company?.logoUrl && (
              <img
                src={data.company.logoUrl}
                alt={data.company.name}
                className="dashboard-company-logo"
              />
            )}
            <div className="dashboard-header-info">
              <h1 className="dashboard-title">Dashboard Corporativo</h1>
              <p className="dashboard-subtitle">
                <Building size={16} /> {data?.company?.name} • Portal
                Administrativo
              </p>
            </div>
          </div>

          <div className="dashboard-admin-info">
            <div className="admin-welcome">
              <span>Bem-vindo,</span>
              <h3>{user?.name || user?.fullName || "Administrador"}</h3>
              <p>Admin da Empresa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas em Destaque */}
      <div className="dashboard-highlights">
        <div
          className="highlight-card"
          style={{ borderLeft: `4px solid ${theme.primary}` }}
        >
          <div className="highlight-icon" style={{ background: theme.primary }}>
            <Users size={24} />
          </div>
          <div className="highlight-content">
            <h3>{data?.totalEmployees || 0}</h3>
            <p>Total de Funcionários</p>
          </div>
          <Link to="/company/employees" className="highlight-link">
            Ver todos <ExternalLink size={14} />
          </Link>
        </div>

        <div
          className="highlight-card"
          style={{ borderLeft: `4px solid #10B981` }}
        >
          <div className="highlight-icon" style={{ background: "#10B981" }}>
            <UserCheck size={24} />
          </div>
          <div className="highlight-content">
            <h3>{data?.activeEmployees || 0}</h3>
            <p>Funcionários Ativos</p>
          </div>
          <Link
            to="/company/employees?filter=approved"
            className="highlight-link"
          >
            Ver aprovados <ExternalLink size={14} />
          </Link>
        </div>

        <div
          className="highlight-card"
          style={{ borderLeft: `4px solid #F59E0B` }}
        >
          <div className="highlight-icon" style={{ background: "#F59E0B" }}>
            <UserX size={24} />
          </div>
          <div className="highlight-content">
            <h3>{data?.pendingApprovals || 0}</h3>
            <p>Pendentes de Aprovação</p>
          </div>
          <Link
            to="/company/employees?filter=pending"
            className="highlight-link"
          >
            Ver pendentes <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      <div className="dashboard-main-grid">
        {/* Coluna da Esquerda */}
        <div className="dashboard-left-column">
          {/* Card de Link de Cadastro */}
          <div
            className="dashboard-card link-card"
            style={{ borderColor: theme.primary }}
          >
            <div
              className="card-header"
              style={{ borderBottomColor: theme.primary + "20" }}
            >
              <h2 style={{ color: theme.primary }}>
                <LinkIcon size={20} /> Link de Cadastro
              </h2>
              <p>Compartilhe com novos funcionários</p>
            </div>

            <div className="card-body">
              <div className="link-display">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="link-input"
                  style={{ borderColor: theme.primary }}
                />
                <button
                  onClick={copyLink}
                  className="copy-button"
                  style={{ background: theme.primary }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="link-actions">
                <button
                  className="link-action-btn"
                  style={{ background: theme.primary }}
                >
                  <QrCode size={18} /> Gerar QR Code
                </button>
                <button
                  className="link-action-btn outline"
                  style={{ borderColor: theme.primary, color: theme.primary }}
                >
                  <Share2 size={18} /> Compartilhar
                </button>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="dashboard-card actions-card">
            <div className="card-header">
              <h2>⚡ Ações Rápidas</h2>
            </div>

            <div className="card-body">
              <div className="quick-actions-grid">
                <Link to="/company/edit" className="quick-action">
                  <div
                    className="action-icon"
                    style={{ background: theme.primary }}
                  >
                    <Settings size={20} />
                  </div>
                  <div>
                    <h4>Editar Perfil</h4>
                    <p>Atualize dados da empresa</p>
                  </div>
                </Link>

                <Link to="/company/employees" className="quick-action">
                  <div
                    className="action-icon"
                    style={{ background: "#10B981" }}
                  >
                    <Users size={20} />
                  </div>
                  <div>
                    <h4>Gerenciar Funcionários</h4>
                    <p>Aprovar e visualizar</p>
                  </div>
                </Link>

                <Link to="/company/theme" className="quick-action">
                  <div
                    className="action-icon"
                    style={{ background: "#8B5CF6" }}
                  >
                    <Palette size={20} />
                  </div>
                  <div>
                    <h4>Personalizar Tema</h4>
                    <p>Cores e identidade visual</p>
                  </div>
                </Link>

                <Link
                  to={`/company/${data?.company?.slug}`}
                  className="quick-action"
                >
                  <div
                    className="action-icon"
                    style={{ background: "#F59E0B" }}
                  >
                    <Eye size={20} />
                  </div>
                  <div>
                    <h4>Ver Perfil Público</h4>
                    <p>Como sua empresa aparece</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna da Direita */}
        <div className="dashboard-right-column">
          {/* Preview do Perfil da Empresa */}
          <div
            className="dashboard-card profile-preview-card"
            style={{ borderColor: theme.primary }}
          >
            <div
              className="card-header"
              style={{ borderBottomColor: theme.primary + "20" }}
            >
              <h2 style={{ color: theme.primary }}>
                <Building size={20} /> Pré-visualização do Perfil
              </h2>
            </div>

            <div className="card-body">
              <div className="company-preview">
                {data?.company?.logoUrl && (
                  <img
                    src={data.company.logoUrl}
                    alt={data.company.name}
                    className="preview-logo"
                  />
                )}

                <h3 className="preview-name">{data?.company?.name}</h3>

                {data?.company?.description && (
                  <p className="preview-description">
                    {data.company.description}
                  </p>
                )}

                <div className="preview-meta">
                  {data?.company?.industry && (
                    <span className="meta-item">
                      <Briefcase size={14} /> {data.company.industry}
                    </span>
                  )}

                  {data?.company?.website && (
                    <a
                      href={data.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="meta-item link"
                    >
                      <Globe size={14} /> Site da Empresa
                    </a>
                  )}
                </div>

                <div className="preview-actions">
                  <Link
                    to={`/company/${data?.company?.slug}`}
                    className="preview-btn"
                    style={{ background: theme.primary }}
                    target="_blank"
                  >
                    <Eye size={16} /> Ver Perfil Público
                  </Link>
                  <Link
                    to="/company/edit"
                    className="preview-btn outline"
                    style={{ borderColor: theme.primary, color: theme.primary }}
                  >
                    <Settings size={16} /> Editar
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {data?.pendingApprovals > 0 && (
            <div className="alert-card" style={{ borderColor: "#F59E0B" }}>
              <div className="alert-content">
                <div className="alert-icon" style={{ background: "#F59E0B" }}>
                  <UserX size={20} />
                </div>
                <div>
                  <h4>Atenção!</h4>
                  <p>
                    <strong>{data.pendingApprovals} funcionário(s)</strong>{" "}
                    aguardando aprovação.
                  </p>
                </div>
              </div>
              <Link
                to="/company/employees?filter=pending"
                className="alert-action"
              >
                Ver agora →
              </Link>
            </div>
          )}

          {/* Atividade Recente */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h2>📈 Atividade Recente</h2>
            </div>

            <div className="card-body">
              <div className="activity-list">
                <div className="activity-item">
                  <div
                    className="activity-dot"
                    style={{ background: theme.primary }}
                  ></div>
                  <div className="activity-content">
                    <p>Dashboard acessado agora</p>
                    <span className="activity-time">Agora mesmo</span>
                  </div>
                </div>

                <div className="activity-item">
                  <div
                    className="activity-dot"
                    style={{ background: "#10B981" }}
                  ></div>
                  <div className="activity-content">
                    <p>Total de {data?.totalEmployees || 0} funcionários</p>
                    <span className="activity-time">Atualizado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer do Dashboard */}
      <div className="dashboard-footer">
        <p>
          <strong>{data?.company?.name}</strong> • Dashboard Administrativo •
          <span style={{ color: theme.primary }}> OphuaConnect</span>
        </p>
        <p className="footer-note">Gerencie sua empresa de forma eficiente</p>
      </div>
    </div>
  );
};

export default CompanyDashboard;
