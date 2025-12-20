import React, { useState, useEffect } from "react";
import "../../styles/pages/Admin.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    activeCompanies: 0,
  });

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setStats({
        totalCompanies: 45,
        totalUsers: 320,
        pendingApprovals: 12,
        activeCompanies: 33,
      });

      setCompanies([
        {
          id: 1,
          name: "Tech Solutions",
          email: "contact@techsolutions.com",
          status: "active",
          employees: 24,
          createdAt: "2024-01-15",
        },
        {
          id: 2,
          name: "Design Studio",
          email: "hello@designstudio.com",
          status: "pending",
          employees: 8,
          createdAt: "2024-02-10",
        },
        {
          id: 3,
          name: "Marketing Pro",
          email: "info@marketingpro.com",
          status: "active",
          employees: 15,
          createdAt: "2024-01-28",
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = (companyId) => {
    alert(`Aprovar empresa ${companyId}`);
    // Lógica de aprovação
  };

  const handleReject = (companyId) => {
    if (window.confirm("Tem certeza que deseja rejeitar esta empresa?")) {
      alert(`Rejeitar empresa ${companyId}`);
      // Lógica de rejeição
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <nav className="admin-nav">
          <div className="admin-logo">
            <h1>OphuaConnect Admin</h1>
          </div>
          <div className="admin-menu">
            <a href="/admin" className="menu-item active">
              Dashboard
            </a>
            <a href="/admin/companies" className="menu-item">
              Empresas
            </a>
            <a href="/admin/users" className="menu-item">
              Usuários
            </a>
            <a href="/admin/settings" className="menu-item">
              Configurações
            </a>
            <a href="/logout" className="menu-item logout">
              Sair
            </a>
          </div>
        </nav>
      </header>

      <main className="admin-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon companies-icon">
              <span>🏢</span>
            </div>
            <div className="stat-info">
              <h3>Total de Empresas</h3>
              <div className="stat-number">{stats.totalCompanies}</div>
              <div className="stat-trend positive">+5 este mês</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon users-icon">
              <span>👥</span>
            </div>
            <div className="stat-info">
              <h3>Total de Usuários</h3>
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-trend positive">+42 este mês</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending-icon">
              <span>⏳</span>
            </div>
            <div className="stat-info">
              <h3>Aprovações Pendentes</h3>
              <div className="stat-number">{stats.pendingApprovals}</div>
              <div className="stat-trend warning">Revisão necessária</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active-icon">
              <span>✅</span>
            </div>
            <div className="stat-info">
              <h3>Empresas Ativas</h3>
              <div className="stat-number">{stats.activeCompanies}</div>
              <div className="stat-trend positive">+3 este mês</div>
            </div>
          </div>
        </div>

        <div className="companies-section">
          <div className="section-header">
            <h2>Empresas Recentes</h2>
            <button className="create-button">+ Nova Empresa</button>
          </div>

          <div className="table-container">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Funcionários</th>
                  <th>Data de Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td className="company-name">
                      <strong>{company.name}</strong>
                    </td>
                    <td>{company.email}</td>
                    <td>
                      <span className={`status-badge ${company.status}`}>
                        {company.status === "active"
                          ? "Ativo"
                          : company.status === "pending"
                          ? "Pendente"
                          : "Inativo"}
                      </span>
                    </td>
                    <td>{company.employees}</td>
                    <td>{company.createdAt}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() =>
                            (window.location.href = `/company/${company.id}`)
                          }
                        >
                          Ver
                        </button>
                        {company.status === "pending" && (
                          <>
                            <button
                              className="action-btn approve-btn"
                              onClick={() => handleApprove(company.id)}
                            >
                              Aprovar
                            </button>
                            <button
                              className="action-btn reject-btn"
                              onClick={() => handleReject(company.id)}
                            >
                              Rejeitar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {companies.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>Nenhuma empresa cadastrada ainda.</p>
              <button className="create-button">Criar Primeira Empresa</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
