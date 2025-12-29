import { apiRequest } from "./api.js";

export const adminService = {
  async getStats() {
    return apiRequest("/admin/stats");
  },

  async getCompanies(page = 1, limit = 10, status = null) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (status) params.append('status', status);
    
    return apiRequest(`/admin/companies?${params.toString()}`);
  },

  async updateCompanyStatus(companyId, status, reason = null) {
    return apiRequest(`/admin/companies/${companyId}/status`, {
      method: "PUT",
      body: { status, reason }
    });
  },

  async getUser(userId) {
    return apiRequest(`/admin/user/${userId}`);
  },

  async getRecentActivity(limit = 10) {
    // Esta rota precisaria ser criada no backend
    return apiRequest(`/admin/activity?limit=${limit}`);
  }
};