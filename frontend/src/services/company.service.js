import { apiRequest, uploadFile } from "./api.js";

export const companyService = {
  async getCompanies() {
    return apiRequest("/companies");
  },

  async getCompany(id) {
    return apiRequest(`/companies/${id}`);
  },

  async getCompanyBySlug(slug) {
    return apiRequest(`/companies/slug/${slug}`);
  },

  async updateCompany(id, data) {
    return apiRequest(`/companies/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async uploadLogo(file) {
    return uploadFile(file);
  },

  async getEmployees(companyId) {
    return apiRequest(`/companies/${companyId}/employees`);
  },

  async addEmployee(companyId, employeeData) {
    return apiRequest(`/companies/${companyId}/employees`, {
      method: "POST",
      body: employeeData,
    });
  },

  async removeEmployee(companyId, employeeId) {
    return apiRequest(`/companies/${companyId}/employees/${employeeId}`, {
      method: "DELETE",
    });
  },

  async getRegistrationLink(companyId) {
    return apiRequest(`/companies/${companyId}/registration-link`);
  },

  async generateRegistrationLink(companyId) {
    return apiRequest(`/companies/${companyId}/registration-link/generate`, {
      method: "POST",
    });
  },
};

export default companyService;
