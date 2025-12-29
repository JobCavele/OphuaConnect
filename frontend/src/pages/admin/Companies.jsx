// src/pages/admin/AdminCompanies.jsx
import React, { useState, useEffect } from "react";
import "../../styles/pages/Admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmployee, setNewEmployee] = useState({ fullName: "", email: "", position: "", bio: "", avatarFile: null });
  const [preview, setPreview] = useState(null);

  // ESTADOS DE EDIÇÃO
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({ fullName: "", position: "", bio: "" });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/admin/companies`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return alert("Erro ao carregar empresas");
    const data = await res.json();
    setCompanies(data);
    setLoading(false);
  };

  const fetchEmployees = async (companyId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/admin/companies/${companyId}/employees`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return alert("Erro ao carregar funcionários");
    const data = await res.json();
    setEmployees(data);
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    fetchEmployees(company.id);
  };

  const handleSaveCompany = async (id, field, value) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/admin/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ [field]: value }),
    });
    if (!res.ok) return alert("Erro ao salvar");
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewEmployee({ ...newEmployee, avatarFile: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleCreateEmployee = async () => {
    const { fullName, email, position, bio, avatarFile } = newEmployee;
    if (!fullName || !email) return alert("Nome e email obrigatórios");

    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("fullName", fullName);
    form.append("email", email);
    form.append("position", position);
    form.append("bio", bio);
    form.append("password", "Temp123!");
    if (avatarFile) form.append("avatar", avatarFile);

    const res = await fetch(`${API_URL}/api/auth/register/employee/${selectedCompany.slug}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Erro ao criar funcionário:", errorData);
      return alert("Erro ao criar funcionário: " + (errorData.error || "Desconhecido"));
    }

    setNewEmployee({ fullName: "", email: "", position: "", bio: "", avatarFile: null });
    setPreview(null);
    fetchEmployees(selectedCompany.id);
  };

  // EDITAR FUNCIONÁRIO
  const handleEditRow = (emp) => {
    setEditingId(emp.id);
    setEditRow({ fullName: emp.name, position: emp.position, bio: emp.bio || "" });
  };

  const handleSaveRow = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/admin/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editRow),
    });
    if (!res.ok) return alert("Erro ao salvar");
    const updated = await res.json();
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated.employee } : e)));
    setEditingId(null);
  };

  const handleCancelRow = () => {
    setEditingId(null);
    setEditRow({});
  };

  // APROVAR / REJEITAR – ROTAS SUPER-ADMIN
  const handleApprove = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/admin/employees/${id}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return alert("Erro ao aprovar");
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status: "approved" } : e)));
  };

  const handleReject = async (id) => {
    if (!window.confirm("Rejeitar e excluir funcionário?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/admin/employees/${id}/reject`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return alert("Erro ao rejeitar");
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <nav className="admin-nav">
          <div className="admin-logo"><h1>OphuaConnect Super Admin</h1></div>
          <div className="admin-menu">
            <a href="/admin" className="menu-item">Dashboard</a>
            <a href="/admin/companies" className="menu-item active">Empresas</a>
            <a href="/admin/users" className="menu-item">Usuários</a>
            <a href="/logout" className="menu-item logout">Sair</a>
          </div>
        </nav>
      </header>

      <main className="admin-content">
        {/* LISTA DE EMPRESAS */}
        <div className="companies-section">
          <div className="section-header"><h2>Todas as Empresas</h2></div>
          <div className="table-container">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Funcionários</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} style={{ borderLeft: `4px solid ${c.theme?.primaryColor || "#3B82F6"}` }}>
                    <td className="company-name">
                      <strong>{c.name}</strong>
                      <input
                        type="text"
                        value={c.description || ""}
                        onChange={(e) => handleSaveCompany(c.id, "description", e.target.value)}
                        className="inline-input"
                        placeholder="Descrição"
                      />
                    </td>
                    <td>{c.employeesCount}</td>
                    <td>
                      <select
                        value={c.status}
                        onChange={(e) => handleSaveCompany(c.id, "status", e.target.value)}
                        className="inline-select"
                      >
                        <option value="ACTIVE">Ativa</option>
                        <option value="INACTIVE">Inativa</option>
                        <option value="SUSPENDED">Suspensa</option>
                      </select>
                    </td>
                    <td>{c.createdAt}</td>
                    <td className="action-buttons">
                      <button onClick={() => handleSelectCompany(c)} className="action-btn view-btn">Ver</button>
                      <button onClick={() => setSelectedCompany(c)} className="action-btn add-btn">+ Func</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARD DE NOVO FUNCIONÁRIO */}
        {selectedCompany && (
          <div className="companies-section card-form">
            <div className="section-header">
              <h2>Adicionar funcionário – {selectedCompany.name}</h2>
            </div>
            <div className="form-card">
              <div className="form-group">
                <label>Foto de perfil</label>
                <div className="file-upload-wrapper">
                  <input type="file" id="avatar" accept="image/*" onChange={handleFileChange} className="file-input" />
                  <label htmlFor="avatar" className="file-label">
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">{preview ? "Trocar imagem" : "Escolher imagem"}</span>
                  </label>
                  {preview && (
                    <div className="file-preview">
                      <img src={preview} alt="Preview" className="preview-image" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Nome completo *</label>
                  <input
                    placeholder="Ex: João Silva"
                    value={newEmployee.fullName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="joao@email.com"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Cargo</label>
                  <input
                    placeholder="Ex: Desenvolvedor"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Biografia</label>
                  <textarea
                    placeholder="Fale um pouco sobre você..."
                    rows="3"
                    value={newEmployee.bio}
                    onChange={(e) => setNewEmployee({ ...newEmployee, bio: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button onClick={handleCreateEmployee} className="submit-button">Criar Funcionário</button>
                <button onClick={() => setSelectedCompany(null)} className="cancel-button">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* FUNCIONÁRIOS DA EMPRESA SELECIONADA */}
        {selectedCompany && (
          <div className="companies-section">
            <div className="section-header">
              <h2>Funcionários – {selectedCompany.name}</h2>
            </div>

            <div className="table-container">
              <table className="companies-table">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Cargo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <img
                          src={e.avatarUrl || "https://via.placeholder.com/40"}
                          alt={e.name}
                          className="avatar-small"
                        />
                      </td>

                      {/* MODO EDIÇÃO */}
                      {editingId === e.id ? (
                        <>
                          <td>
                            <input
                              className="inline-input"
                              value={editRow.fullName}
                              onChange={(ev) => setEditRow({ ...editRow, fullName: ev.target.value })}
                            />
                          </td>
                          <td>{e.email}</td>
                          <td>
                            <input
                              className="inline-input"
                              value={editRow.position}
                              onChange={(ev) => setEditRow({ ...editRow, position: ev.target.value })}
                            />
                          </td>
                          <td>
                            <textarea
                              className="inline-textarea"
                              rows="2"
                              value={editRow.bio}
                              onChange={(ev) => setEditRow({ ...editRow, bio: ev.target.value })}
                            />
                          </td>
                          <td>
                            <span className={`status-badge ${e.status}`}>
                              {e.status === "approved" ? "Ativo" : e.status === "pending" ? "Pendente" : "Inativo"}
                            </span>
                          </td>
                          <td className="action-buttons">
                            <button className="action-btn save-btn" onClick={() => handleSaveRow(e.id)}>💾</button>
                            <button className="action-btn cancel-btn" onClick={handleCancelRow}>❌</button>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* MODO LEITURA */}
                          <td className="company-name"><strong>{e.name}</strong></td>
                          <td>{e.email}</td>
                          <td>{e.position || "-"}</td>
                          <td>{e.bio || "-"}</td>
                          <td>
                            <span className={`status-badge ${e.status}`}>
                              {e.status === "approved" ? "Ativo" : e.status === "pending" ? "Pendente" : "Inativo"}
                            </span>
                          </td>
                          <td className="action-buttons">
                            <button className="action-btn edit-btn" onClick={() => handleEditRow(e)}>✏️</button>
                            {e.status === "pending" && (
                              <>
                                <button className="action-btn approve-btn" onClick={() => handleApprove(e.id)}>Aprovar</button>
                                <button className="action-btn reject-btn" onClick={() => handleReject(e.id)}>Rejeitar</button>
                              </>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCompanies;