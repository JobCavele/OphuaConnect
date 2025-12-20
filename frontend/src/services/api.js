const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erro no upload");
    }

    const data = await response.json();
    return data.fileUrl;
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("token");

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    let body = options.body;
    let headers = { ...defaultHeaders };

    if (body instanceof FormData) {
      delete headers["Content-Type"];
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      body: body instanceof FormData ? body : JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro na requisição");
    }

    return data;
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, error);
    throw error;
  }
};

const api = {
  uploadFile,
  apiRequest,
};

export default api;
