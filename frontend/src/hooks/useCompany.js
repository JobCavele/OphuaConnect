// src/hooks/useCompany.js
import { useState, useEffect } from "react";
import { companyService } from "../services/company.service.js";

export const useCompany = (companyId) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (companyId) {
        // Se for um ID numérico
        if (!isNaN(companyId)) {
          data = await companyService.getCompany(companyId);
        } else {
          // Se for um slug
          data = await companyService.getCompanyBySlug(companyId);
        }
      } else {
        // Se não houver companyId, tenta obter do usuário logado
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        if (userData?.company?.id) {
          data = await companyService.getCompany(userData.company.id);
        }
      }

      if (data?.success) {
        setCompany(data.company || data);
      } else {
        throw new Error(data?.error || "Empresa não encontrada");
      }
    } catch (err) {
      setError(err.message);
      console.error("Erro ao buscar empresa:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId !== undefined) {
      fetchCompany();
    }
  }, [companyId]);

  const updateCompany = async (companyData) => {
    try {
      if (!company?.id) throw new Error("ID da empresa não encontrado");

      const response = await companyService.updateCompany(
        company.id,
        companyData
      );

      if (response.success) {
        setCompany((prev) => ({ ...prev, ...companyData }));
        return { success: true, company: response.company };
      } else {
        throw new Error(response.error || "Erro ao atualizar empresa");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const uploadLogo = async (file) => {
    try {
      if (!company?.id) throw new Error("ID da empresa não encontrado");

      const logoUrl = await companyService.uploadLogo(file);

      // Atualiza a empresa com o novo logo
      const response = await companyService.updateCompany(company.id, {
        logo: logoUrl,
      });

      if (response.success) {
        setCompany((prev) => ({ ...prev, logo: logoUrl }));
        return { success: true, logoUrl };
      } else {
        throw new Error("Erro ao salvar logo");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const getEmployees = async () => {
    try {
      if (!company?.id) throw new Error("ID da empresa não encontrado");

      const response = await companyService.getEmployees(company.id);

      if (response.success) {
        return { success: true, employees: response.employees };
      } else {
        throw new Error(response.error || "Erro ao buscar funcionários");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const addEmployee = async (employeeData) => {
    try {
      if (!company?.id) throw new Error("ID da empresa não encontrado");

      const response = await companyService.addEmployee(
        company.id,
        employeeData
      );

      if (response.success) {
        return { success: true, employee: response.employee };
      } else {
        throw new Error(response.error || "Erro ao adicionar funcionário");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    company,
    loading,
    error,
    fetchCompany,
    updateCompany,
    uploadLogo,
    getEmployees,
    addEmployee,
    refetch: fetchCompany,
  };
};
