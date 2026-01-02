// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext"; // ← IMPORTAÇÃO CORRETA
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Páginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/public/Home";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCompanies from "./pages/admin/Companies";
import CompanyDashboard from "./pages/company/Dashboard";
import CompanyProfileEdit from "./pages/company/profile/Edit";
import Employees from "./pages/company/Employees/Employees";
import PersonalDashboard from "./pages/personal/Dashboard";
import PersonalProfile from "./pages/public/PersonalProfile";
import CompanyProfile from "./pages/public/CompanyProfile";
import EmployeePublicProfile from "./pages/public/EployeePublicProfile";
import EmployeeDashboard from "./pages/company/Employees/Dashboard";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/register/employee/:companySlug"
              element={<Register />}
            />
            <Route path="/company/:slug" element={<CompanyProfile />} />
            <Route path="/personal/:username" element={<PersonalProfile />} />
            <Route
              path="/company/:companySlug/employee/:employeeId"
              element={<EmployeePublicProfile />}
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <AdminCompanies />
                </ProtectedRoute>
              }
            />

            {/* Empresa */}
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute allowedRoles={["COMPANY_ADMIN"]}>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/edit"
              element={
                <ProtectedRoute allowedRoles={["COMPANY_ADMIN"]}>
                  <CompanyProfileEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/employees"
              element={
                <ProtectedRoute allowedRoles={["COMPANY_ADMIN"]}>
                  <Employees />
                </ProtectedRoute>
              }
            />

            {/* Funcionário */}
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            {/* Pessoal */}
            <Route
              path="/personal/dashboard"
              element={
                <ProtectedRoute allowedRoles={["PERSONAL"]}>
                  <PersonalDashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirecionamentos */}
            <Route
              path="/company"
              element={<Navigate to="/company/dashboard" replace />}
            />
            <Route
              path="/personal"
              element={<Navigate to="/personal/dashboard" replace />}
            />
            <Route
              path="/employee"
              element={<Navigate to="/employee/dashboard" replace />}
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
