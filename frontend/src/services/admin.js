import api from './api';

export const adminService = {
  // Listar todas empresas (super admin)
  async getAllCompanies() {
    return api.get('/api/admin/companies');
  },

  // Verificar empresa
  async verifyCompany(companyId) {
    return api.put(`/api/admin/companies/${companyId}/verify`);
  },

  // Listar todos usuários
  async getAllUsers() {
    return api.get('/api/admin/users');
  },

  // Ativar/desativar usuário
  async toggleUserStatus(userId, isActive) {
    return api.put(`/api/admin/users/${userId}/status`, { isActive });
  }
};