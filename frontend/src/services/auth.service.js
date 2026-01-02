// src/services/auth.service.js
import { fetchAPI } from "./api.js"; // ← MUDAR ISSO

export const authService = {
  async login(credentials) {
    console.log("🔐 Login service called with:", credentials);

    // Use fetchAPI em vez de apiRequest
    const response = await fetchAPI("/api/auth/login", {
      // ← ADICIONE /api
      method: "POST",
      body: credentials,
    });

    console.log("🔐 Login service response:", response);
    return response;
  },

  async registerPersonal(userData) {
    return fetchAPI("/api/auth/register/personal", {
      // ← ADICIONE /api
      method: "POST",
      body: userData,
    });
  },

  async registerCompany(companyData) {
    return fetchAPI("/api/auth/register/company", {
      // ← ADICIONE /api
      method: "POST",
      body: companyData,
    });
  },

  async registerEmployee(employeeData, companySlug) {
    return fetchAPI(`/api/auth/register/employee/${companySlug}`, {
      // ← ADICIONE /api
      method: "POST",
      body: employeeData,
    });
  },

  async verifyToken() {
    return fetchAPI("/api/auth/verify"); // ← ADICIONE /api
  },

  // ... resto do código permanece igual
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
