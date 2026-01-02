// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

// Função base
export const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Funções específicas para empresa
export const companyAPI = {
  getProfile: () => fetchAPI("/api/company/profile"),
  getDashboard: (slug) => fetchAPI(`/api/company/${slug}/dashboard`),
  getEmployees: () => fetchAPI("/api/company/employees"),
  updateTheme: (data) =>
    fetchAPI("/api/company/update-theme", { method: "PUT", body: data }),
};

// Funções de autenticação
export const authAPI = {
  login: (data) => fetchAPI("/api/auth/login", { method: "POST", body: data }),
  registerCompany: (data) =>
    fetchAPI("/api/auth/register/company", { method: "POST", body: data }),
};

// Upload
export const uploadFile = async (file) => {
  const url = `${API_BASE_URL}/api/company/upload-logo`;
  const token = getToken();
  const formData = new FormData();
  formData.append("logo", file);

  const response = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) throw new Error("Upload failed");
  return response.json();
};

export default { fetchAPI, companyAPI, authAPI, uploadFile };
