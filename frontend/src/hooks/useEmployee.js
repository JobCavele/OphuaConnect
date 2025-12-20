// src/hooks/useEmployee.js
import { useState, useEffect } from "react";
import { companyService } from "../services/company.service.js";

export const useEmployee = (companyId, employeeId) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!companyId || !employeeId) {
        throw new Error("ID da empresa ou funcionário não fornecido");
      }

      // Primeiro busca os funcionários da empresa
      const response = await companyService.getEmployees(companyId);

      if (response.success) {
        const foundEmployee = response.employees?.find(
          (emp) => emp.id === parseInt(employeeId) || emp.id === employeeId
        );

        if (foundEmployee) {
          setEmployee(foundEmployee);
        } else {
          throw new Error("Funcionário não encontrado");
        }
      } else {
        throw new Error(response.error || "Erro ao buscar funcionários");
      }
    } catch (err) {
      setError(err.message);
      console.error("Erro ao buscar funcionário:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId && employeeId) {
      fetchEmployee();
    }
  }, [companyId, employeeId]);

  const updateEmployee = async (employeeData) => {
    try {
      if (!companyId || !employeeId) {
        throw new Error("ID da empresa ou funcionário não fornecido");
      }

      // Nota: Aqui você precisaria de um serviço específico para atualizar funcionários
      // Por enquanto, vamos simular
      const response = {
        success: true,
        employee: { ...employee, ...employeeData },
      };

      if (response.success) {
        setEmployee(response.employee);
        return { success: true, employee: response.employee };
      } else {
        throw new Error(response.error || "Erro ao atualizar funcionário");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const removeEmployee = async () => {
    try {
      if (!companyId || !employeeId) {
        throw new Error("ID da empresa ou funcionário não fornecido");
      }

      const response = await companyService.removeEmployee(
        companyId,
        employeeId
      );

      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.error || "Erro ao remover funcionário");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const approveEmployee = async () => {
    try {
      if (!companyId || !employeeId) {
        throw new Error("ID da empresa ou funcionário não fornecido");
      }

      // Atualiza o status do funcionário para aprovado
      const response = await updateEmployee({ status: "approved" });

      if (response.success) {
        return { success: true, employee: response.employee };
      } else {
        throw new Error("Erro ao aprovar funcionário");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const rejectEmployee = async (reason) => {
    try {
      if (!companyId || !employeeId) {
        throw new Error("ID da empresa ou funcionário não fornecido");
      }

      // Remove o funcionário
      const response = await removeEmployee();

      if (response.success) {
        return { success: true, reason };
      } else {
        throw new Error("Erro ao rejeitar funcionário");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    employee,
    loading,
    error,
    fetchEmployee,
    updateEmployee,
    removeEmployee,
    approveEmployee,
    rejectEmployee,
    refetch: fetchEmployee,
  };
};
