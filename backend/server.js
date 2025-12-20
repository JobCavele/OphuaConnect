require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Database = require("./src/utils/database");

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());

// ROTAS SIMPLES DIRETAS (sem importação complexa)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    const prisma = new PrismaClient();
    const { email, password } = req.body;

    console.log("🔐 Login attempt:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email e senha são obrigatórios",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        personalProfile: true,
        companyAdmin: {
          include: {
            company: true,
          },
        },
        employeeProfile: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      console.log("❌ Usuário não encontrado");
      return res.status(401).json({
        success: false,
        error: "Credenciais inválidas",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.log("❌ Senha incorreta");
      return res.status(401).json({
        success: false,
        error: "Credenciais inválidas",
      });
    }

    // Preparar dados do usuário baseado no role
    let userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    // Adicionar dados específicos baseado no role
    if (user.role === "PERSONAL" && user.personalProfile) {
      userData = {
        ...userData,
        fullName: user.personalProfile.fullName,
        phone: user.personalProfile.phone,
        bio: user.personalProfile.bio,
        avatarUrl: user.personalProfile.avatarUrl,
      };
    } else if (
      user.role === "COMPANY_ADMIN" &&
      user.companyAdmin?.[0]?.company
    ) {
      const company = user.companyAdmin[0].company;
      userData = {
        ...userData,
        fullName: "Administrador", // Pode precisar ajustar
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          website: company.website,
        },
      };
    } else if (user.role === "EMPLOYEE" && user.employeeProfile) {
      userData = {
        ...userData,
        fullName: user.employeeProfile.fullName,
        position: user.employeeProfile.position,
        phone: user.employeeProfile.phone,
        company: user.employeeProfile.company
          ? {
              id: user.employeeProfile.company.id,
              name: user.employeeProfile.company.name,
            }
          : null,
      };
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "ophuaconnect-secret-2025",
      { expiresIn: "7d" }
    );

    console.log("✅ Login bem-sucedido:", email);

    res.json({
      success: true,
      token,
      user: userData,
      message: "Login realizado com sucesso",
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// Registrar conta pessoal
// Substitua a rota de registro pessoal por:

app.post("/api/auth/register/personal", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    const prisma = new PrismaClient();
    const { email, password, fullName, phone, bio } = req.body;

    console.log("📝 Registro pessoal:", email);

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: "Todos os campos são obrigatórios",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email já registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transação para criar tudo junto
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar usuário
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "PERSONAL",
        },
      });

      // 2. Criar configurações de tema
      const themeSettings = await tx.themeSettings.create({
        data: {
          primaryColor: "#3B82F6",
          secondaryColor: "#1E40AF",
        },
      });

      // 3. Criar perfil pessoal
      const personalProfile = await tx.personalProfile.create({
        data: {
          fullName,
          phone: phone || null,
          bio: bio || null,
          userId: user.id,
          themeSettingsId: themeSettings.id,
          socialLinks: {}, // Inicialmente vazio
        },
      });

      return { user, personalProfile };
    });

    const { user } = result;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "ophuaconnect-secret-2025",
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    console.log("✅ Registro bem-sucedido:", email);

    res.status(201).json({
      success: true,
      token,
      user: {
        ...userWithoutPassword,
        fullName, // Incluir no response
        phone: phone || null,
        bio: bio || null,
      },
      message: "Conta pessoal criada com sucesso",
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("🔥 Register error:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao criar conta",
    });
  }
});
// Registrar conta empresarial

app.post("/api/auth/register/company", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    const prisma = new PrismaClient();
    const {
      email,
      password,
      companyName,
      fullName,
      website,
      description,
      phone,
      industry,
      size,
      facebook,
      instagram,
      linkedin,
      twitter,
      github,
    } = req.body;

    console.log("🏢 Registro de empresa:", email);

    if (!email || !password || !companyName || !fullName) {
      return res.status(400).json({
        success: false,
        error: "Campos obrigatórios faltando",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email já registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar slug da empresa
    const slug = companyName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");

    // Começar uma transação
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar usuário
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "COMPANY_ADMIN",
        },
      });

      // 2. Criar configurações de tema
      const themeSettings = await tx.themeSettings.create({
        data: {
          primaryColor: "#3B82F6",
          secondaryColor: "#1E40AF",
        },
      });

      // 3. Criar empresa
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug,
          website: website || null,
          description: description || null,
          logoUrl: null,
          socialLinks: {
            facebook: facebook || null,
            instagram: instagram || null,
            linkedin: linkedin || null,
            twitter: twitter || null,
            github: github || null,
          },
          themeSettingsId: themeSettings.id,
          status: "ACTIVE",
        },
      });

      // 4. Criar perfil de admin da empresa
      await tx.companyAdmin.create({
        data: {
          userId: user.id,
          companyId: company.id,
        },
      });

      return { user, company, themeSettings };
    });

    const { user, company } = result;

    // Gerar token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: company.id,
      },
      process.env.JWT_SECRET || "ophuaconnect-secret-2025",
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    console.log("✅ Empresa registrada:", companyName);

    res.status(201).json({
      success: true,
      token,
      user: {
        ...userWithoutPassword,
        fullName, // Mantemos no response para o frontend
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
        },
      },
      message: "Conta empresarial criada com sucesso",
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("🔥 Company register error:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao criar conta empresarial",
    });
  }
});

