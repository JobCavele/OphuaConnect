import { apiRequest } from "./api.js";

export const authService = {
  async login(credentials) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  async registerPersonal(userData) {
    return apiRequest("/auth/register/personal", {
      method: "POST",
      body: userData,
    });
  },

  async registerCompany(companyData) {
    return apiRequest("/auth/register/company", {
      method: "POST",
      body: companyData,
    });
  },

  async registerEmployee(employeeData, companySlug) {
    return apiRequest(`/auth/register/employee/${companySlug}`, {
      method: "POST",
      body: employeeData,
    });
  },

  async verifyToken() {
    return apiRequest("/auth/verify");
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  saveToken(token) {
    localStorage.setItem("token", token);
  },

  saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem("token");
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
