// src/hooks/useSuperAdmin.js
import { useState, useEffect } from "react";
import { employeeService } from "../services/employee.service";

export const useSuperAdmin = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setAllEmployees(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Erro ao buscar todos funcionários:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  return {
    allEmployees,
    loading,
    error,
    fetchAllEmployees,
  };
};
