// src/pages/company/Employees/Employees.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useEmployee } from "../../../hooks/useEmployee";
import "../../../styles/pages/Company.css";

const Employees = () => {
  const { user } = useAuth();
  const {
    employees = [],
    loading,
    error,
    fetchEmployees,
    approveEmployee,
    rejectEmployee,
  } = useEmployee();

  // Estados para a interface
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // all, active, pending

  // Estado para novo funcionário
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    phone: "",
  });

  // Calcular estatísticas
  const stats = {
    total: employees.length,
    active: employees.filter(
      (e) => e.status === "active" || e.status === "APPROVED"
    ).length,
    pending: employees.filter(
      (e) => e.status === "pending" || e.status === "PENDING"
    ).length,
  };

  // Filtrar funcionários baseado no filtro ativo e busca
  const filteredEmployees = employees.filter((employee) => {
    // Filtro por status
    if (activeFilter === "active") {
      if (!(employee.status === "active" || employee.status === "APPROVED"))
        return false;
    } else if (activeFilter === "pending") {
      if (!(employee.status === "pending" || employee.status === "PENDING"))
        return false;
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        employee.name?.toLowerCase().includes(term) ||
        employee.fullName?.toLowerCase().includes(term) ||
        employee.email?.toLowerCase().includes(term) ||
        employee.position?.toLowerCase().includes(term) ||
        employee.department?.toLowerCase().includes(term)
      );
    }

    return true;
  });

  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    if (selectedEmployees.length === 0) return;
    if (window.confirm(`Aprovar ${selectedEmployees.length} funcionário(s)?`)) {
      selectedEmployees.forEach((id) => approveEmployee(id));
      setSelectedEmployees([]);
    }
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    // Simular adição
    alert(
      `Funcionário ${newEmployee.name} adicionado! Um e-mail será enviado para ele.`
    );
    setNewEmployee({
      name: "",
      email: "",
      position: "",
      department: "",
      phone: "",
    });
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <section className="company-dash">
        <div
          className="dash-card"
          style={{ textAlign: "center", padding: "3rem" }}
        >
          <div className="loading-spinner"></div>
          <p>Carregando funcionários...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="company-dash">
        <div
          className="dash-card"
          style={{ textAlign: "center", padding: "3rem" }}
        >
          <div style={{ fontSize: "3rem" }}>⚠️</div>
          <h2>Erro ao carregar</h2>
          <p>{error}</p>
          <button onClick={fetchEmployees} className="btn btn--primary">
            Tentar novamente
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="company-dash">
      {/* Header */}
      <header className="dash-header">
        <div>
          <h1 className="dash-title">👥 Funcionários</h1>
          <p className="dash-subtitle">
            Gerencie os funcionários da {user?.companyName || "sua empresa"}
          </p>
        </div>
        <div>
          <Link to="/company/dashboard" className="btn btn--outline">
            ← Voltar
          </Link>
        </div>
      </header>

      {/* Cards de Estatísticas */}
      <div className="dash-grid">
        <div className="dash-card">
          <div className="card-title">Total</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Funcionários cadastrados</div>
        </div>

        <div className="dash-card">
          <div className="card-title">Ativos</div>
          <div className="stat-value" style={{ color: "#48BB78" }}>
            {stats.active}
          </div>
          <div className="stat-label">Funcionários ativos</div>
        </div>

        <div className="dash-card">
          <div className="card-title">Pendentes</div>
          <div className="stat-value" style={{ color: "#F6AD55" }}>
            {stats.pending}
          </div>
          <div className="stat-label">Aguardando aprovação</div>
        </div>

        <div className="dash-card dash-card--cta">
          <div className="card-title">Ações Rápidas</div>
          <div style={{ marginTop: "1rem" }}>
            <button
              className="btn btn--primary"
              onClick={() => setShowAddForm(true)}
              style={{ width: "100%", marginBottom: "0.75rem" }}
            >
              ➕ Adicionar Funcionário
            </button>
            <Link
              to="/company/links/registration"
              className="btn btn--outline"
              style={{ width: "100%", textAlign: "center" }}
            >
              🔗 Copiar Link de Cadastro
            </Link>
          </div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="action-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar funcionários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            Todos ({stats.total})
          </button>
          <button
            className={`filter-btn ${
              activeFilter === "active" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("active")}
          >
            Ativos ({stats.active})
          </button>
          <button
            className={`filter-btn ${
              activeFilter === "pending" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("pending")}
          >
            Pendentes ({stats.pending})
          </button>
        </div>

        <div className="action-buttons">
          {selectedEmployees.length > 0 && (
            <div className="bulk-actions">
              <span>{selectedEmployees.length} selecionados</span>
              <button className="btn btn-success" onClick={handleBulkApprove}>
                ✅ Aprovar
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setSelectedEmployees([])}
              >
                Limpar
              </button>
            </div>
          )}

          <button
            className="btn btn--outline"
            onClick={() => setShowExportModal(true)}
          >
            📥 Exportar
          </button>
          <button
            className="btn btn--primary"
            onClick={() => setShowAddForm(true)}
          >
            ➕ Adicionar
          </button>
        </div>
      </div>

      {/* Formulário para Adicionar (se visível) */}
      {showAddForm && (
        <div className="dash-card" style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h3 className="card-title">➕ Adicionar Novo Funcionário</h3>
            <button
              className="btn btn--outline"
              onClick={() => setShowAddForm(false)}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAddEmployee}>
            <div className="form-grid">
              <div>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                  required
                  placeholder="João Silva"
                />
              </div>

              <div>
                <label>E-mail *</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  required
                  placeholder="joao@empresa.com"
                />
              </div>

              <div>
                <label>Cargo *</label>
                <input
                  type="text"
                  value={newEmployee.position}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, position: e.target.value })
                  }
                  required
                  placeholder="Desenvolvedor"
                />
              </div>

              <div>
                <label>Departamento</label>
                <input
                  type="text"
                  value={newEmployee.department}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      department: e.target.value,
                    })
                  }
                  placeholder="Tecnologia"
                />
              </div>

              <div>
                <label>Telefone</label>
                <input
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, phone: e.target.value })
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
                marginTop: "1.5rem",
              }}
            >
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary">
                Enviar Convite
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Funcionários */}
      <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h3 style={{ margin: 0 }}>
            {activeFilter === "all"
              ? "Todos os Funcionários"
              : activeFilter === "active"
              ? "Funcionários Ativos"
              : "Aprovações Pendentes"}
            ({filteredEmployees.length})
          </h3>
        </div>

        {filteredEmployees.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div
              style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}
            >
              👥
            </div>
            <h3>Nenhum funcionário encontrado</h3>
            <p
              style={{
                color: "var(--color-text-light)",
                marginBottom: "1.5rem",
              }}
            >
              {searchTerm
                ? "Tente outra busca"
                : "Adicione funcionários para começar"}
            </p>
            <button
              className="btn btn--primary"
              onClick={() => setShowAddForm(true)}
            >
              ➕ Adicionar Funcionário
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="employees-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>
                    <input
                      type="checkbox"
                      checked={
                        selectedEmployees.length === filteredEmployees.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Funcionário</th>
                  <th>Cargo</th>
                  <th>Departamento</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleSelectEmployee(employee.id)}
                      />
                    </td>
                    <td>
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {(employee.name || employee.fullName || "?").charAt(
                            0
                          )}
                        </div>
                        <div>
                          <div className="employee-name">
                            {employee.name || employee.fullName}
                          </div>
                          <div className="employee-email">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{employee.position || "—"}</td>
                    <td>{employee.department || "—"}</td>
                    <td>
                      {employee.createdAt
                        ? new Date(employee.createdAt).toLocaleDateString(
                            "pt-BR"
                          )
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          employee.status === "active" ||
                          employee.status === "APPROVED"
                            ? "active"
                            : "pending"
                        }`}
                      >
                        {employee.status === "active" ||
                        employee.status === "APPROVED"
                          ? "Ativo"
                          : "Pendente"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-small">
                        {(employee.status === "pending" ||
                          employee.status === "PENDING") && (
                          <>
                            <button
                              className="btn-success"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Aprovar ${
                                      employee.name || employee.fullName
                                    }?`
                                  )
                                ) {
                                  approveEmployee(employee.id);
                                }
                              }}
                            >
                              ✅
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Rejeitar ${
                                      employee.name || employee.fullName
                                    }?`
                                  )
                                ) {
                                  rejectEmployee(employee.id);
                                }
                              }}
                            >
                              ❌
                            </button>
                          </>
                        )}
                        <button className="btn-outline">👁️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seção de Informações */}
      <div className="dash-card" style={{ marginTop: "2rem" }}>
        <h3 className="card-title">📋 Como adicionar funcionários</h3>
        <div className="instructions-grid">
          <div>
            <h4>1. Compartilhe o link</h4>
            <p>
              Vá para Dashboard e copie o link de cadastro para enviar aos
              funcionários.
            </p>
          </div>
          <div>
            <h4>2. Adicione manualmente</h4>
            <p>
              Use o botão "Adicionar Funcionário" acima para enviar convites por
              e-mail.
            </p>
          </div>
          <div>
            <h4>3. Aprovação</h4>
            <p>
              Os funcionários aparecerão aqui como "Pendentes" até você aprovar.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Exportação (simplificado) */}
      {showExportModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowExportModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📥 Exportar Dados</h3>
            <p>Exportar {filteredEmployees.length} funcionários</p>

            <div className="export-options">
              <button className="export-option">
                <div>📄</div>
                <div>CSV</div>
              </button>
              <button className="export-option">
                <div>📊</div>
                <div>Excel</div>
              </button>
              <button className="export-option">
                <div>📑</div>
                <div>PDF</div>
              </button>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button
                className="btn btn--outline"
                onClick={() => setShowExportModal(false)}
              >
                Cancelar
              </button>
              <button className="btn btn--primary">Exportar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Employees;