// Registrar conta de funcionário vinculada a uma empresa existente
app.post("/api/auth/register/employee/:companySlug", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    const prisma = new PrismaClient();
    const { companySlug } = req.params;
    const {
      email,
      password,
      fullName,
      position,
      phone,
      bio,
      facebook,
      instagram,
      linkedin,
      twitter,
      github,
    } = req.body;

    console.log(
      "👤 Registro de funcionário:",
      email,
      "para empresa:",
      companySlug
    );

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: "Campos obrigatórios faltando",
      });
    }

    // Buscar empresa pelo slug
    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Empresa não encontrada",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email já registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transação
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar usuário
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "EMPLOYEE",
        },
      });

      // 2. Criar configurações de tema (usando tema da empresa)
      const companyTheme = await tx.themeSettings.findUnique({
        where: { id: company.themeSettingsId },
      });

      const themeSettings = await tx.themeSettings.create({
        data: {
          primaryColor: companyTheme?.primaryColor || "#3B82F6",
          secondaryColor: companyTheme?.secondaryColor || "#1E40AF",
        },
      });

      // 3. Criar perfil de funcionário
      const employeeProfile = await tx.employeeProfile.create({
        data: {
          fullName,
          position: position || null,
          phone: phone || null,
          bio: bio || null,
          userId: user.id,
          companyId: company.id,
          themeSettingsId: themeSettings.id,
          socialLinks: {
            facebook: facebook || null,
            instagram: instagram || null,
            linkedin: linkedin || null,
            twitter: twitter || null,
            github: github || null,
          },
          status: "PENDING", // Precisa de aprovação
        },
      });

      return { user, employeeProfile, company };
    });

    const { user, employeeProfile } = result;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: company.id,
        employeeProfileId: employeeProfile.id,
      },
      process.env.JWT_SECRET || "ophuaconnect-secret-2025",
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    console.log("✅ Funcionário registrado:", fullName);

    res.status(201).json({
      success: true,
      token,
      user: {
        ...userWithoutPassword,
        fullName,
        position: position || null,
        phone: phone || null,
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
        },
      },
      message: "Conta de funcionário criada com sucesso. Aguarde aprovação.",
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("🔥 Employee register error:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao criar conta de funcionário",
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    message: "OphuaConnect API funcionando",
  });
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "OphuaConnect Platform API",
    version: "1.0.0",
    status: "online",
    endpoints: {
      login: "POST /api/auth/login",
      registerPersonal: "POST /api/auth/register/personal",
      registerCompany: "POST /api/auth/register/company",
      upload: "POST /api/upload",
      health: "GET /api/health",
    },
  });
});

// Configuração do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens são permitidas"));
    }
  },
});

// Rota de upload
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Nenhum arquivo enviado",
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      fileUrl,
      filename: req.file.filename,
      message: "Arquivo enviado com sucesso",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao fazer upload do arquivo",
    });
  }
});

// Servir arquivos estáticos
app.use("/uploads", express.static("uploads"));

// Middleware de erro
app.use((err, req, res, next) => {
  console.error("🔥 ERRO GLOBAL:", err.stack);

  // Erro do multer (tamanho do arquivo)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "Arquivo muito grande. Tamanho máximo: 5MB",
      });
    }
  }

  res.status(500).json({
    success: false,
    error: "Erro interno do servidor",
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log("404:", req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    error: "Rota não encontrada",
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await Database.initialize();

    app.listen(PORT, () => {
      console.log(`
🎉🎉🎉 OPHUACONNECT BACKEND FUNCIONANDO! 🎉🎉🎉
📍 Porta: ${PORT}
🌐 URL: http://localhost:${PORT}
🖥️  Frontend: http://localhost:5173

👑 SUPER ADMIN:
📧 admin@ophuaconnect.com
🔑 Admin123!

🔗 Endpoints ativos:
   POST /api/auth/login
   POST /api/auth/register/personal
   POST /api/auth/register/company
   POST /api/upload
   GET  /api/health
   GET  /

📊 Banco: PostgreSQL 16 (conectado)
⏰ ${new Date().toLocaleString()}
      `);

      console.log("\n🎯 TESTE RÁPIDO:");
      console.log("curl -X POST http://localhost:5000/api/auth/login \\");
      console.log('  -H "Content-Type: application/json" \\');
      console.log(
        '  -d \'{"email":"admin@ophuaconnect.com","password":"Admin123!"}\''
      );
    });
  } catch (error) {
    console.error("❌ Falha ao iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();
