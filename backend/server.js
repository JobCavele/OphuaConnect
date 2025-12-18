// ============================================
// OPHUACONNECT API - SERVIDOR PRINCIPAL
// ============================================

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ========== MIDDLEWARES ==========

// Autenticação JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: "Token de autenticação necessário" 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: "Token inválido ou expirado" 
      });
    }
    req.user = user;
    next();
  });
};

// Verificar super admin
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ 
      success: false, 
      error: "Acesso restrito a super administrador" 
    });
  }
  next();
};

// ========== ROTAS PÚBLICAS ==========

// 1. RAIZ - Informações da API
app.get("/", async (req, res) => {
  try {
    const userCount = await prisma.user.count().catch(() => 0);
    const companyCount = 0; // Temporariamente até criar tabela Company
    
    res.json({
      app: "OphuaConnect",
      version: "1.0.0",
      status: "online",
      description: "Plataforma para conectar empresas e profissionais",
      statistics: {
        users: userCount,
        companies: companyCount
      },
      endpoints: {
        auth: {
          register: "POST /api/auth/register",
          login: "POST /api/auth/login"
        },
        companies: {
          list: "GET /api/companies",
          create: "POST /api/companies (autenticado)",
          profile: "GET /api/companies/:slug"
        },
        admin: {
          createSuperAdmin: "POST /api/admin/super-admin (uma vez)"
        }
      }
    });
  } catch (error) {
    res.json({
      app: "OphuaConnect",
      status: "online",
      database: "error",
      error: error.message
    });
  }
});

// 2. HEALTH CHECK
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      users: userCount
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message
    });
  }
});

// ========== AUTENTICAÇÃO ==========

// 3. REGISTRO DE USUÁRIO
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, fullName, userType = "personal" } = req.body;
    
    // Validação
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: "Email, senha e nome completo são obrigatórios"
      });
    }
    
    // Verificar se email existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email já está registrado"
      });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Determinar role
    let role = "PERSONAL";
    if (userType === "company_admin") role = "COMPANY_ADMIN";
    if (userType === "super_admin") role = "SUPER_ADMIN";
    if (userType === "employee") role = "EMPLOYEE";
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role
      }
    });
    
    // Criar perfil baseado no tipo
    if (userType === "personal") {
      const slug = fullName.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]/g, "");
      
      await prisma.personalProfile.create({
        data: {
          userId: user.id,
          fullName,
          profileSlug: slug
        }
      });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "ophuaconnect_dev_secret",
      { expiresIn: "30d" }
    );
    
    res.status(201).json({
      success: true,
      message: "Usuário registrado com sucesso",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor"
    });
  }
});

// 4. LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        personalProfile: true,
        companyAdmin: { include: { company: true } },
        employeeProfile: { include: { company: true } }
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Credenciais inválidas"
      });
    }
    
    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: "Credenciais inválidas"
      });
    }
    
    // Gerar token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "ophuaconnect_dev_secret",
      { expiresIn: "30d" }
    );
    
    // Preparar resposta
    let profile = null;
    if (user.personalProfile) profile = { ...user.personalProfile, type: "personal" };
    if (user.companyAdmin) profile = { ...user.companyAdmin, type: "company_admin" };
    if (user.employeeProfile) profile = { ...user.employeeProfile, type: "employee" };
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile
        }
      }
    });
    
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor"
    });
  }
});

// ========== EMPRESAS ==========

