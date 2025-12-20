const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          error: "Token de autenticação necessário",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id, isActive: true },
        include: {
          personalProfile: true,
          companyAdmin: { include: { company: true } },
          employeeProfile: { include: { company: true } },
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Usuário não encontrado ou inativo",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          error: "Token inválido",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Token expirado",
        });
      }

      console.error("Auth middleware error:", error);
      res.status(500).json({
        success: false,
        error: "Erro na autenticação",
      });
    }
  }

  static authorize(...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: "Acesso não autorizado para este recurso",
        });
      }
      next();
    };
  }

  static async isCompanyAdmin(req, res, next) {
    try {
      const companyId = req.params.companyId || req.body.companyId;

      if (!companyId) {
        return next();
      }

      const isAdmin = await prisma.companyAdmin.findFirst({
        where: {
          userId: req.user.id,
          companyId: companyId,
        },
      });

      if (!isAdmin && req.user.role !== "SUPER_ADMIN") {
        return res.status(403).json({
          success: false,
          error: "Acesso restrito a administradores da empresa",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro na verificação de permissão",
      });
    }
  }
}

module.exports = AuthMiddleware;
