// src/pages/company/Profile/Edit.jsx - VERSÃO CORRIGIDA
import React, { useEffect, useState, useContext } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { companyService } from "../../../services/company.service";
import { ThemeContext } from "../../../context/ThemeContext";
import "../../../styles/pages/CompanyEdit.css";

const CompanyProfileEdit = () => {
  const { user } = useAuth();
  const themeContext = useContext(ThemeContext);

  // Extrai valores do contexto com fallback
  const theme = themeContext?.theme || {
    primary: "#2563eb",
    secondary: "#10b981",
  };
  const setCompanyThemeColors =
    themeContext?.setCompanyThemeColors || (() => {});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    industry: "",
    size: "",
    logoUrl: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      linkedin: "",
      twitter: "",
      github: "",
    },
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Debug: verifique se o contexto está disponível
  console.log("🎨 ThemeContext disponível:", !!themeContext);
  console.log("🎨 Tema atual:", theme);

  // Carregar dados da empresa
  useEffect(() => {
    loadCompanyProfile();
  }, []);
  const loadCompanyProfile = async () => {
    try {
      setLoading(true);
      const response = await companyService.getCompanyProfile();

      if (response) {
        // CORREÇÃO: Garantir que logoUrl seja string
        let logoUrl = response.logoUrl || "";
        if (Array.isArray(logoUrl)) {
          logoUrl = logoUrl[0] || "";
        }

        setFormData({
          name: response.name || "",
          description: response.description || "",
          website: response.website || "",
          industry: response.industry || "",
          size: response.size || "",
          logoUrl: logoUrl, // ← Agora é garantidamente string
          socialLinks: response.socialLinks || {
            facebook: "",
            instagram: "",
            linkedin: "",
            twitter: "",
            github: "",
          },
        });

        // Se houver tema no backend, aplica
        if (response.themeSettings) {
          const themeColors = {
            primary: response.themeSettings.primaryColor || "#2563eb",
            secondary: response.themeSettings.secondaryColor || "#10b981",
          };

          if (setCompanyThemeColors) {
            setCompanyThemeColors(themeColors);
          }
        }
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      setError("Não foi possível carregar os dados da empresa.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
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

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          logoUrl: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle theme color change
  const handleThemeColorChange = (type, color) => {
    if (setCompanyThemeColors) {
      const newColors =
        type === "primary" ? { primary: color } : { secondary: color };
      setCompanyThemeColors(newColors);
    }
  };

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await companyService.updateCompanyProfile(
        formData,
        selectedFile
      );

      if (result.success) {
        setSuccess("Perfil atualizado com sucesso!");

        // Se houver tema personalizado, salva também
        if (theme.primary || theme.secondary) {
          await companyService.updateTheme({
            primaryColor: theme.primary,
            secondaryColor: theme.secondary,
          });
        }

        // Recarrega após 2 segundos
        setTimeout(() => {
          loadCompanyProfile();
          setSuccess("");
        }, 2000);
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setError(err.message || "Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="company-edit">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="company-edit">
      <h1>Editar Perfil da Empresa</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSave}>
        {/* Dados básicos */}
        <div className="form-section">
          <h2>Informações Básicas</h2>

          <div className="form-group">
            <label>Nome da Empresa *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Setor</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Tamanho</label>
            <select name="size" value={formData.size} onChange={handleChange}>
              <option value="">Selecione</option>
              <option value="1-10">1-10 funcionários</option>
              <option value="11-50">11-50 funcionários</option>
              <option value="51-200">51-200 funcionários</option>
              <option value="201-500">201-500 funcionários</option>
              <option value="500+">500+ funcionários</option>
            </select>
          </div>
        </div>

        {/* Logo */}
        <div className="form-section">
          <h2>Logo</h2>
          <div className="form-group">
            <label>Logo da Empresa</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
            {formData.logoUrl && (
              <div className="logo-preview">
                <img src={formData.logoUrl} alt="Logo preview" />
              </div>
            )}
          </div>
        </div>

        {/* Tema */}
        <div className="form-section">
          <h2>Cores do Tema</h2>
          <div className="theme-colors">
            <div className="color-picker">
              <label>Cor Primária</label>
              <div className="color-input">
                <input
                  type="color"
                  value={theme.primary || "#2563eb"}
                  onChange={(e) =>
                    handleThemeColorChange("primary", e.target.value)
                  }
                />
                <input
                  type="text"
                  value={theme.primary || "#2563eb"}
                  onChange={(e) =>
                    handleThemeColorChange("primary", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="color-picker">
              <label>Cor Secundária</label>
              <div className="color-input">
                <input
                  type="color"
                  value={theme.secondary || "#10b981"}
                  onChange={(e) =>
                    handleThemeColorChange("secondary", e.target.value)
                  }
                />
                <input
                  type="text"
                  value={theme.secondary || "#10b981"}
                  onChange={(e) =>
                    handleThemeColorChange("secondary", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="form-section">
          <h2>Redes Sociais</h2>
          {Object.entries(formData.socialLinks).map(([platform, value]) => (
            <div className="form-group" key={platform}>
              <label>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </label>
              <input
                type="url"
                value={value}
                onChange={(e) => handleSocialChange(platform, e.target.value)}
                placeholder={`https://${platform}.com/...`}
              />
            </div>
          ))}
        </div>

        {/* Botões */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            style={{ backgroundColor: theme.primary }}
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={loadCompanyProfile}
          >
            Recarregar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfileEdit;
