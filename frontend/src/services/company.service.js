// src/services/company.service.js
import { apiRequest, uploadFile } from "./api.js"; // Agora uploadFile existe

export const companyService = {
  // Métodos normais usando apiRequest
  async getCompanyProfile() {
    return apiRequest("/company/profile");
  },

  async updateCompanyProfile(profileData) {
    return apiRequest("/company/profile", {
      method: "PUT",
      body: profileData,
    });
  },

  async uploadLogo(file) {
    return uploadFile("/company/upload-logo", file);
  },

  async getEmployees() {
    return apiRequest("/company/employees");
  },

  async inviteEmployee(email) {
    return apiRequest("/company/employees/invite", {
      method: "POST",
      body: { email },
    });
  },

  async getAnalytics() {
    return apiRequest("/company/analytics");
  },

  async updateTheme(themeData) {
    return apiRequest("/company/theme", {
      method: "PUT",
      body: themeData,
    });
  },

  async getRegistrationLink() {
    return apiRequest("/company/registration-link");
  },

  async generateQRCode() {
    return apiRequest("/company/qr-code");
  },
};