const API_BASE_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

// Função para decodificar token
const decodeToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const employeeService = {
  // Buscar funcionários (adaptado para role)
  async getAll(companyId = null) {
    try {
      const token = getToken();
      const decoded = decodeToken();

      if (!token) throw new Error("Token não encontrado");

      let url = `${API_BASE_URL}/company/employees`;

      // Se for SUPER_ADMIN e não passar companyId, usa a rota de admin
      if (decoded?.role === "SUPER_ADMIN" && !companyId) {
        url = `${API_BASE_URL}/admin/all-employees`;
      }
      // Se for SUPER_ADMIN e passar companyId, usa query
      else if (decoded?.role === "SUPER_ADMIN" && companyId) {
        url = `${API_BASE_URL}/company/employees?companyId=${companyId}`;
      }
      // COMPANY_ADMIN usa rota normal (sem query)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      throw error;
    }
  },

  // Buscar funcionários pendentes (filtra localmente)
  async getPending() {
    try {
      const employees = await this.getAll();
      return employees.filter((emp) => emp.status === "pending") || [];
    } catch (error) {
      console.error("Erro ao buscar pendentes:", error);
      throw error;
    }
  },

  // Aprovar funcionário
  async approve(id) {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/company/employees/${id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao aprovar funcionário:", error);
      throw error;
    }
  },

  // Rejeitar funcionário
  async reject(id) {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/company/employees/${id}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao rejeitar funcionário:", error);
      throw error;
    }
  },

  // Adicionar funcionário manualmente (via convite)
  async invite(employeeData) {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/company/employees/invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao convidar funcionário:", error);
      throw error;
    }
  },

  // Buscar estatísticas
  async getStats() {
    try {
      const employees = await this.getAll();
      const total = employees.length;
      const active = employees.filter((e) => e.status === "active").length;
      const pending = employees.filter((e) => e.status === "pending").length;

      return {
        total,
        active,
        pending,
        change: total > 0 ? `+${Math.round((active / total) * 100)}%` : "+0%",
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      throw error;
    }
  },
};
