// src/services/auth.service.js
import { apiRequest } from "./api.js";

export const authService = {
  async login(credentials) {
    console.log("🔐 Login service called with:", credentials);
    
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: credentials,
    });
    
    console.log("🔐 Login service response:", response);
    
    // Se apiRequest já retornou um objeto com success: false, retorne-o
    if (response.success === false) {
      return response;
    }
    
    // Se chegou aqui, a requisição foi bem-sucedida
    return response;
  },

  async registerPersonal(userData) {
    const response = await apiRequest("/auth/register/personal", {
      method: "POST",
      body: userData,
    });
    
    if (response.success === false) {
      return response;
    }
    
    return response;
  },

  async registerCompany(companyData) {
    const response = await apiRequest("/auth/register/company", {
      method: "POST",
      body: companyData,
    });
    
    if (response.success === false) {
      return response;
    }
    
    return response;
  },

  async registerEmployee(employeeData, companySlug) {
    const response = await apiRequest(`/auth/register/employee/${companySlug}`, {
      method: "POST",
      body: employeeData,
    });
    
    if (response.success === false) {
      return response;
    }
    
    return response;
  },

  async verifyToken() {
    const response = await apiRequest("/auth/verify");
    
    if (response.success === false) {
      this.logout();
      return response;
    }
    
    return response;
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