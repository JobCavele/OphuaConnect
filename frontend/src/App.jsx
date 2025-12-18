import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import About from "./pages/About";
import PersonalDashboard from "./pages/personal/Dashboard";
import EditProfile from "./pages/personal/EditProfile";
import CompanyDashboard from "./pages/company/Dashboard";
import CompanyEmployees from "./pages/company/Employees";
import CompanyInvites from "./pages/company/Invites";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCompanies from "./pages/admin/Companies";
import NotFound from "./components/common/NotFound";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />

          {/* Rotas protegidas - Temporariamente acessíveis a todos */}
          <Route path="/personal/dashboard" element={<PersonalDashboard />} />
          <Route path="/personal/profile" element={<EditProfile />} />
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/employees" element={<CompanyEmployees />} />
          <Route path="/company/invites" element={<CompanyInvites />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
