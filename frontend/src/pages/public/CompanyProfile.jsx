// src/pages/public/CompanyProfile.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../styles/pages/Publicprofile.css";

const CompanyProfile = () => {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular dados da empresa
    setTimeout(() => {
      setCompany({
        name: "Tech Solutions",
        logo: "https://via.placeholder.com/150",
        description: "Soluções inovadoras em tecnologia para seu negócio.",
        website: "https://techsolutions.com",
        employees: [
          { name: "João Silva", position: "CEO" },
          { name: "Maria Santos", position: "CTO" },
        ],
        socials: {
          linkedin: "https://linkedin.com/company/techsolutions",
          twitter: "https://twitter.com/techsolutions",
        },
      });
      setLoading(false);
    }, 1000);
  }, [slug]);

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="public-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={company.logo} alt={company.name} />
        </div>

        <div className="profile-info">
          <h1>{company.name}</h1>
          <p className="profile-description">{company.description}</p>

          <div className="profile-links">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-link"
              >
                🌐 Website
              </a>
            )}
            {company.socials.linkedin && (
              <a
                href={company.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-link"
              >
                💼 LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>👥 Funcionários</h2>
          <div className="employees-grid">
            {company.employees.map((employee, index) => (
              <div key={index} className="employee-card">
                <div className="employee-avatar">{employee.name.charAt(0)}</div>
                <div className="employee-info">
                  <h4>{employee.name}</h4>
                  <p>{employee.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h2>💼 Sobre a Empresa</h2>
          <p>{company.description}</p>

          <div className="share-section">
            <h3>Compartilhar este perfil</h3>
            <div className="share-buttons">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
              >
                📋 Copiar Link
              </button>
              <button onClick={() => window.print()}>🖨️ Imprimir</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