// 5. LISTAR EMPRESAS (público)
app.get("/api/companies", async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        website: true,
        logoUrl: true,
        slug: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: { employees: true }
        }
      }
    });
    
    res.json({
      success: true,
      data: companies
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 6. CRIAR EMPRESA (autenticado)
app.post("/api/companies", authenticateToken, async (req, res) => {
  try {
    const { name, displayName, description, website } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Nome da empresa é obrigatório"
      });
    }
    
    // Gerar slug
    const baseSlug = name.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]/g, "");
    
    let slug = baseSlug;
    let counter = 1;
    
    // Garantir slug único
    while (await prisma.company.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Criar empresa
    const company = await prisma.company.create({
      data: {
        name,
        displayName: displayName || name,
        description,
        website,
        slug,
        isVerified: req.user.role === "SUPER_ADMIN"
      }
    });
    
    // Se for admin, associar à empresa
    if (req.user.role === "COMPANY_ADMIN" || req.user.role === "SUPER_ADMIN") {
      await prisma.companyAdmin.create({
        data: {
          userId: req.user.id,
          companyId: company.id,
          canManageEmployees: true,
          canEditCompanyInfo: true,
          canInviteAdmins: req.user.role === "SUPER_ADMIN"
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: "Empresa criada com sucesso",
      data: company
    });
    
  } catch (error) {
    if (error.code === "P2002") {
      res.status(400).json({
        success: false,
        error: "Nome da empresa já existe"
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// 7. PERFIL PÚBLICO DA EMPRESA
app.get("/api/companies/:slug", async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { 
        slug: req.params.slug,
        isActive: true 
      },
      include: {
        employees: {
          where: { isActive: true, isApproved: true },
          select: {
            id: true,
            fullName: true,
            position: true,
            profileSlug: true
          }
        }
      }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Empresa não encontrada"
      });
    }
    
    res.json({
      success: true,
      data: company
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== ADMIN ==========

// 8. CRIAR SUPER ADMIN (rota especial - usar uma vez)
app.post("/api/admin/super-admin", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: "Todos os campos são obrigatórios"
      });
    }
    
    // Verificar se já existe super admin
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" }
    });
    
    if (existingSuperAdmin) {
      return res.status(400).json({
        success: false,
        error: "Super administrador já existe"
      });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Criar super admin
    const superAdmin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "SUPER_ADMIN",
        personalProfile: {
          create: {
            fullName,
            profileSlug: "super-admin"
          }
        }
      }
    });
    
    // Gerar token
    const token = jwt.sign(
      { 
        id: superAdmin.id, 
        email: superAdmin.email, 
        role: superAdmin.role 
      },
      process.env.JWT_SECRET || "ophuaconnect_dev_secret",
      { expiresIn: "30d" }
    );
    
    res.status(201).json({
      success: true,
      message: "Super administrador criado com sucesso",
      data: {
        token,
        user: {
          id: superAdmin.id,
          email: superAdmin.email,
          role: superAdmin.role
        }
      }
    });
    
  } catch (error) {
    console.error("Erro ao criar super admin:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor"
    });
  }
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, () => {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║               🚀 OPHUACONNECT API                   ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║ 📡 URL: http://localhost:${PORT}                     ║`);
  console.log(`║ 💾 Banco: SQLite (dev.db)                          ║`);
  console.log("║ 🔐 Autenticação: JWT                               ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log("║ 📋 ENDPOINTS PRINCIPAIS:                           ║");
  console.log("║   GET    /                  - Informações da API    ║");
  console.log("║   POST   /api/auth/register - Registrar usuário     ║");
  console.log("║   POST   /api/auth/login    - Login                 ║");
  console.log("║   GET    /api/companies     - Listar empresas       ║");
  console.log("║   POST   /api/companies     - Criar empresa (auth)  ║");
  console.log("║   POST   /api/admin/super-admin - Criar super admin ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log("\n⚡ Para começar:");
  console.log("1. Crie um super admin:");
  console.log('   curl -X POST http://localhost:5000/api/admin/super-admin \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d "{\\"email\\":\\"admin@ophuaconnect.com\\",\\"password\\":\\"Admin123!\\",\\"fullName\\":\\"Super Admin\\"}"');
  console.log("\n2. Teste a API:");
  console.log("   curl http://localhost:5000/");
  console.log("   curl http://localhost:5000/api/companies");
  console.log("═══════════════════════════════════════════════════════");
});

// Fechar conexão do Prisma ao encerrar
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("👋 Servidor encerrado");
  process.exit(0);
});

