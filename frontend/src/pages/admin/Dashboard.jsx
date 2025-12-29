import React, { useState, useEffect } from "react";
import "../../styles/pages/Admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingApprovals: 0,
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------- BUSCA DADOS REAIS ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Sem token");

        const [dashRes, empRes] = await Promise.all([
          fetch(`${API_URL}/api/company/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/company/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!dashRes.ok || !empRes.ok) throw new Error("Erro ao carregar dados");

        const dash = await dashRes.json();
        const emp = await empRes.json();

        setStats(dash);
        setEmployees(emp);
      } catch (err) {
        console.error("AdminDashboard →", err);
        alert("Não foi possível carregar os dados do painel.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------- AÇÕES ----------
  const handleApprove = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/company/employees/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao aprovar");
      alert("Funcionário aprovado!");
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "approved" } : e))
      );
    } catch (err) {
      alert("Falha ao aprovar");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Tem certeza que deseja rejeitar este funcionário?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/company/employees/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao rejeitar");
      alert("Funcionário rejeitado");
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert("Falha ao rejeitar");
    }
  };

  // ---------- LOADING ----------
  if (loading)
    return (
      <div className="admin-page">
        <div className="admin-content">
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );

  // ---------- RENDER ----------
  return (
    <div className="admin-page">
      <header className="admin-header">
        <nav className="admin-nav">
          <div className="admin-logo">
            <h1>OphuaConnect Admin</h1>
          </div>
          <div className="admin-menu">
            <a href="/admin" className="menu-item active">Dashboard</a>
            <a href="/admin/companies" className="menu-item">Empresas</a>
            <a href="/admin/users" className="menu-item">Usuários</a>
            <a href="/admin/settings" className="menu-item">Configurações</a>
            <a href="/logout" className="menu-item logout">Sair</a>
          </div>
        </nav>
      </header>

      <main className="admin-content">
        {/* ---------- STATS ---------- */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon companies-icon"><span>👥</span></div>
            <div className="stat-info">
              <h3>Total de Funcionários</h3>
              <div className="stat-number">{stats.totalEmployees}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active-icon"><span>✅</span></div>
            <div className="stat-info">
              <h3>Ativos</h3>
              <div className="stat-number">{stats.activeEmployees}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending-icon"><span>⏳</span></div>
            <div className="stat-info">
              <h3>Pendentes</h3>
              <div className="stat-number">{stats.pendingApprovals}</div>
            </div>
          </div>
        </div>

        {/* ---------- TABELA ---------- */}
        <div className="companies-section">
          <div className="section-header">
            <h2>Funcionários</h2>
          </div>

          <div className="table-container">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Cargo</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td className="company-name"><strong>{e.name}</strong></td>
                    <td>{e.email}</td>
                    <td>{e.position}</td>
                    <td>
                      <span className={`status-badge ${e.status}`}>
                        {e.status === "approved" ? "Ativo" : e.status === "pending" ? "Pendente" : "Inativo"}
                      </span>
                    </td>
                    <td>{e.createdAt}</td>
                    <td>
                      <div className="action-buttons">
                        {e.status === "pending" && (
                          <>
                            <button className="action-btn approve-btn" onClick={() => handleApprove(e.id)}>Aprovar</button>
                            <button className="action-btn reject-btn" onClick={() => handleReject(e.id)}>Rejeitar</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {employees.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>Nenhum funcionário cadastrado ainda.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;