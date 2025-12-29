import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ connected: false, loading: true });

  // Verificar conexão com API ao iniciar
  useEffect(() => {
    checkApiConnection();
    loadStoredUser();
  }, []);

  const checkApiConnection = async () => {
    try {
      const result = await authService.testConnection();
      setApiStatus({
        connected: result.connected,
        loading: false,
        data: result.data
      });
    } catch (error) {
      setApiStatus({
        connected: false,
        loading: false,
        error: error.message
      });
    }
  };

  const loadStoredUser = () => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  };

  // Login com backend real
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        // Salvar dados
        authService.saveAuthData(token, userData);
        setUser(userData);
        
        return { success: true, user: userData };
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Registro com backend real
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        // Salvar dados
        authService.saveAuthData(token, userData);
        setUser(userData);
        
        return { success: true, user: userData };
      }
    } catch (err) {
      setError(err.message || 'Erro ao criar conta');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  // Atualizar usuário
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Limpar erro
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        apiStatus,
        login,
        register,
        logout,
        updateUser,
        clearError,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'SUPER_ADMIN',
        isCompanyAdmin: user?.role === 'COMPANY_ADMIN',
        isPersonal: user?.role === 'PERSONAL',
        isEmployee: user?.role === 'EMPLOYEE'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};