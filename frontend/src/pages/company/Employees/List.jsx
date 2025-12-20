import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useEmployee } from "../../../hooks/useEmployee.js";
import "../../../styles/pages/Company.css";

const EmployeesList = () => {
  const { employees, loading, error, approveEmployee, removeEmployee } =
    useEmployee();
  const [filter, setFilter] = useState("all");

  const filteredEmployees = employees.filter((employee) => {
    if (filter === "all") return true;
    return employee.status === filter;
  });

  const handleApprove = async (employeeId) => {
    const result = await approveEmployee(employeeId);
    if (result.success) {
      alert(`Funcionário ${employeeId} aprovado!`);
    }
  };

  const handleReject = async (employeeId) => {
    if (window.confirm("Tem certeza que deseja rejeitar este funcionário?")) {
      const result = await removeEmployee(employeeId);
      if (result.success) {
        alert(`Funcionário ${employeeId} rejeitado.`);
      }
    }
  };

  const getStatusText = (status) => {
    return status === "active" ? "Ativo" : "Pendente";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando funcionários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Erro: {error}</p>
        <button onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <div>
          <h1>Funcionários</h1>
          <p>Gerencie os funcionários da sua empresa</p>
        </div>

        <div className="header-actions">
          <Link to="/company/dashboard" className="btn btn-outline">
            ← Voltar
          </Link>
          <Link to="/company/employees/add" className="btn btn-primary">
            + Adicionar Funcionário
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <h3>Total de Funcionários</h3>
          <div className="stats-number">{employees.length}</div>
        </div>

        <div className="stats-card">
          <h3>Funcionários Ativos</h3>
          <div className="stats-number success">
            {employees.filter((e) => e.status === "active").length}
          </div>
        </div>

        <div className="stats-card">
          <h3>Aprovações Pendentes</h3>
          <div className="stats-number warning">
            {employees.filter((e) => e.status === "pending").length}
          </div>
        </div>
      </div>

      <div className="employees-content">
        <div className="content-header">
          <h3>Lista de Funcionários</h3>

          <div className="filter-buttons">
            <span>Filtrar:</span>
            <div>
              {["all", "active", "pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`filter-button ${
                    filter === status ? "active" : ""
                  }`}
                >
                  {status === "all"
                    ? "Todos"
                    : status === "active"
                    ? "Ativos"
                    : "Pendentes"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Cargo</th>
                <th>Departamento</th>
                <th>Data de Entrada</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-info">
                      <div className="employee-avatar">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <div className="employee-name">{employee.name}</div>
                        <div className="employee-email">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{employee.position}</td>
                  <td>{employee.department}</td>
                  <td>{employee.joinDate}</td>
                  <td>
                    <span className={`status-badge ${employee.status}`}>
                      {getStatusText(employee.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/company/employees/${employee.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        Ver
                      </Link>

                      {employee.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(employee.id)}
                            className="btn btn-success btn-sm"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleReject(employee.id)}
                            className="btn btn-danger btn-sm"
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

        {filteredEmployees.length === 0 && (
          <div className="empty-state">
            <div>👥</div>
            <h3>
              {filter === "pending"
                ? "Nenhuma aprovação pendente"
                : "Nenhum funcionário encontrado"}
            </h3>
            <p>
              {filter === "pending"
                ? "Todos os funcionários estão aprovados!"
                : "Adicione funcionários para começar."}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="btn btn-primary"
              >
                Ver Todos os Funcionários
              </button>
            )}
          </div>
        )}
      </div>

      <div className="instructions">
        <h3>📋 Como adicionar funcionários</h3>
        <div className="instructions-grid">
          <div>
            <h4>1. Compartilhe o link</h4>
            <p>
              Vá para Dashboard e copie o link de cadastro para enviar aos
              funcionários.
            </p>
          </div>
          <div>
            <h4>2. Aprovação</h4>
            <p>
              Os funcionários aparecerão aqui como "Pendentes" até você aprovar.
            </p>
          </div>
          <div>
            <h4>3. Gerenciamento</h4>
            <p>
              Após aprovados, os funcionários terão acesso ao perfil da empresa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesList;
