// src/pages/company/profile/Edit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useTheme } from "../../../hooks/useTheme";
import AvatarUpload from "../../../components/profile/AvatarUpload";
import SocialLinks from "../../../components/profile/SocialLinks";
import { companyService } from "/src/services/company.service.js";
import "../../../styles/company/ProfileEdit.css";

const CompanyProfileEdit = () => {
  const { user, company, updateCompany } = useAuth();
  const { generateThemeFromLogo } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    size: "",
    founded: "",
  });

  const [socials, setSocials] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    youtube: "",
    github: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        description: company.description || "",
        website: company.website || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        industry: company.industry || "",
        size: company.size || "",
        founded: company.founded || "",
      });

      setSocials(company.socials || {});
      setLogoPreview(company.logo);
    }
  }, [company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (file, preview) => {
    setLogoFile(file);
    setLogoPreview(preview);
  };

  const handleSocialsChange = (updatedSocials) => {
    setSocials(updatedSocials);
  };

  const extractThemeFromLogo = async () => {
    if (logoPreview) {
      const colors = await generateThemeFromLogo(logoPreview);
      alert(
        `Tema extraído do logo: Primária ${colors.primary}, Secundária ${colors.secondary}`
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const updateData = {
        ...formData,
        socials,
      };

      if (logoFile) {
        updateData.logo = logoFile;
      }

      const response = await companyService.updateCompany(
        company.id,
        updateData
      );

      if (response.success) {
        updateCompany(response.company);
        alert("Perfil atualizado com sucesso!");
        navigate("/company/profile/view");
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Erro ao atualizar perfil. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-profile-edit">
      <div className="edit-header">
        <h1>Editar Perfil da Empresa</h1>
        <p>Atualize as informações da sua empresa</p>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="form-grid">
          {/* Seção Logo */}
          <div className="form-section logo-section">
            <h3>Logotipo da Empresa</h3>
            <AvatarUpload
              currentImage={logoPreview}
              onImageChange={handleLogoChange}
              type="company"
              size="large"
            />

            {logoPreview && (
              <button
                type="button"
                onClick={extractThemeFromLogo}
                className="btn btn-outline"
              >
                🎨 Extrair tema do logo
              </button>
            )}
          </div>

          {/* Informações Básicas */}
          <div className="form-section basic-info">
            <h3>Informações Básicas</h3>

            <div className="form-group">
              <label htmlFor="name">Nome da Empresa *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Digite o nome da sua empresa"
              />
            </div>

            <div className="form-group">
              <label htmlFor="industry">Setor/Indústria</label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
              >
                <option value="">Selecione um setor</option>
                <option value="technology">Tecnologia</option>
                <option value="finance">Finanças</option>
                <option value="healthcare">Saúde</option>
                <option value="education">Educação</option>
                <option value="retail">Varejo</option>
                <option value="manufacturing">Manufatura</option>
                <option value="consulting">Consultoria</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="size">Tamanho da Empresa</label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
              >
                <option value="">Selecione o tamanho</option>
                <option value="1-10">1-10 funcionários</option>
                <option value="11-50">11-50 funcionários</option>
                <option value="51-200">51-200 funcionários</option>
                <option value="201-500">201-500 funcionários</option>
                <option value="501+">501+ funcionários</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="founded">Ano de Fundação</label>
                <input
                  type="number"
                  id="founded"
                  name="founded"
                  value={formData.founded}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="Ex: 2020"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://suaempresa.com"
                />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="form-section full-width">
            <h3>Descrição da Empresa</h3>
            <div className="form-group">
              <label htmlFor="description">Sobre a Empresa *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="5"
                placeholder="Descreva sua empresa, missão, visão e valores..."
                maxLength="1000"
              />
              <div className="char-counter">
                {formData.description.length}/1000 caracteres
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="form-section contact-info">
            <h3>Informações de Contato</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Corporativo</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contato@empresa.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Endereço</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Rua, Número, Cidade, Estado"
              />
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="form-section full-width">
            <h3>Redes Sociais</h3>
            <SocialLinks
              socials={socials}
              onChange={handleSocialsChange}
              companyMode={true}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/company/profile/view")}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancelar
          </button>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfileEdit;
