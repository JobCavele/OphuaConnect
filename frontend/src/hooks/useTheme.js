// src/hooks/useTheme.js
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }

  return context;
};
