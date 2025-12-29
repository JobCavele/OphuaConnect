// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/public/Home";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCompanies from "./pages/admin/Companies"; // <<< NOVO

import CompanyDashboard from "./pages/company/Dashboard";
import CompanyProfileEdit from "./pages/company/profile/Edit";
import CompanyEmployeesList from "./pages/company/Employees/List";

import PersonalDashboard from "./pages/personal/Dashboard";
import PersonalProfile from "./pages/public/PersonalProfile";
import CompanyProfile from "./pages/public/CompanyProfile";

import "./styles/global.css";
import "./styles/pages/Login.css";
import "./styles/pages/Register.css";
import "./styles/pages/Company.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/employee/:companySlug" element={<Register />} />
          <Route path="/company/:slug" element={<CompanyProfile />} />
          <Route path="/personal/:username" element={<PersonalProfile />} />

          {/* Dashboard Geral */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Admin / Super-Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><AdminCompanies /></ProtectedRoute>} />

          {/* Empresa */}
          <Route path="/company/dashboard" element={<ProtectedRoute allowedRoles={["COMPANY_ADMIN"]}><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/company/edit" element={<ProtectedRoute allowedRoles={["COMPANY_ADMIN"]}><CompanyProfileEdit /></ProtectedRoute>} />
          <Route path="/company/employees" element={<ProtectedRoute allowedRoles={["COMPANY_ADMIN"]}><CompanyEmployeesList /></ProtectedRoute>} />
          <Route path="/company/employees/pending" element={<ProtectedRoute allowedRoles={["COMPANY_ADMIN"]}><div style={{ padding: "var(--space-6)" }}><h1>Aprovações Pendentes</h1><p>Página em construção</p></div></ProtectedRoute>} />

          {/* Pessoal */}
          <Route path="/personal/dashboard" element={<ProtectedRoute><PersonalDashboard /></ProtectedRoute>} />

          {/* Redirecionamentos */}
          <Route path="/company" element={<Navigate to="/company/dashboard" replace />} />
          <Route path="/personal" element={<Navigate to="/personal/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<div className="not-found"><h1>404</h1><p>Página não encontrada</p><a href="/" className="home-link">Voltar para Home</a></div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;