const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

class AuthController {
  static async register(req, res) {
    try {
      const {
        email,
        password,
        fullName,
        userType = "personal",
        companyId,
      } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          error: "Email, senha e nome completo são obrigatórios",
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Email já está registrado",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      let role = "PERSONAL";
      if (userType === "company_admin") role = "COMPANY_ADMIN";
      if (userType === "super_admin") role = "SUPER_ADMIN";
      if (userType === "employee") role = "EMPLOYEE";

      const userData = {
        email: email.toLowerCase(),
        passwordHash,
        role,
      };

      if (userType === "personal") {
        const slug = fullName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]/g, "");

        userData.personalProfile = {
          create: {
            fullName,
            profileSlug: slug,
          },
        };
      }

      if (userType === "employee" && companyId) {
        userData.employeeProfile = {
          create: {
            companyId,
            fullName,
            position: req.body.position || "Funcionário",
            profileSlug: fullName.toLowerCase().replace(/\s+/g, "-"),
          },
        };
      }

      const user = await prisma.user.create({
        data: userData,
        include: {
          personalProfile: true,
          employeeProfile: true,
        },
      });

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
      );

      res.status(201).json({
        success: true,
        message: "Usuário registrado com sucesso",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            profile: user.personalProfile || user.employeeProfile,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao registrar usuário",
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email e senha são obrigatórios",
        });
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          personalProfile: true,
          companyAdmin: { include: { company: true } },
          employeeProfile: { include: { company: true } },
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Credenciais inválidas",
        });
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          error: "Credenciais inválidas",
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: "Conta desativada",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
      );

      let profile = null;
      if (user.personalProfile)
        profile = { ...user.personalProfile, type: "personal" };
      if (user.companyAdmin)
        profile = { ...user.companyAdmin, type: "company_admin" };
      if (user.employeeProfile)
        profile = { ...user.employeeProfile, type: "employee" };

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            profile,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao fazer login",
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          personalProfile: true,
          companyAdmin: { include: { company: true } },
          employeeProfile: { include: { company: true } },
        },
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao buscar perfil",
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { fullName, phone, bio, website } = req.body;

      let updatedUser;

      if (req.user.personalProfile) {
        updatedUser = await prisma.personalProfile.update({
          where: { userId: req.user.id },
          data: {
            fullName,
            phone,
            bio,
            website,
            updatedAt: new Date(),
          },
        });
      } else if (req.user.employeeProfile) {
        updatedUser = await prisma.employeeProfile.update({
          where: { userId: req.user.id },
          data: {
            fullName,
            phone,
            bio,
            updatedAt: new Date(),
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "Tipo de perfil não suportado",
        });
      }

      res.json({
        success: true,
        message: "Perfil atualizado com sucesso",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao atualizar perfil",
      });
    }
  }

  static async createSuperAdmin(req, res) {
    try {
      const { email, password, fullName } = req.body;

      const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
      });

      if (existingSuperAdmin) {
        return res.status(400).json({
          success: false,
          error: "Super administrador já existe",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const superAdmin = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          role: "SUPER_ADMIN",
          personalProfile: {
            create: {
              fullName,
              profileSlug: "super-admin",
            },
          },
        },
      });

      const token = jwt.sign(
        {
          id: superAdmin.id,
          email: superAdmin.email,
          role: superAdmin.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
      );

      res.status(201).json({
        success: true,
        message: "Super administrador criado com sucesso",
        data: {
          token,
          user: {
            id: superAdmin.id,
            email: superAdmin.email,
            role: superAdmin.role,
          },
        },
      });
    } catch (error) {
      console.error("Create super admin error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao criar super administrador",
      });
    }
  }
}

module.exports = AuthController;
