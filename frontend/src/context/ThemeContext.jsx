import React, { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    primary: "#2563eb",
    secondary: "#10b981",
    accent: "#f59e0b",
    background: "#f8fafc",
    surface: "#ffffff",
    text: "#1e293b",
    textLight: "#64748b",
    border: "#e2e8f0",
  });

  const [companyTheme, setCompanyTheme] = useState(null);

  const darkenColor = (color, percent) => {
    if (!color || !color.startsWith("#")) return color;

    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max(((num >> 8) & 0x00ff) - amt, 0);
    const B = Math.max((num & 0x0000ff) - amt, 0);

    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  const applyTheme = (themeData) => {
    if (!themeData) return;

    const root = document.documentElement;
    root.style.setProperty("--color-primary", themeData.primary);
    root.style.setProperty(
      "--color-primary-dark",
      darkenColor(themeData.primary, 20)
    );
    root.style.setProperty("--color-secondary", themeData.secondary);
    root.style.setProperty("--color-accent", themeData.accent);
    root.style.setProperty("--color-background", themeData.background);
    root.style.setProperty("--color-surface", themeData.surface);
    root.style.setProperty("--color-text", themeData.text);
    root.style.setProperty("--color-text-light", themeData.textLight);
    root.style.setProperty("--color-border", themeData.border);
  };

  useEffect(() => {
    applyTheme(companyTheme || theme);
  }, [companyTheme, theme]);

  const setCompanyThemeColors = (colors) => {
    setCompanyTheme({
      ...theme,
      ...colors,
    });
  };

  const setPersonalTheme = (colors) => {
    const newTheme = {
      ...theme,
      ...colors,
    };
    setTheme(newTheme);
    localStorage.setItem("personalTheme", JSON.stringify(colors));
  };

  const resetToDefault = () => {
    setCompanyTheme(null);
    setTheme({
      primary: "#2563eb",
      secondary: "#10b981",
      accent: "#f59e0b",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#1e293b",
      textLight: "#64748b",
      border: "#e2e8f0",
    });
  };

  const generateThemeFromLogo = async (logoUrl) => {
    return {
      primary: "#2563eb",
      secondary: "#10b981",
    };
  };

  const value = {
    theme: companyTheme || theme,
    companyTheme,
    setCompanyThemeColors,
    setPersonalTheme,
    resetToDefault,
    generateThemeFromLogo,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export { ThemeContext };
