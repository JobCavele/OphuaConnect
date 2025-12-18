import api from './api';

export const companiesService = {
  // Listar empresas (público)
  async getAll() {
    return api.get('/api/companies');
  },

  // Obter empresa por slug (público)
  async getBySlug(slug) {
    return api.get(`/api/companies/${slug}`);
  },

  // Criar empresa (autenticado)
  async create(companyData) {
    return api.post('/api/companies', companyData);
  },

  // Atualizar empresa
  async update(id, companyData) {
    return api.put(`/api/companies/${id}`, companyData);
  },

  // Excluir empresa
  async delete(id) {
    return api.delete(`/api/companies/${id}`);
  },

  // Obter funcionários da empresa
  async getEmployees(companyId) {
    return api.get(`/api/companies/${companyId}/employees`);
  },

  // Aprovar funcionário
  async approveEmployee(employeeId) {
    return api.put(`/api/employees/${employeeId}/approve`);
  },

  // Criar convite
  async createInvitation(companyId, invitationData) {
    return api.post(`/api/companies/${companyId}/invite`, invitationData);
  },

  // Listar convites
  async getInvitations(companyId) {
    return api.get(`/api/companies/${companyId}/invitations`);
  }
};