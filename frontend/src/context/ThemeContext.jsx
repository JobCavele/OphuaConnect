// src/context/ThemeContext.jsx - VERSÃO CORRIGIDA
import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../hooks/useAuth";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState({
    primary: "#3B82F6",
    secondary: "#1E40AF",
  });

  // 🎨 EFEITO PRINCIPAL: Carrega tema sempre que usuário ou localStorage muda
  useEffect(() => {
    console.log("🎨 ThemeProvider: Iniciando carregamento de tema");
    console.log("🔴 ===== THEME CONTEXT DEBUG =====");
    console.log("🔴 Usuário atual:", user?.email, "Role:", user?.role);
    console.log("🔴 Empresa do usuário:", user?.company);
    console.log("🔴 ThemeSettings da empresa:", user?.company?.themeSettings);
    console.log(
      "🔴 localStorage companyTheme:",
      localStorage.getItem("companyTheme")
    );

    // 1. Tenta pegar do localStorage primeiro (mais rápido)
    const savedTheme = localStorage.getItem("companyTheme");
    if (savedTheme) {
      try {
        const themeData = JSON.parse(savedTheme);
        console.log("📁 Tema carregado do localStorage:", themeData);
        setTheme(themeData);
        applyThemeToCSS(themeData);
        return;
      } catch (e) {
        console.error("❌ Erro ao parsear tema do localStorage:", e);
      }
    }

    // 2. Se tem usuário COMPANY_ADMIN ou EMPLOYEE, carrega da empresa
    if (user && (user.role === "COMPANY_ADMIN" || user.role === "EMPLOYEE")) {
      console.log("🏢 Usuário com empresa:", user.company);

      // Tenta pegar tema do objeto user (vem do login/registro)
      if (user.company?.themeSettings) {
        const companyTheme = {
          primary: user.company.themeSettings.primaryColor || "#3B82F6",
          secondary: user.company.themeSettings.secondaryColor || "#1E40AF",
        };

        console.log("✅ Tema encontrado no objeto user:", companyTheme);
        setTheme(companyTheme);
        saveThemeToStorage(companyTheme);
        applyThemeToCSS(companyTheme);
        return;
      }

      // Se não tem no user, busca da API
      if (user.company?.id || user.company?.slug) {
        console.log("🔍 Buscando tema da API...");
        fetchCompanyThemeFromAPI(user.company);
      }
    }

    // 3. PERSONAL: tema pessoal
    else if (user?.role === "PERSONAL") {
      console.log("👤 Usuário PERSONAL");
      loadPersonalTheme();
    }
  }, [user]); // ← Executa quando usuário muda

  // Busca tema da API
  const fetchCompanyThemeFromAPI = async (company) => {
    try {
      const slug = company.slug || company.id;
      console.log("🌐 Buscando tema para empresa:", slug);

      const response = await fetch(
        `http://localhost:5000/api/company/theme/${slug}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.theme) {
          const companyTheme = {
            primary: data.theme.primaryColor || "#3B82F6",
            secondary: data.theme.secondaryColor || "#1E40AF",
          };

          console.log("✅ Tema da API carregado:", companyTheme);
          setTheme(companyTheme);
          saveThemeToStorage(companyTheme);
          applyThemeToCSS(companyTheme);
        } else {
          console.warn("⚠️ API não retornou tema válido");
          setDefaultTheme();
        }
      } else {
        console.warn("⚠️ Falha na API, usando tema padrão");
        setDefaultTheme();
      }
    } catch (error) {
      console.error("❌ Erro ao buscar tema da API:", error);
      setDefaultTheme();
    }
  };

  // Salva tema no localStorage
  const saveThemeToStorage = (themeData) => {
    localStorage.setItem("companyTheme", JSON.stringify(themeData));
    console.log("💾 Tema salvo no localStorage:", themeData);
  };

  // Aplica CSS
  const applyThemeToCSS = (themeData) => {
    document.documentElement.style.setProperty(
      "--primary-color",
      themeData.primary
    );
    document.documentElement.style.setProperty(
      "--secondary-color",
      themeData.secondary
    );

    console.log("🎨 CSS aplicado:", {
      primary: themeData.primary,
      secondary: themeData.secondary,
    });
  };

  // Tema padrão
  const setDefaultTheme = () => {
    const defaultTheme = {
      primary: "#3B82F6",
      secondary: "#1E40AF",
    };
    setTheme(defaultTheme);
    applyThemeToCSS(defaultTheme);
  };

  // Carrega tema pessoal
  const loadPersonalTheme = () => {
    const savedTheme = localStorage.getItem("personalTheme");
    if (savedTheme) {
      try {
        const themeData = JSON.parse(savedTheme);
        setTheme(themeData);
        applyThemeToCSS(themeData);
      } catch (e) {
        console.error("❌ Erro ao carregar tema pessoal:", e);
      }
    }
  };

  // Função para atualizar tema (usada na edição)
  const setCompanyThemeColors = (colors) => {
    const newTheme = {
      ...theme,
      ...colors,
    };

    setTheme(newTheme);
    saveThemeToStorage(newTheme);
    applyThemeToCSS(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setCompanyThemeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return context;
};

export { ThemeContext };
