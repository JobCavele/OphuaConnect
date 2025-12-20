// src/pages/Dashboard.jsx
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Redireciona baseado no tipo de usuário
    switch (user.role) {
      case "SUPER_ADMIN":
        navigate("/admin");
        break;
      case "COMPANY_ADMIN":
        navigate("/company");
        break;
      case "EMPLOYEE":
      case "PERSONAL":
        navigate("/personal");
        break;
      default:
        navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default Dashboard;
