// src/hooks/useEmployee.js
import { useState, useEffect } from "react";
import { employeeService } from "../services/employee.service";

export const useEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para decodificar token
  const decodeToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      // DEBUG: Verifique o token
      const decoded = decodeToken();
      console.log("🔑 Token decodificado:", decoded);

      const data = await employeeService.getAll();
      console.log("📊 Dados recebidos:", data);

      setEmployees(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("❌ Erro ao buscar funcionários:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const approveEmployee = async (id) => {
    try {
      await employeeService.approve(id);
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? { ...emp, status: "active" } : emp))
      );
    } catch (err) {
      console.error("Erro ao aprovar:", err);
    }
  };

  const rejectEmployee = async (id) => {
    try {
      await employeeService.reject(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      console.error("Erro ao rejeitar:", err);
    }
  };

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    approveEmployee,
    rejectEmployee,
  };
};
