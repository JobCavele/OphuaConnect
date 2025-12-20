// src/pages/public/PersonalProfile.jsx
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const PersonalProfile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    fullName: "Seu Nome",
    bio: "Desenvolvedor apaixonado por tecnologia",
    phone: "",
    location: "Cidade, País",
    skills: ["React", "Node.js", "JavaScript"],
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      portfolio: "",
    },
    theme: {
      primaryColor: "#3B82F6",
      secondaryColor: "#1E40AF",
    },
  });

  const [newSkill, setNewSkill] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialChange = (platform, value) => {
    setProfileData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleColorChange = (type, color) => {
    setProfileData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [type]: color,
      },
    }));
  };

  const handleSave = () => {
    alert("Perfil salvo com sucesso!");
    // Aqui você integraria com a API
  };

  const generateShareLink = () => {
    const link = `${window.location.origin}/profile/${
      user?.email.split("@")[0]
    }`;
    navigator.clipboard.writeText(link);
    alert("Link de compartilhamento copiado!");
  };

  const colorOptions = [
    { name: "Azul", primary: "#3B82F6", secondary: "#1E40AF" },
    { name: "Verde", primary: "#10B981", secondary: "#047857" },
    { name: "Roxo", primary: "#8B5CF6", secondary: "#7C3AED" },
    { name: "Rosa", primary: "#EC4899", secondary: "#BE185D" },
    { name: "Laranja", primary: "#F97316", secondary: "#EA580C" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Meu Perfil Pessoal
            </h1>
            <p className="text-gray-600">
              Gerencie suas informações e aparência
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={generateShareLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔗 Compartilhar Perfil
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col items-center">
                <div
                  className="h-32 w-32 rounded-full mb-4 flex items-center justify-center text-white text-4xl font-bold shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${profileData.theme.primaryColor}, ${profileData.theme.secondaryColor})`,
                  }}
                >
                  {profileData.fullName.charAt(0)}
                </div>
                <h3 className="text-xl font-semibold text-center">
                  {profileData.fullName}
                </h3>
                <p className="text-gray-500 text-center">{user?.email}</p>
                <div className="mt-4 flex space-x-2">
                  {profileData.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${profileData.theme.primaryColor}20`,
                        color: profileData.theme.primaryColor,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <nav className="bg-white rounded-lg shadow">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-3 border-l-4 transition-all ${
                  activeTab === "profile"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-transparent hover:bg-gray-50 text-gray-700"
                }`}
              >
                👤 Perfil
              </button>
              <button
                onClick={() => setActiveTab("social")}
                className={`w-full text-left px-4 py-3 border-l-4 transition-all ${
                  activeTab === "social"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-transparent hover:bg-gray-50 text-gray-700"
                }`}
              >
                🔗 Redes Sociais
              </button>
              <button
                onClick={() => setActiveTab("skills")}
                className={`w-full text-left px-4 py-3 border-l-4 transition-all ${
                  activeTab === "skills"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-transparent hover:bg-gray-50 text-gray-700"
                }`}
              >
                ⚡ Habilidades
              </button>
              <button
                onClick={() => setActiveTab("theme")}
                className={`w-full text-left px-4 py-3 border-l-4 transition-all ${
                  activeTab === "theme"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-transparent hover:bg-gray-50 text-gray-700"
                }`}
              >
                🎨 Tema
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`w-full text-left px-4 py-3 border-l-4 transition-all ${
                  activeTab === "preview"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-transparent hover:bg-gray-50 text-gray-700"
                }`}
              >
                👁️ Visualização
              </button>
            </nav>

            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-800 mb-3">Link do Perfil</h4>
              <div className="p-2 bg-gray-50 rounded text-sm font-mono truncate">
                ophuaconnect.com/{user?.email.split("@")[0]}
              </div>
              <button
                onClick={generateShareLink}
                className="w-full mt-3 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                Copiar Link
              </button>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:w-3/4">
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Informações Pessoais
                  </h2>
                  <p className="text-gray-600">Atualize seus dados pessoais</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localização
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Cidade, País"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografia
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Conte um pouco sobre você..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {profileData.bio.length}/500 caracteres
                    </p>
                  </div>

                  <div className="pt-6 border-t">
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      💾 Salvar Perfil
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "social" && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Redes Sociais
                  </h2>
                  <p className="text-gray-600">Adicione seus perfis sociais</p>
                </div>
                <div className="p-6 space-y-6">
                  {[
                    {
                      key: "github",
                      label: "GitHub",
                      icon: "🐙",
                      placeholder: "https://github.com/seu-usuario",
                    },
                    {
                      key: "linkedin",
                      label: "LinkedIn",
                      icon: "💼",
                      placeholder: "https://linkedin.com/in/seu-perfil",
                    },
                    {
                      key: "twitter",
                      label: "Twitter/X",
                      icon: "🐦",
                      placeholder: "https://twitter.com/seu-usuario",
                    },
                    {
                      key: "portfolio",
                      label: "Portfólio",
                      icon: "🌐",
                      placeholder: "https://seu-portfolio.com",
                    },
                  ].map((social) => (
                    <div
                      key={social.key}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="text-2xl">{social.icon}</div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {social.label}
                        </label>
                        <input
                          type="url"
                          value={profileData.socialLinks[social.key]}
                          onChange={(e) =>
                            handleSocialChange(social.key, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={social.placeholder}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-6 border-t">
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Salvar Redes Sociais
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "skills" && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Habilidades
                  </h2>
                  <p className="text-gray-600">
                    Adicione suas habilidades e competências
                  </p>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex space-x-2 mb-4">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddSkill()
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite uma habilidade (ex: React, Node.js)"
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Pressione Enter ou clique em Adicionar para incluir a
                      habilidade
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Suas Habilidades ({profileData.skills.length})
                    </h3>
                    {profileData.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 px-3 py-2 rounded-full"
                            style={{
                              backgroundColor: `${profileData.theme.primaryColor}20`,
                              color: profileData.theme.primaryColor,
                            }}
                          >
                            <span className="font-medium">{skill}</span>
                            <button
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-xs opacity-70 hover:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Nenhuma habilidade adicionada ainda.
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Habilidades Sugeridas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "TypeScript",
                        "Python",
                        "Docker",
                        "AWS",
                        "UI/UX",
                        "MongoDB",
                        "GraphQL",
                        "Next.js",
                      ].map((skill) => (
                        <button
                          key={skill}
                          onClick={() => {
                            if (!profileData.skills.includes(skill)) {
                              setProfileData((prev) => ({
                                ...prev,
                                skills: [...prev.skills, skill],
                              }));
                            }
                          }}
                          disabled={profileData.skills.includes(skill)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            profileData.skills.includes(skill)
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "theme" && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Tema Personalizado
                  </h2>
                  <p className="text-gray-600">
                    Escolha as cores do seu perfil
                  </p>
                </div>
                <div className="p-6">
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Cores Pré-definidas
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {colorOptions.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleColorChange("primaryColor", color.primary);
                            handleColorChange(
                              "secondaryColor",
                              color.secondary
                            );
                          }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            profileData.theme.primaryColor === color.primary
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex flex-col space-y-1">
                              <div
                                className="h-6 w-12 rounded"
                                style={{ backgroundColor: color.primary }}
                              ></div>
                              <div
                                className="h-6 w-12 rounded"
                                style={{ backgroundColor: color.secondary }}
                              ></div>
                            </div>
                            <span className="font-medium">{color.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Cores Personalizadas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor Primária
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="color"
                            value={profileData.theme.primaryColor}
                            onChange={(e) =>
                              handleColorChange("primaryColor", e.target.value)
                            }
                            className="h-12 w-24 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={profileData.theme.primaryColor}
                            onChange={(e) =>
                              handleColorChange("primaryColor", e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor Secundária
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="color"
                            value={profileData.theme.secondaryColor}
                            onChange={(e) =>
                              handleColorChange(
                                "secondaryColor",
                                e.target.value
                              )
                            }
                            className="h-12 w-24 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={profileData.theme.secondaryColor}
                            onChange={(e) =>
                              handleColorChange(
                                "secondaryColor",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${profileData.theme.primaryColor}, ${profileData.theme.secondaryColor})`,
                      }}
                    >
                      Aplicar Tema
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preview" && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Visualização do Perfil
                  </h2>
                  <p className="text-gray-600">
                    Veja como seu perfil aparece para os outros
                  </p>
                </div>
                <div className="p-6">
                  <div className="max-w-2xl mx-auto">
                    {/* Preview Card */}
                    <div
                      className="rounded-2xl shadow-xl overflow-hidden mb-6"
                      style={{
                        border: `4px solid ${profileData.theme.primaryColor}20`,
                      }}
                    >
                      {/* Header */}
                      <div
                        className="h-32 relative"
                        style={{
                          background: `linear-gradient(135deg, ${profileData.theme.primaryColor}, ${profileData.theme.secondaryColor})`,
                        }}
                      >
                        <div className="absolute -bottom-16 left-6">
                          <div
                            className="h-32 w-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-5xl font-bold"
                            style={{
                              background: `linear-gradient(135deg, ${profileData.theme.primaryColor}, ${profileData.theme.secondaryColor})`,
                            }}
                          >
                            {profileData.fullName.charAt(0)}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pt-20 px-6 pb-6 bg-white">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                              {profileData.fullName}
                            </h3>
                            <p className="text-gray-600">
                              {profileData.location}
                            </p>
                          </div>
                          <button
                            className="px-4 py-2 text-sm font-medium rounded-lg text-white"
                            style={{
                              background: `linear-gradient(135deg, ${profileData.theme.primaryColor}, ${profileData.theme.secondaryColor})`,
                            }}
                          >
                            Seguir
                          </button>
                        </div>

                        <p className="text-gray-700 mb-6">{profileData.bio}</p>

                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-800 mb-3">
                            Habilidades
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {profileData.skills
                              .slice(0, 5)
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 text-sm font-medium rounded-full"
                                  style={{
                                    backgroundColor: `${profileData.theme.primaryColor}20`,
                                    color: profileData.theme.primaryColor,
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                            {profileData.skills.length > 5 && (
                              <span className="px-3 py-1 text-sm text-gray-500">
                                +{profileData.skills.length - 5} mais
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="border-t pt-6">
                          <h4 className="font-semibold text-gray-800 mb-3">
                            Redes Sociais
                          </h4>
                          <div className="flex space-x-4">
                            {Object.entries(profileData.socialLinks)
                              .filter(([_, url]) => url)
                              .slice(0, 3)
                              .map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <span className="text-lg">
                                    {platform === "github" && "🐙"}
                                    {platform === "linkedin" && "💼"}
                                    {platform === "twitter" && "🐦"}
                                    {platform === "portfolio" && "🌐"}
                                  </span>
                                  <span className="text-sm font-medium capitalize">
                                    {platform}
                                  </span>
                                </a>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-6 py-4 bg-gray-50 border-t">
                        <div className="text-center text-gray-500 text-sm">
                          Perfil criado no OphuaConnect • ophuaconnect.com/
                          {user?.email.split("@")[0]}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={generateShareLink}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        🔗 Compartilhar Este Perfil
                      </button>
                      <p className="text-gray-600 text-sm mt-3">
                        Seu perfil está pronto para ser compartilhado!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonalProfile;
