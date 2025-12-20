// src/layouts/CompanyLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import "../styles/layouts/CompanyLayout.css";

const CompanyLayout = () => {
  const { user, company } = useAuth();
  const { theme } = useTheme();

  const sidebarItems = [
    { path: "/company/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/company/profile/view", label: "Perfil", icon: "🏢" },
    { path: "/company/employees", label: "Funcionários", icon: "👥" },
    {
      path: "/company/employees/pending",
      label: "Aprovações",
      icon: "⏳",
      badge: "3",
    },
    {
      path: "/company/links/registration",
      label: "Link de Cadastro",
      icon: "🔗",
    },
    { path: "/company/links/qrcode", label: "QR Code", icon: "📱" },
    { path: "/company/theme", label: "Tema", icon: "🎨" },
    { path: "/company/settings", label: "Configurações", icon: "⚙️" },
  ];

  return (
    <div
      className="company-layout"
      style={{ "--company-primary": theme.primary }}
    >
      <Header user={user} company={company} />
      <div className="layout-content">
        <Sidebar items={sidebarItems} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CompanyLayout;
