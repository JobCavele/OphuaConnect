// src/components/auth/RoleBasedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loading from "../common/Loading";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redireciona baseado no role
    switch (user.role) {
      case "SUPER_ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "COMPANY_ADMIN":
        return <Navigate to="/company/dashboard" replace />;
      case "EMPLOYEE":
      case "PERSONAL":
        return <Navigate to="/personal/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default RoleBasedRoute;
