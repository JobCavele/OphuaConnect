// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Função principal para requisições
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};

// Função para upload de arquivos (se precisar)
export const uploadFile = async (endpoint, file, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const formData = new FormData();
  formData.append("file", file);

  const config = {
    method: "POST",
    body: formData,
    headers: {
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Upload Error:", error.message);
    throw error;
  }
};

// Exportação única se quiser usar assim:
export default {
  apiRequest,
  uploadFile
};