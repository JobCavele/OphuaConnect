// src/hooks/useCompanySlug.js
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export const useCompanySlug = () => {
  const { companySlug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Se não tem slug na URL, tenta pegar do usuário
  const slug = companySlug || user?.company?.slug || user?.company?.id;

  // Se é COMPANY_ADMIN sem slug na URL, redireciona para sua empresa
  React.useEffect(() => {
    if (user?.role === "COMPANY_ADMIN" && !companySlug && user?.company) {
      const userSlug = user.company.slug || user.company.id;
      if (userSlug) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes(userSlug)) {
          const newPath = currentPath.replace(
            "/company/",
            `/company/${userSlug}/`
          );
          navigate(newPath);
        }
      }
    }
  }, [user, companySlug, navigate]);

  return {
    slug,
    company: user?.company,
    isCompanyAdmin: user?.role === "COMPANY_ADMIN",
    userRole: user?.role,
  };
};
