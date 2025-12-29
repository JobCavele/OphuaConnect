// src/pages/Register.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/pages/Register.css";

const Register = () => {
  const { companySlug } = useParams();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    github: "",
  });

  const { registerPersonal, registerCompany } = useAuth();
  const navigate = useNavigate();

  const isEmployeeRegistration = !!companySlug;

  const handleSelectType = (type) => {
    setAccountType(type);
    setStep(2);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("O arquivo deve ter menos de 5MB");
        return;
      }
      if (!file.type.match("image.*")) {
        setError("Por favor, selecione uma imagem");
        return;
      }
      setLogoFile(file);
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("O arquivo deve ter menos de 5MB");
        return;
      }
      if (!file.type.match("image.*")) {
        setError("Por favor, selecione uma imagem");
        return;
      }
      setProfileImageFile(file);
    }
  };

  const handleSocialLinkChange = (platform, value) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    let result;

    if (accountType === "personal") {
      const personalData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        jobTitle: data.jobTitle,
        bio: data.bio,
        ...socialLinks,
      };
      result = await registerPersonal(personalData);
    } else if (accountType === "company") {
      const companyData = {
        companyName: data.companyName,
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        website: data.website,
        description: data.description,
        industry: data.industry,
        size: data.size,
        ...socialLinks,
      };
      result = await registerCompany(companyData); // ← CHAMADA CORRETA
    }

    if (result?.success) {
      // Salva token e user no localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      // Redireciona
      navigate(accountType === "company" ? "/company/dashboard" : "/personal/dashboard");
    } else {
      setError(result?.error || "Erro ao registrar");
    }
  } catch (err) {
    console.error("Register error:", err);
    setError("Erro ao registrar. Tente novamente.");
  } finally {
    setLoading(false);
  }
};

  if (isEmployeeRegistration) {
    return (
      <div className="register-page employee-page">
        <div className="register-container">
          <div className="register-header">
            <div className="logo-circle employee-logo">
              <span className="logo-text">👥</span>
            </div>
            <h1>Junte-se à Empresa</h1>
            <p className="subtitle">
              Você foi convidado para se registrar como funcionário
            </p>
          </div>

          <div className="register-card">
            <div className="card-header">
              <h2>Registro de Funcionário</h2>
              <p>Complete suas informações para se juntar à empresa</p>
            </div>
//mudei
            <form className="register-form" onSubmit={handleSubmit}>
              <div className="form-fields">
                <div className="form-group">
                  <label htmlFor="employeeFullName">Nome Completo *</label>
                  <input
                    id="employeeFullName"
                    name="employeeFullName"
                    type="text"
                    required
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeEmail">Email *</label>
                  <input
                    id="employeeEmail"
                    name="employeeEmail"
                    type="email"
                    required
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeJobTitle">Cargo *</label>
                  <input
                    id="employeeJobTitle"
                    name="employeeJobTitle"
                    type="text"
                    required
                    placeholder="Seu cargo na empresa"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeePhone">Telefone</label>
                  <input
                    id="employeePhone"
                    name="employeePhone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeBio">Biografia</label>
                  <textarea
                    id="employeeBio"
                    name="employeeBio"
                    rows="3"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeProfileImage">Foto de Perfil</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="employeeProfileImage"
                      name="employeeProfileImage"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="file-input"
                    />
                    <label
                      htmlFor="employeeProfileImage"
                      className="file-label"
                    >
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">
                        {profileImageFile
                          ? profileImageFile.name
                          : "Escolher imagem"}
                      </span>
                    </label>
                    {profileImageFile && (
                      <div className="file-preview">
                        <img
                          src={URL.createObjectURL(profileImageFile)}
                          alt="Preview"
                          className="preview-image"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Redes Sociais</h3>
                  <div className="social-links-grid">
                    <div className="social-input">
                      <label htmlFor="employeeLinkedin">LinkedIn</label>
                      <input
                        id="employeeLinkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/seu-perfil"
                        value={socialLinks.linkedin}
                        onChange={(e) =>
                          handleSocialLinkChange("linkedin", e.target.value)
                        }
                      />
                    </div>
                    <div className="social-input">
                      <label htmlFor="employeeInstagram">Instagram</label>
                      <input
                        id="employeeInstagram"
                        type="url"
                        placeholder="https://instagram.com/seu-perfil"
                        value={socialLinks.instagram}
                        onChange={(e) =>
                          handleSocialLinkChange("instagram", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="terms-agreement">
                <input
                  type="checkbox"
                  id="employeeTerms"
                  name="employeeTerms"
                  required
                />
                <label htmlFor="employeeTerms">
                  Concordo com os{" "}
                  <a href="#" className="terms-link">
                    Termos de Serviço
                  </a>{" "}
                  e{" "}
                  <a href="#" className="terms-link">
                    Política de Privacidade
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="submit-button employee-button"
                disabled={loading}
              >
                {loading ? "Processando..." : "Juntar-se à Empresa"}
              </button>
            </form>

            <div className="register-footer">
              <Link to="/register" className="back-link">
                ← Voltar para registro normal
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="register-page step1-page">
        <div className="register-container">
          <div className="register-header">
            <div className="logo-circle">
              <span className="logo-text">O</span>
            </div>
            <h1>Comece sua jornada</h1>
            <p className="subtitle">
              Escolha o tipo de conta que melhor se adapta a você
            </p>
          </div>

          <div className="account-type-selector">
            <div className="account-type personal-account">
              <div className="account-header">
                <div className="account-icon">
                  <span>👤</span>
                </div>
                <h3>Conta Pessoal</h3>
                <p>
                  Para profissionais individuais que desejam criar seu perfil
                  pessoal, compartilhar habilidades e conectar-se com empresas.
                </p>
              </div>

              <div className="account-features">
                <h4>Ideal para:</h4>
                <ul>
                  <li>✓ Profissionais freelancers</li>
                  <li>✓ Estudantes e recém-formados</li>
                  <li>✓ Empreendedores individuais</li>
                  <li>✓ Personalize suas cores do perfil</li>
                  <li>✓ QR Code personalizado</li>
                </ul>
              </div>

              <button
                className="select-button personal-button"
                onClick={() => handleSelectType("personal")}
              >
                Criar conta pessoal →
              </button>
            </div>

            <div className="account-type company-account">
              <div className="account-header">
                <div className="account-icon">
                  <span>🏢</span>
                </div>
                <h3>Conta Empresarial</h3>
                <p>
                  Para empresas que desejam gerenciar funcionários, criar perfis
                  corporativos e conectar-se com profissionais.
                </p>
              </div>

              <div className="account-features">
                <h4>Ideal para:</h4>
                <ul>
                  <li>✓ Pequenas e médias empresas</li>
                  <li>✓ Startups e scale-ups</li>
                  <li>✓ Recrutadores e RH</li>
                  <li>✓ Gerencie funcionários</li>
                  <li>✓ Link único de cadastro</li>
                </ul>
              </div>

              <button
                className="select-button company-button"
                onClick={() => handleSelectType("company")}
              >
                Criar conta empresarial →
              </button>
            </div>
          </div>

          <div className="register-footer">
            <p>
              Já tem uma conta?{" "}
              <Link to="/login" className="login-link">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page step2-page">
      <div className="register-container">
        <div className="register-header">
          <button className="back-button" onClick={() => setStep(1)}>
            ← Voltar para escolha
          </button>

          <div className="logo-circle">
            <span className="logo-text">
              {accountType === "personal" ? "👤" : "🏢"}
            </span>
          </div>
          <h1>
            {accountType === "personal" ? "Conta Pessoal" : "Conta Empresarial"}
          </h1>
          <p className="subtitle">Preencha os dados para criar sua conta</p>
        </div>

        <div className="register-card">
          <form className="register-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <div className="error-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p>{error}</p>
              </div>
            )}

            <div className="form-fields">
              {accountType === "company" && (
                <>
                  <div className="form-group">
                    <label htmlFor="companyLogo">Logotipo da Empresa</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="companyLogo"
                        name="companyLogo"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="file-input"
                      />
                      <label htmlFor="companyLogo" className="file-label">
                        <span className="upload-icon">🏢</span>
                        <span className="upload-text">
                          {logoFile ? logoFile.name : "Escolher logotipo"}
                        </span>
                      </label>
                      {logoFile && (
                        <div className="file-preview">
                          <img
                            src={URL.createObjectURL(logoFile)}
                            alt="Logo preview"
                            className="preview-image"
                          />
                        </div>
                      )}
                    </div>
                    <p className="file-hint">
                      Recomendado: 500x500px, PNG ou JPG, até 5MB
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="companyName">Nome da Empresa *</label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      placeholder="Digite o nome da sua empresa"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="industry">Setor/Indústria</label>
                    <input
                      id="industry"
                      name="industry"
                      type="text"
                      placeholder="Tecnologia, Saúde, Educação..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="size">Tamanho da Empresa</label>
                    <select id="size" name="size">
                      <option value="">Selecione</option>
                      <option value="1-10">1-10 funcionários</option>
                      <option value="11-50">11-50 funcionários</option>
                      <option value="51-200">51-200 funcionários</option>
                      <option value="201-500">201-500 funcionários</option>
                      <option value="500+">500+ funcionários</option>
                    </select>
                  </div>
                </>
              )}

              {accountType === "personal" && (
                <div className="form-group">
                  <label htmlFor="profileImage">Foto de Perfil</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="profileImage"
                      name="profileImage"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="file-input"
                    />
                    <label htmlFor="profileImage" className="file-label">
                      <span className="upload-icon">👤</span>
                      <span className="upload-text">
                        {profileImageFile
                          ? profileImageFile.name
                          : "Escolher foto"}
                      </span>
                    </label>
                    {profileImageFile && (
                      <div className="file-preview">
                        <img
                          src={URL.createObjectURL(profileImageFile)}
                          alt="Preview"
                          className="preview-image"
                        />
                      </div>
                    )}
                  </div>
                  <p className="file-hint">
                    Recomendado: 400x400px, PNG ou JPG, até 5MB
                  </p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="fullName">
                  {accountType === "personal"
                    ? "Nome Completo *"
                    : "Nome do Responsável *"}
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder={
                    accountType === "personal"
                      ? "Seu nome completo"
                      : "Nome do administrador"
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Senha *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength="6"
                  placeholder="Mínimo 6 caracteres"
                />
                <p className="password-hint">
                  Use letras, números e caracteres especiais para maior
                  segurança
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {accountType === "company" ? (
                <>
                  <div className="form-group">
                    <label htmlFor="website">Website da Empresa</label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://suaempresa.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Descrição da Empresa</label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      placeholder="Descreva sua empresa em poucas palavras..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="jobTitle">Cargo/Profissão</label>
                    <input
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      placeholder="Desenvolvedor, Designer, Gerente..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">Biografia</label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="3"
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>
                </>
              )}

              <div className="form-section">
                <h3>Redes Sociais</h3>
                <div className="social-links-grid">
                  <div className="social-input">
                    <label htmlFor="linkedin">LinkedIn</label>
                    <input
                      id="linkedin"
                      name="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/seu-perfil"
                      value={socialLinks.linkedin}
                      onChange={(e) =>
                        handleSocialLinkChange("linkedin", e.target.value)
                      }
                    />
                  </div>
                  <div className="social-input">
                    <label htmlFor="instagram">Instagram</label>
                    <input
                      id="instagram"
                      name="instagram"
                      type="url"
                      placeholder="https://instagram.com/seu-perfil"
                      value={socialLinks.instagram}
                      onChange={(e) =>
                        handleSocialLinkChange("instagram", e.target.value)
                      }
                    />
                  </div>
                  <div className="social-input">
                    <label htmlFor="facebook">Facebook</label>
                    <input
                      id="facebook"
                      name="facebook"
                      type="url"
                      placeholder="https://facebook.com/seu-perfil"
                      value={socialLinks.facebook}
                      onChange={(e) =>
                        handleSocialLinkChange("facebook", e.target.value)
                      }
                    />
                  </div>
                  <div className="social-input">
                    <label htmlFor="twitter">Twitter/X</label>
                    <input
                      id="twitter"
                      name="twitter"
                      type="url"
                      placeholder="https://twitter.com/seu-perfil"
                      value={socialLinks.twitter}
                      onChange={(e) =>
                        handleSocialLinkChange("twitter", e.target.value)
                      }
                    />
                  </div>
                  {accountType === "personal" && (
                    <div className="social-input">
                      <label htmlFor="github">GitHub</label>
                      <input
                        id="github"
                        name="github"
                        type="url"
                        placeholder="https://github.com/seu-perfil"
                        value={socialLinks.github}
                        onChange={(e) =>
                          handleSocialLinkChange("github", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="terms-agreement">
              <input type="checkbox" id="terms" name="terms" required />
              <label htmlFor="terms">
                Concordo com os{" "}
                <a href="#" className="terms-link">
                  Termos de Serviço
                </a>{" "}
                e{" "}
                <a href="#" className="terms-link">
                  Política de Privacidade
                </a>
              </label>
            </div>

            <button
              type="submit"
              className={`submit-button ${accountType}-button`}
              disabled={loading}
            >
              {loading ? (
                <div className="loading-button">
                  <svg className="loading-spinner" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Criando conta...</span>
                </div>
              ) : (
                `Criar ${
                  accountType === "personal"
                    ? "Conta Pessoal"
                    : "Conta Empresarial"
                }`
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Já tem uma conta?{" "}
              <Link to="/login" className="login-link">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
