// src/pages/company/Dashboard.jsx - Adicione funcionalidades reais
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import "../../styles/pages/Company.css";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null); //company tá sublinhado em vermelho
  const [registrationLink, setRegistrationLink] = useState("");

  useEffect(() => {
    // Simular dados da empresa
    setTimeout(() => {
      setCompany({
        name: user?.companyName || "Sua Empresa",
        slug:
          user?.companyName?.toLowerCase().replace(/\s+/g, "-") ||
          "sua-empresa",
      });

      // Gerar link real
      const slug =
        user?.companyName?.toLowerCase().replace(/\s+/g, "-") || "sua-empresa";
      setRegistrationLink(
        `${window.location.origin}/register/employee/${slug}`
      );
    }, 500);
  }, [user]);

  return (
    <div className="company-dashboard">
      <div className="company-header">
        <h1>Bem-vindo, {user?.name || "Administrador"}!</h1>
        <p>Gerencie sua empresa no OphuaConnect</p>
      </div>

      <div className="dashboard-grid">
        {/* Card de Link de Cadastro */}
        <div className="dashboard-card">
          <h3>🔗 Link para Cadastro de Funcionários</h3>
          <p>Compartilhe este link com seus funcionários:</p>

          <div className="registration-link-container">
            <input
              type="text"
              value={registrationLink}
              readOnly
              className="registration-link-input"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(registrationLink);
                alert("Link copiado para a área de transferência!");
              }}
              className="copy-button"
            >
              📋 Copiar
            </button>
          </div>

          <div className="card-actions">
            <Link to="/company/employees" className="btn btn-primary">
              👥 Ver Funcionários
            </Link>
            <Link to="/company/edit" className="btn btn-outline">
              ✏️ Editar Perfil
            </Link>
          </div>
        </div>

        {/* Card de Ações Rápidas */}
        <div className="dashboard-card">
          <h3>⚡ Ações Rápidas</h3>
          <div className="quick-actions">
            <Link to="/company/edit" className="quick-action">
              <span>🏢</span>
              <div>
                <strong>Editar Perfil</strong>
                <small>Atualize informações da empresa</small>
              </div>
            </Link>

            <Link to="/company/employees" className="quick-action">
              <span>👥</span>
              <div>
                <strong>Gerenciar Funcionários</strong>
                <small>Ver e aprovar funcionários</small>
              </div>
            </Link>

            <div
              className="quick-action"
              onClick={() => {
                navigator.clipboard.writeText(registrationLink);
                alert("Link copiado!");
              }}
            >
              <span>🔗</span>
              <div>
                <strong>Copiar Link</strong>
                <small>Para cadastro de funcionários</small>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Tutorial */}
        <div className="dashboard-card">
          <h3>📚 Como usar</h3>
          <ol className="tutorial-steps">
            <li>
              <strong>1.</strong> Edite o perfil da sua empresa
            </li>
            <li>
              <strong>2.</strong> Copie o link de cadastro
            </li>
            <li>
              <strong>3.</strong> Compartilhe com funcionários
            </li>
            <li>
              <strong>4.</strong> Aprove os cadastros pendentes
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
