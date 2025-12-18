import api from './api';

export const authService = {
  // Login
  async login(email, password) {
    return api.post('/api/auth/login', { email, password });
  },

  // Registro
  async register(userData) {
    return api.post('/api/auth/register', userData);
  },

  // Criar super admin (apenas uma vez)
  async createSuperAdmin(data) {
    return api.post('/api/admin/super-admin', data);
  },

  // Obter perfil do usuário atual
  async getProfile() {
    return api.get('/api/auth/profile');
  },

  // Verificar status da API
  async checkHealth() {
    return api.get('/health');
  },

  // Obter informações da API
  async getApiInfo() {
    return api.get('/');
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obter dados do usuário atual
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Fazer logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Salvar dados de autenticação
  saveAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};