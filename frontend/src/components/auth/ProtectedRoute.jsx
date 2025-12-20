// src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // CORREÇÃO: Importe do hooks/

const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se tem role específico requerido
  if (requiredRole && user?.role !== requiredRole) {
    // Redireciona baseado no role do usuário
    switch (user?.role) {
      case "SUPER_ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "COMPANY_ADMIN":
        return <Navigate to="/company/dashboard" replace />;
      case "EMPLOYEE":
        return <Navigate to="/personal/dashboard" replace />;
      case "PERSONAL":
        return <Navigate to="/personal/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // Verifica se tem algum dos roles permitidos
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redireciona baseado no role do usuário
    switch (user?.role) {
      case "SUPER_ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "COMPANY_ADMIN":
        return <Navigate to="/company/dashboard" replace />;
      case "EMPLOYEE":
        return <Navigate to="/personal/dashboard" replace />;
      case "PERSONAL":
        return <Navigate to="/personal/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
