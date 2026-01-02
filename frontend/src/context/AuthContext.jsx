import { createContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service.js";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = authService.getCurrentUser();
        const token = authService.getToken();

        if (savedUser && token) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);

      if (response.success) {
        authService.saveToken(response.token);
        authService.saveUser(response.user);
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.error || "Login falhou");
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const registerPersonal = async (userData) => {
    try {
      setError(null);
      const response = await authService.registerPersonal(userData);

      if (response.success) {
        authService.saveToken(response.token);
        authService.saveUser(response.user);
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.error || "Registro falhou");
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const registerCompany = async (companyData) => {
    try {
      setError(null);
      const response = await authService.registerCompany(companyData);

      if (response.success) {
        authService.saveToken(response.token);
        authService.saveUser(response.user);
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.error || "Registro falhou");
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  const getUserRole = () => {
    return user?.role;
  };

  const isSuperAdmin = () => {
    return user?.role === "SUPER_ADMIN";
  };

  const isCompanyAdmin = () => {
    return user?.role === "COMPANY_ADMIN";
  };

  const isPersonal = () => {
    return user?.role === "PERSONAL";
  };

  const isEmployee = () => {
    return user?.role === "EMPLOYEE";
  };
  const updateUser = (updatedData) => {
    try {
      const currentUser = authService.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        ...updatedData,
      };

      authService.saveUser(updatedUser);
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    registerPersonal,
    registerCompany,
    logout,
    isAuthenticated,
    getUserRole,
    isSuperAdmin,
    isCompanyAdmin,
    isPersonal,
    isEmployee,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
