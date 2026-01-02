// src/services/company.service.js
const API_BASE_URL = "http://localhost:5000/api";

const getToken = () => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    document.cookie.match(/token=([^;]+)/)?.[1];

  console.log("🔑 Token encontrado:", token ? "Sim" : "Não");
  return token;
};

export const companyService = {
  async getCompanyProfile(companySlug = null) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      let url = `${API_BASE_URL}/company/profile`;
      if (companySlug) {
        url = `${API_BASE_URL}/company/${companySlug}/profile`;
      }

      console.log("📤 Fazendo requisição para:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao carregar perfil da empresa:", error);
      throw error;
    }
  },

  // ✅ MÉTODO FALTANTE - ADICIONE ISSO
  async updateCompanyProfile(data, logoFile = null) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      const formData = new FormData();

      // Adiciona campos de texto
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          // Se for objeto (socialLinks), converte para string JSON
          if (typeof data[key] === "object" && data[key] !== null) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      // Adiciona arquivo de logo se existir
      if (logoFile && logoFile instanceof File) {
        formData.append("logo", logoFile);
      } else if (data.logoUrl && typeof data.logoUrl === "string") {
        // Se for URL, passa como string
        formData.append("logoUrl", data.logoUrl);
      }

      console.log("📤 Atualizando perfil da empresa...");

      const response = await fetch(`${API_BASE_URL}/company/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // NÃO adicione Content-Type aqui - o browser define automaticamente
        },
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro na resposta:", errorText);
        throw new Error(`Erro ao atualizar perfil: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Perfil atualizado com sucesso:", result);
      return result;
    } catch (error) {
      console.error("Erro ao atualizar perfil da empresa:", error);
      throw error;
    }
  },

  // Método para upload de logo separado (opcional)
  async uploadLogo(logoFile) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      const formData = new FormData();
      formData.append("logo", logoFile);

      console.log("📤 Enviando logo...");

      const response = await fetch(`${API_BASE_URL}/company/upload-logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro no upload: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro no upload do logo:", error);
      throw error;
    }
  },

  // Método para atualizar tema
  async updateTheme(themeData) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      console.log("🎨 Atualizando tema:", themeData);

      const response = await fetch(`${API_BASE_URL}/company/update-theme`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(themeData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao atualizar tema: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Tema atualizado:", result);
      return result;
    } catch (error) {
      console.error("Erro ao atualizar tema:", error);
      throw error;
    }
  },

  // Obter funcionários da empresa
  async getEmployees() {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      const response = await fetch(`${API_BASE_URL}/company/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      throw error;
    }
  },

  // Obter dashboard da empresa
  async getDashboard(slug = null) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      let url = `${API_BASE_URL}/company/dashboard`;
      if (slug) {
        url = `${API_BASE_URL}/company/${slug}/dashboard`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      throw error;
    }
  },

  // Gerar link de registro para funcionários
  async getRegistrationLink() {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      // Primeiro obtém o perfil para pegar o slug
      const profile = await this.getCompanyProfile();

      if (profile && profile.slug) {
        return {
          success: true,
          link: `${window.location.origin}/register/employee/${profile.slug}`,
          slug: profile.slug,
        };
      } else {
        throw new Error("Não foi possível gerar o link de registro");
      }
    } catch (error) {
      console.error("Erro ao gerar link de registro:", error);
      throw error;
    }
  },
};
