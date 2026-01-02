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

// ---------- MIDDLEWARE ----------
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---------- FUNÇÃO AUXILIAR PARA VERIFICAR TOKEN ----------
const verifyToken = (token) => {
  try {
    const jwt = require("jsonwebtoken");
    return jwt.verify(
      token,
      process.env.JWT_SECRET || "ophuaconnect-secret-2025"
    );
  } catch {
    return null;
  }
};
// Middleware que injeta o usuário decodificado
const requireCompany = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) {
    console.log("❌ Token não fornecido nos headers");
    console.log("Headers recebidos:", req.headers);
    return res.status(401).json({
      success: false,
      error: "Token não fornecido",
      hint: "Verifique se o token está sendo enviado no header Authorization",
    });
  }

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    console.log("❌ Token inválido ou expirado");
    return res.status(401).json({
      success: false,
      error: "Token inválido ou expirado",
    });
  }

  if (decoded.role !== "COMPANY_ADMIN") {
    return res.status(403).json({
      success: false,
      error: "Acesso negado. Apenas COMPANY_ADMIN pode acessar.",
    });
  }

  console.log("✅ Usuário autenticado:", {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    companyId: decoded.companyId,
  });

  req.user = decoded;
  next();
};
const { extractColorsFromImage } = require("./src/utils/colorExtractor");
// ---------- UPLOAD ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Apenas imagens são permitidas"));
  },
});

// ---------- SERVE UPLOADS ----------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Adicione esta rota
app.get("/api/auth/verify", (req, res) => {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) {
    return res.json({ valid: false, error: "Token não fornecido" });
  }

  const decoded = verifyToken(auth.split(" ")[1]);

  if (!decoded) {
    return res.json({ valid: false, error: "Token inválido" });
  }

  res.json({
    valid: true,
    user: decoded,
    expiresIn: decoded.exp - Math.floor(Date.now() / 1000),
  });
});
// server.js - Adicione estas rotas:

// Rota para pegar perfil do funcionário
app.get("/api/employee/profile/:id", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const employeeId = parseInt(req.params.id);

    const employee = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            description: true,
            website: true,
            industry: true,
            slug: true,
            themeSettings: true,
          },
        },
        themeSettings: true,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Funcionário não encontrado",
      });
    }

    res.json({
      success: true,
      profile: employee,
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// Rota para atualizar perfil do funcionário
app.put("/api/employee/profile/:id", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const employeeId = parseInt(req.params.id);
    const data = req.body;

    const updated = await prisma.employeeProfile.update({
      where: { id: employeeId },
      data: {
        fullName: data.fullName,
        position: data.position,
        phone: data.phone,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        socialLinks: data.socialLinks,
      },
      include: {
        company: true,
        themeSettings: true,
      },
    });

    res.json({
      success: true,
      profile: updated,
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});
// CORRIJA A ROTA /api/company/theme/:slug
app.get("/api/company/theme/:slug", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const slug = req.params.slug;
    console.log("🔍 Buscando tema para slug:", slug);

    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        themeSettings: true,
      },
    });

    if (!company) {
      console.log("❌ Empresa não encontrada com slug:", slug);

      // Se slug for número, tenta buscar por ID
      if (!isNaN(slug)) {
        const companyById = await prisma.company.findUnique({
          where: { id: parseInt(slug) },
          include: { themeSettings: true },
        });

        if (companyById) {
          console.log("✅ Encontrada por ID:", companyById.name);
          await prisma.$disconnect();
          return res.json({
            success: true,
            theme: companyById.themeSettings,
            company: {
              name: companyById.name,
              logoUrl: companyById.logoUrl,
              slug: companyById.slug,
            },
          });
        }
      }

      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: "Empresa não encontrada",
        requestedSlug: slug,
        availableSlugs: ["primeira", "vodacom"], // ← Adicione esta linha
      });
    }

    await prisma.$disconnect();

    res.json({
      success: true,
      theme: company.themeSettings,
      company: {
        name: company.name,
        logoUrl: company.logoUrl,
        slug: company.slug,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar tema da empresa:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});
const requireSuperAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res
      .status(401)
      .json({ success: false, error: "Token não fornecido" });
  const decoded = verifyToken(auth.split(" ")[1]);
  if (!decoded || decoded.role !== "SUPER_ADMIN")
    return res.status(403).json({ success: false, error: "Acesso negado" });
  req.user = decoded;
  next();
};
// ---------- ROTAS DE AUTENTICAÇÃO ----------

// LOGIN
// LOGIN - CORRIJA ESTA SEÇÃO
app.post("/api/auth/login", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    const prisma = new PrismaClient();
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email e senha são obrigatórios" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        personalProfile: true,
        companyAdmin: {
          // ← GARANTIR QUE TRAZ companyId
          include: {
            company: true,
          },
        },
        employeeProfile: { include: { company: true } },
      },
    });

    if (!user)
      return res
        .status(401)
        .json({ success: false, error: "Credenciais inválidas" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res
        .status(401)
        .json({ success: false, error: "Credenciais inválidas" });

    // Prepare user data
    let userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    let tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Add specific data based on role
    if (user.role === "PERSONAL" && user.personalProfile) {
      userData = { ...userData, ...user.personalProfile };
    } else if (user.role === "COMPANY_ADMIN" && user.companyAdmin?.[0]) {
      // ✅ CRÍTICO: companyId deve vir do admin
      userData.company = user.companyAdmin[0].company;
      tokenPayload.companyId = user.companyAdmin[0].companyId; // ← AQUI ESTÁ O ERRO

      console.log("🔍 Admin encontrado:", {
        userId: user.id,
        adminId: user.companyAdmin[0].id,
        companyId: user.companyAdmin[0].companyId,
        companyName: user.companyAdmin[0].company?.name,
      });
    } else if (user.role === "EMPLOYEE" && user.employeeProfile) {
      userData = {
        ...userData,
        ...user.employeeProfile,
        company: user.employeeProfile.company,
      };
      tokenPayload.companyId = user.employeeProfile.companyId;
    }

    // Create token with payload
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "ophuaconnect-secret-2025",
      { expiresIn: "7d" }
    );

    // Log para debug
    console.log("🔐 Login successful:", {
      email: user.email,
      role: user.role,
      hasCompanyId: !!tokenPayload.companyId,
      companyId: tokenPayload.companyId,
      tokenPayload, // ← MOSTRA TODO O PAYLOAD
    });

    res.json({ success: true, token, user: userData });
    await prisma.$disconnect();
  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ success: false, error: "Erro interno do servidor" });
  }
});
// REGISTER PERSONAL
app.post("/api/auth/register/personal", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    const prisma = new PrismaClient();
    const { email, password, fullName, phone, bio, jobTitle, ...social } =
      req.body;

    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ success: false, error: "Campos obrigatórios faltando" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, error: "Email já registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, password: hashedPassword, role: "PERSONAL" },
      });
      const themeSettings = await tx.themeSettings.create({
        data: { primaryColor: "#3B82F6", secondaryColor: "#1E40AF" },
      });
      const personalProfile = await tx.personalProfile.create({
        data: {
          fullName,
          phone,
          bio,
          jobTitle,
          userId: user.id,
          themeSettingsId: themeSettings.id,
          socialLinks: social,
        },
      });
      return { user, personalProfile };
    });

    const token = jwt.sign(
      { id: result.user.id, email, role: "PERSONAL" },
      process.env.JWT_SECRET || "ophuaconnect-secret-2025",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: { ...result.user, ...result.personalProfile },
    });
    await prisma.$disconnect();
  } catch (error) {
    console.error("🔥 Register personal error:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao criar conta pessoal" });
  }
});
// server.js - ADICIONE ESTA ROTA (em qualquer lugar após os middlewares)
app.get("/api/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  console.log("📸 Servindo imagem:", filename, "Caminho:", filePath);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.error("❌ Imagem não encontrada:", filePath);
    res.status(404).json({ error: "Imagem não encontrada" });
  }
});
// Rota para atualizar tema da empresa
app.put("/api/company/update-theme", requireCompany, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const admin = await prisma.companyAdmin.findUnique({
      where: { userId: req.user.id },
      include: { company: true },
    });

    if (!admin) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }

    const { primaryColor, secondaryColor } = req.body;
    console.log("🎨 Atualizando tema da empresa:", {
      primaryColor,
      secondaryColor,
    });

    // Atualiza o temaSettings da empresa
    const updatedTheme = await prisma.themeSettings.update({
      where: { id: admin.company.themeSettingsId },
      data: {
        primaryColor: primaryColor || "#3B82F6",
        secondaryColor: secondaryColor || "#1E40AF",
      },
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      message: "Tema atualizado com sucesso",
      theme: updatedTheme,
    });
  } catch (error) {
    console.error("Erro ao atualizar tema:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
// REGISTER COMPANY (com logo opcional)
// REGISTER COMPANY (com upload.any() temporário)
app.post("/api/auth/register/company", upload.any(), async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");
    const path = require("path");

    const prisma = new PrismaClient();

    // Parse body (FormData)
    const body = req.body;
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
    } = body;

    console.log("📝 Dados recebidos:", { email, companyName, fullName });
    console.log(
      "📁 Arquivos recebidos:",
      req.files?.map((f) => f.fieldname)
    );

    if (!email || !password || !companyName || !fullName) {
      return res
        .status(400)
        .json({ success: false, error: "Campos obrigatórios faltando" });
    }

    // Encontra arquivo de logo
    let logoFile = null;
    if (req.files && req.files.length > 0) {
      logoFile = req.files.find(
        (f) =>
          f.fieldname === "logo" ||
          f.fieldname.includes("logo") ||
          f.mimetype.startsWith("image/")
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, error: "Email já registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    let slug = companyName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");

    // Verifica slug
    let counter = 1;
    let originalSlug = slug;
    while (true) {
      const existing = await prisma.company.findUnique({
        where: { slug },
      });
      if (!existing) break;
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    console.log("🏢 Slug gerado:", slug);

    // Cores
    let primaryColor = "#3B82F6";
    let secondaryColor = "#1E40AF";
    let logoUrl = null;

    if (logoFile) {
      logoUrl = `/api/uploads/${logoFile.filename}`;
      const logoPath = path.join(__dirname, "uploads", logoFile.filename);

      try {
        console.log("🎨 Extraindo cores do logo...");
        const colors = await extractColorsFromImage(logoPath);
        if (colors && colors.primaryColor && colors.secondaryColor) {
          primaryColor = colors.primaryColor;
          secondaryColor = colors.secondaryColor;
          console.log("✅ Cores extraídas:", { primaryColor, secondaryColor });
        }
      } catch (colorError) {
        console.warn("❌ Erro na extração:", colorError.message);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, password: hashedPassword, role: "COMPANY_ADMIN" },
      });

      const themeSettings = await tx.themeSettings.create({
        data: { primaryColor, secondaryColor },
      });

      const company = await tx.company.create({
        data: {
          name: companyName,
          slug,
          website: website || "",
          description: description || "",
          industry: industry || "",
          size: size || "",
          logoUrl: logoUrl,
          socialLinks: {
            facebook: facebook || "",
            instagram: instagram || "",
            linkedin: linkedin || "",
            twitter: twitter || "",
            github: github || "",
          },
          themeSettingsId: themeSettings.id,
          status: "ACTIVE",
        },
      });

      await tx.companyAdmin.create({
        data: { userId: user.id, companyId: company.id },
      });

      return { user, company, themeSettings };
    });

    // Token
    const token = jwt.sign(
      {
        id: result.user.id,
        email,
        role: "COMPANY_ADMIN",
        companyId: result.company.id,
      },
      process.env.JWT_SECRET || "ophuaconnect-secret-2025",
      { expiresIn: "7d" }
    );

    // Response
    const userData = {
      id: result.user.id,
      email: result.user.email,
      role: "COMPANY_ADMIN",
      company: {
        ...result.company,
        themeSettings: result.themeSettings,
      },
    };

    console.log("✅ Empresa registrada:", {
      companyId: result.company.id,
      slug: result.company.slug,
    });

    res.status(201).json({
      success: true,
      token,
      user: userData,
    });
    await prisma.$disconnect();
  } catch (error) {
    console.error("🔥 Company register error:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao criar conta empresarial" });
  }
});

// Função auxiliar para gerar cores do nome
function generateColorsFromName(name) {
  // Hash do nome para cores consistentes
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Cores baseadas no hash
  const hue = Math.abs(hash % 360);

  // Primária: cor vibrante
  const primary = hslToHex(hue, 70, 50);

  // Secundária: tom complementar
  const secondary = hslToHex((hue + 180) % 360, 60, 40);

  return { primary, secondary };
}

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// CORRIJA a rota de registro de funcionário no server.js
app.post(
  "/api/auth/register/employee/:companySlug",
  upload.single("avatar"),
  async (req, res) => {
    // Remova o express.urlencoded daqui
    try {
      const { PrismaClient } = require("@prisma/client");
      const bcrypt = require("bcryptjs");
      const jwt = require("jsonwebtoken");

      const prisma = new PrismaClient();
      const { companySlug } = req.params;

      // CORREÇÃO: Use req.body diretamente, não precisa de urlencoded
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

      console.log("📝 Dados recebidos para cadastro de funcionário:", req.body);
      console.log("🏢 Slug da empresa:", companySlug);

      if (!email || !password || !fullName) {
        return res
          .status(400)
          .json({ success: false, error: "Campos obrigatórios faltando" });
      }

      const company = await prisma.company.findUnique({
        where: { slug: companySlug },
      });

      if (!company) {
        console.log("❌ Empresa não encontrada com slug:", companySlug);
        return res
          .status(404)
          .json({ success: false, error: "Empresa não encontrada" });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, error: "Email já registrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email, password: hashedPassword, role: "EMPLOYEE" },
        });

        const companyTheme = await tx.themeSettings.findUnique({
          where: { id: company.themeSettingsId },
        });

        const themeSettings = await tx.themeSettings.create({
          data: {
            primaryColor: companyTheme?.primaryColor || "#3B82F6",
            secondaryColor: companyTheme?.secondaryColor || "#1E40AF",
          },
        });

        const employeeProfile = await tx.employeeProfile.create({
          data: {
            fullName,
            position: position || "",
            phone: phone || "",
            bio: bio || "",
            avatarUrl: req.file ? `/uploads/${req.file.filename}` : null,
            userId: user.id,
            companyId: company.id,
            themeSettingsId: themeSettings.id,
            socialLinks: {
              facebook: facebook || "",
              instagram: instagram || "",
              linkedin: linkedin || "",
              twitter: twitter || "",
              github: github || "",
            },
            status: "PENDING",
          },
        });

        return { user, employeeProfile, company };
      });

      const token = jwt.sign(
        {
          id: result.user.id,
          email,
          role: "EMPLOYEE",
          companyId: company.id,
          employeeProfileId: result.employeeProfile.id,
        },
        process.env.JWT_SECRET || "ophuaconnect-secret-2025",
        { expiresIn: "7d" }
      );

      console.log("✅ Funcionário cadastrado com sucesso:", email);

      res.status(201).json({
        success: true,
        token,
        user: {
          ...result.user,
          ...result.employeeProfile,
          company,
        },
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error("🔥 Employee register error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao criar conta de funcionário",
        details: error.message,
      });
    }
  }
);
// ---------- ROTAS DE EMPRESA (COMPANY_ADMIN OU SUPER_ADMIN) ----------
const requireAuthCompanyOrSuper = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res
      .status(401)
      .json({ success: false, error: "Token não fornecido" });
  const decoded = verifyToken(auth.split(" ")[1]);
  if (!decoded)
    return res.status(401).json({ success: false, error: "Token inválido" });
  if (decoded.role !== "COMPANY_ADMIN" && decoded.role !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, error: "Acesso negado" });
  }
  req.user = decoded;
  next();
};

//debugs
// Adicione esta rota de debug
app.get("/api/debug/companies", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const companies = await prisma.company.findMany({
      select: { id: true, name: true, slug: true },
    });

    await prisma.$disconnect();
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno" });
  }
});
// Dashboard da empresa
// ROTAS COM SLUG
app.get(
  "/api/company/:slug/dashboard",
  requireAuthCompanyOrSuper,
  async (req, res) => {
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      const { slug } = req.params;

      // Busca empresa pelo slug
      const company = await prisma.company.findUnique({
        where: { slug },
      });

      if (!company) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }

      // Verifica se o admin tem acesso
      if (req.user.role === "COMPANY_ADMIN") {
        const admin = await prisma.companyAdmin.findFirst({
          where: {
            userId: req.user.id,
            companyId: company.id,
          },
        });
        if (!admin) {
          return res.status(403).json({ error: "Acesso negado" });
        }
      }

      const [totalEmployees, pendingEmployees, activeEmployees] =
        await prisma.$transaction([
          prisma.employeeProfile.count({
            where: { companyId: company.id },
          }),
          prisma.employeeProfile.count({
            where: { companyId: company.id, status: "PENDING" },
          }),
          prisma.employeeProfile.count({
            where: { companyId: company.id, status: "APPROVED" },
          }),
        ]);

      await prisma.$disconnect();

      res.json({
        totalEmployees,
        pendingApprovals: pendingEmployees,
        activeEmployees,
        company,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// Lista de funcionários da empresa
// ROTA /api/company/employees
app.get(
  "/api/company/employees",
  requireAuthCompanyOrSuper,
  async (req, res) => {
    try {
      console.log("🔍 User no middleware:", req.user);

      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      let companyId;

      if (req.user.role === "SUPER_ADMIN") {
        // SUPER_ADMIN: precisa especificar qual empresa
        companyId = req.query.companyId;
        if (!companyId) {
          return res.status(400).json({
            success: false,
            error:
              "Para SUPER_ADMIN, companyId é obrigatório via query (?companyId=...)",
          });
        }
      } else if (req.user.role === "COMPANY_ADMIN") {
        // COMPANY_ADMIN: primeiro tenta do token
        companyId = req.user.companyId;

        // Se não tem no token, busca no banco (fallback)
        if (!companyId) {
          console.log("⚠️ Token sem companyId, buscando no banco...");
          const admin = await prisma.companyAdmin.findUnique({
            where: { userId: req.user.id },
          });

          if (!admin) {
            await prisma.$disconnect();
            return res.status(403).json({
              error: "Admin não vinculado a empresa",
            });
          }

          companyId = admin.companyId;
          console.log("✅ CompanyId encontrado no banco:", companyId);
        }
      } else {
        return res.status(403).json({ error: "Acesso negado" });
      }

      console.log("🏢 Buscando funcionários da empresa:", companyId);

      const employees = await prisma.employeeProfile.findMany({
        where: { companyId: parseInt(companyId) },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          position: true,
          status: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      });

      await prisma.$disconnect();

      const formatted = employees.map((e) => ({
        id: e.id,
        name: e.fullName,
        email: e.user.email,
        position: e.position || "-",
        status: e.status.toLowerCase(),
        createdAt: e.createdAt.toISOString().split("T")[0],
      }));

      res.json(formatted);
    } catch (err) {
      console.error("Erro em /api/company/employees:", err);
      res.status(500).json({ success: false, error: "Erro interno" });
    }
  }
);
// NOVA ROTA: Lista de funcionários de TODAS empresas (apenas SUPER_ADMIN)
app.get("/api/admin/all-employees", requireSuperAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const employees = await prisma.employeeProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true } },
        company: { select: { name: true } },
      },
    });

    await prisma.$disconnect();

    const formatted = employees.map((e) => ({
      id: e.id,
      name: e.fullName,
      email: e.user.email,
      position: e.position || "-",
      status: e.status.toLowerCase(),
      createdAt: e.createdAt.toISOString().split("T")[0],
      companyName: e.company.name,
      companyId: e.companyId,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});

// Aprovar funcionário (COMPANY_ADMIN / SUPER_ADMIN)
app.patch(
  "/api/company/employees/:id/approve",
  requireAuthCompanyOrSuper,
  async (req, res) => {
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      let companyId;
      if (req.user.role === "SUPER_ADMIN") {
        companyId = req.query.companyId;
        if (!companyId) {
          return res.status(400).json({
            error: "Para SUPER_ADMIN, companyId é obrigatório via query",
          });
        }
      } else {
        companyId = req.user.companyId;

        // Fallback
        if (!companyId) {
          const admin = await prisma.companyAdmin.findUnique({
            where: { userId: req.user.id },
          });
          if (!admin) {
            return res
              .status(403)
              .json({ error: "Admin não vinculado a empresa" });
          }
          companyId = admin.companyId;
        }
      }

      const emp = await prisma.employeeProfile.findUnique({
        where: { id: Number(req.params.id) },
      });

      if (!emp)
        return res.status(404).json({ error: "Funcionário não encontrado" });

      // Verifica se pertence à empresa (apenas para COMPANY_ADMIN)
      if (
        req.user.role === "COMPANY_ADMIN" &&
        emp.companyId !== parseInt(companyId)
      ) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      const updated = await prisma.employeeProfile.update({
        where: { id: emp.id },
        data: { status: "APPROVED" },
      });

      await prisma.$disconnect();
      res.json({
        success: true,
        message: "Funcionário aprovado",
        employee: updated,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);
// Rejeitar funcionário (COMPANY_ADMIN / SUPER_ADMIN)
app.patch(
  "/api/company/employees/:id/reject",
  requireAuthCompanyOrSuper,
  async (req, res) => {
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      let companyId;
      if (req.user.role === "SUPER_ADMIN") {
        companyId = 1;
      } else {
        const admin = await prisma.companyAdmin.findUnique({
          where: { userId: req.user.id },
        });
        if (!admin)
          return res
            .status(403)
            .json({ error: "Admin não vinculado a empresa" });
        companyId = admin.companyId;
      }

      const emp = await prisma.employeeProfile.findUnique({
        where: { id: Number(req.params.id) },
        select: { companyId: true },
      });
      if (!emp || emp.companyId !== companyId)
        return res.status(404).json({ error: "Funcionário não encontrado" });

      await prisma.employeeProfile.delete({ where: { id: emp.id } });
      await prisma.$disconnect();
      res.json({ success: true, message: "Funcionário rejeitado" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// ---------- ROTAS DE SUPER-ADMIN (GLOBAL) ----------

// Lista GLOBAL de empresas
app.get("/api/admin/companies", requireSuperAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { employees: true } },
        themeSettings: true,
      },
    });

    const formatted = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      website: c.website,
      description: c.description,
      logoUrl: c.logoUrl,
      status: c.status,
      createdAt: c.createdAt.toISOString().split("T")[0],
      employeesCount: c._count.employees,
      theme: c.themeSettings,
    }));
    await prisma.$disconnect();
    res.json(formatted);
  } catch (err) {
    console.error("GET /api/admin/companies", err);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});

// Funcionários de UMA empresa (super-admin)
app.get(
  "/api/admin/companies/:id/employees",
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      const companyId = Number(req.params.id);

      const employees = await prisma.employeeProfile.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          position: true,
          status: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      });

      const formatted = employees.map((e) => ({
        id: e.id,
        name: e.fullName,
        email: e.user.email,
        position: e.position || "-",
        status: e.status.toLowerCase(),
        createdAt: e.createdAt.toISOString().split("T")[0],
      }));
      await prisma.$disconnect();
      res.json(formatted);
    } catch (err) {
      console.error("GET /api/admin/companies/:id/employees", err);
      res.status(500).json({ success: false, error: "Erro interno" });
    }
  }
);

// Atualizar empresa (super-admin)
app.patch("/api/admin/companies/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const companyId = Number(req.params.id);
    const { name, description, website, status, primaryColor, secondaryColor } =
      req.body;

    const company = await prisma.company.update({
      where: { id: companyId },
      data: { name, description, website, status },
    });

    if (primaryColor || secondaryColor) {
      await prisma.themeSettings.update({
        where: { id: company.themeSettingsId },
        data: {
          primaryColor: primaryColor || undefined,
          secondaryColor: secondaryColor || undefined,
        },
      });
    }

    await prisma.$disconnect();
    res.json({ success: true, message: "Empresa atualizada", company });
  } catch (err) {
    console.error("PATCH /api/admin/companies/:id", err);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});

// Aprovar QUALQUER funcionário (super-admin)
app.patch(
  "/api/admin/employees/:id/approve",
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      const id = Number(req.params.id);

      const updated = await prisma.employeeProfile.update({
        where: { id },
        data: { status: "APPROVED" },
      });
      await prisma.$disconnect();
      res.json({
        success: true,
        message: "Funcionário aprovado",
        employee: updated,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// Rejeitar QUALQUER funcionário (super-admin)
app.patch(
  "/api/admin/employees/:id/reject",
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      const id = Number(req.params.id);

      await prisma.employeeProfile.delete({ where: { id } });
      await prisma.$disconnect();
      res.json({ success: true, message: "Funcionário rejeitado" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// ---------- ROTAS DE EMPRESA (COMPANY_ADMIN) ----------

// GET COMPANY PROFILE (CORRIGIDO PARA RETORNAR URL COMPLETA)
// UPDATE COMPANY PROFILE (CORRIGIDO PARA LIDAR COM LOGOS)
app.put(
  "/api/company/profile",
  requireCompany,
  upload.any(), // ← Aceita qualquer ou nenhum arquivo
  async (req, res) => {
    try {
      console.log("📝 Atualizando perfil da empresa...");
      console.log("📁 Arquivos recebidos:", req.files);
      console.log("📋 Body recebido:", req.body);

      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const admin = await prisma.companyAdmin.findUnique({
        where: { userId: req.user.id },
        include: { company: true },
      });

      if (!admin) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }

      const {
        name,
        description,
        website,
        logoUrl,
        socialLinks,
        slug,
        status,
        industry,
        size,
      } = req.body;

      const updateData = {
        name: name || admin.company.name,
        description: description || admin.company.description,
        website: website || admin.company.website,
        industry: industry || admin.company.industry || "",
        size: size || admin.company.size || "",
        slug: slug || admin.company.slug,
        status: status || admin.company.status,
      };

      // Processa socialLinks
      if (socialLinks) {
        try {
          updateData.socialLinks =
            typeof socialLinks === "string"
              ? JSON.parse(socialLinks)
              : socialLinks;
        } catch (e) {
          updateData.socialLinks = admin.company.socialLinks || {};
        }
      }

      // *** CRÍTICO: GARANTIR QUE logoUrl SEJA STRING OU NULL ***
      let finalLogoUrl = null;

      // 1. Se tem arquivo de logo nos uploads
      if (req.files && req.files.length > 0) {
        const logoFile = req.files.find(
          (f) => f.fieldname === "logo" || f.mimetype.startsWith("image/")
        );
        if (logoFile) {
          finalLogoUrl = `/uploads/${logoFile.filename}`;
          console.log("🖼️ Novo logo via upload:", finalLogoUrl);
        }
      }
      // 2. Se enviou logoUrl no body
      else if (logoUrl) {
        // CONVERTE ARRAY PARA STRING SE NECESSÁRIO
        if (Array.isArray(logoUrl)) {
          console.log("⚠️ logoUrl é array, convertendo para string:", logoUrl);
          finalLogoUrl = logoUrl[0] || null;
        } else if (typeof logoUrl === "string") {
          finalLogoUrl = logoUrl;
        }

        // Remove o prefixo /api/ se existir
        if (finalLogoUrl && finalLogoUrl.startsWith("/api/uploads/")) {
          finalLogoUrl = finalLogoUrl.replace("/api/uploads/", "/uploads/");
        }

        console.log("🖼️ Mantendo/atualizando logo:", finalLogoUrl);
      }
      // 3. Mantém o logo existente se não enviar nada
      else {
        finalLogoUrl = admin.company.logoUrl;
        console.log("🖼️ Mantendo logo existente:", finalLogoUrl);
      }

      // Atribui ao updateData (pode ser string, null ou undefined)
      updateData.logoUrl = finalLogoUrl;

      console.log("📊 Dados para atualizar:", updateData);

      const updatedCompany = await prisma.company.update({
        where: { id: admin.companyId },
        data: updateData,
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        company: updatedCompany,
        message: "Perfil atualizado com sucesso",
      });
    } catch (error) {
      console.error("🔥 ERRO ao atualizar perfil:", error);
      console.error("🔥 Stack trace:", error.stack);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }
);
// GET COMPANY PROFILE (CORRIGIDO PARA RETORNAR URL COMPLETA)
app.get("/api/company/profile", requireCompany, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const admin = await prisma.companyAdmin.findUnique({
      where: { userId: req.user.id },
      include: {
        company: {
          include: {
            themeSettings: true,
          },
        },
      },
    });

    if (!admin) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }

    await prisma.$disconnect();

    // Converte /uploads/ para /api/uploads/ para o frontend
    let logoUrl = admin.company.logoUrl || "";
    if (logoUrl && logoUrl.startsWith("/uploads/")) {
      logoUrl = logoUrl.replace("/uploads/", "/api/uploads/");
    }

    res.json({
      id: admin.company.id,
      name: admin.company.name,
      description: admin.company.description,
      website: admin.company.website,
      logoUrl: logoUrl, // ← URL formatada para frontend
      industry: admin.company.industry || "",
      size: admin.company.size || "",
      socialLinks: admin.company.socialLinks || {},
      slug: admin.company.slug,
      status: admin.company.status,
      themeSettings: admin.company.themeSettings,
    });
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
// UPDATE COMPANY PROFILE (CORRIGIDO PARA LIDAR COM LOGOS)
app.put(
  "/api/company/profile",
  requireCompany,
  upload.any(), // ← Aceita qualquer ou nenhum arquivo
  async (req, res) => {
    try {
      console.log("📝 Atualizando perfil da empresa...");
      console.log("📁 Arquivos recebidos:", req.files);
      console.log("📋 Body recebido:", req.body);

      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const admin = await prisma.companyAdmin.findUnique({
        where: { userId: req.user.id },
        include: { company: true },
      });

      if (!admin) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }

      const {
        name,
        description,
        website,
        logoUrl,
        socialLinks,
        slug,
        status,
        industry,
        size,
      } = req.body;

      const updateData = {
        name: name || admin.company.name,
        description: description || admin.company.description,
        website: website || admin.company.website,
        industry: industry || admin.company.industry || "",
        size: size || admin.company.size || "",
        slug: slug || admin.company.slug,
        status: status || admin.company.status,
      };

      // Processa socialLinks
      if (socialLinks) {
        try {
          updateData.socialLinks =
            typeof socialLinks === "string"
              ? JSON.parse(socialLinks)
              : socialLinks;
        } catch (e) {
          updateData.socialLinks = admin.company.socialLinks || {};
        }
      }

      // Se tem arquivo de logo nos uploads
      if (req.files && req.files.length > 0) {
        const logoFile = req.files.find(
          (f) => f.fieldname === "logo" || f.mimetype.startsWith("image/")
        );
        if (logoFile) {
          const fileUrl = `/uploads/${logoFile.filename}`;
          updateData.logoUrl = fileUrl;
          console.log("🖼️ Novo logo:", fileUrl);
        }
      }
      // Se enviou URL (mantém logo existente)
      else if (logoUrl) {
        updateData.logoUrl = logoUrl;
        console.log("🖼️ Mantendo logo:", logoUrl);
      }

      console.log("📊 Dados para atualizar:", updateData);

      const updatedCompany = await prisma.company.update({
        where: { id: admin.companyId },
        data: updateData,
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        company: updatedCompany,
        message: "Perfil atualizado com sucesso",
      });
    } catch (error) {
      console.error("🔥 ERRO ao atualizar perfil:", error);
      console.error("🔥 Stack trace:", error.stack);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }
);

// UPLOAD LOGO DA EMPRESA (RETORNA URL RELATIVA)
app.post(
  "/api/company/upload-logo",
  requireCompany,
  upload.single("logo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      // *** SALVA COMO /api/uploads/ NO BANCO ***
      const fileUrl = `/api/uploads/${req.file.filename}`;

      // ATUALIZA DIRETAMENTE NO BANCO
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const admin = await prisma.companyAdmin.findUnique({
        where: { userId: req.user.id },
        include: { company: true },
      });

      if (admin) {
        await prisma.company.update({
          where: { id: admin.companyId },
          data: { logoUrl: fileUrl },
        });
      }

      await prisma.$disconnect();

      // Retorna URL relativa (frontend resolve com proxy)
      res.json({
        success: true,
        url: fileUrl, // ← URL relativa
        message: "Logo enviado com sucesso",
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);
// server.js - Adicione esta rota ANTES da rota "Rota não encontrada"
app.get(
  "/api/public/company/:companySlug/employee/:employeeId",
  async (req, res) => {
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const { companySlug, employeeId } = req.params;

      console.log("🔍 Buscando perfil público:", { companySlug, employeeId });

      // Busca empresa pelo slug
      const company = await prisma.company.findUnique({
        where: { slug: companySlug },
        include: { themeSettings: true },
      });

      if (!company) {
        console.log("❌ Empresa não encontrada:", companySlug);
        return res.status(404).json({
          success: false,
          error: "Empresa não encontrada",
        });
      }

      // Busca funcionário por ID
      const employee = await prisma.employeeProfile.findUnique({
        where: { id: parseInt(employeeId) },
        include: { themeSettings: true },
      });

      if (!employee) {
        console.log("❌ Funcionário não encontrado ID:", employeeId);
        return res.status(404).json({
          success: false,
          error: "Funcionário não encontrado",
        });
      }

      // Verifica se funcionário pertence à empresa
      if (employee.companyId !== company.id) {
        console.log("❌ Funcionário não pertence à empresa:", {
          employeeCompanyId: employee.companyId,
          requestedCompanyId: company.id,
        });
        return res.status(404).json({
          success: false,
          error: "Funcionário não encontrado nesta empresa",
        });
      }

      console.log("✅ Perfil encontrado:", employee.fullName);

      // Retorna dados públicos
      res.json({
        success: true,
        employee: {
          id: employee.id,
          fullName: employee.fullName,
          position: employee.position,
          bio: employee.bio,
          phone: employee.phone,
          email: employee.email,
          avatarUrl: employee.avatarUrl,
          socialLinks: employee.socialLinks || {},
          themeSettings: employee.themeSettings,
        },
        company: {
          id: company.id,
          name: company.name,
          logoUrl: company.logoUrl,
          description: company.description,
          website: company.website,
          industry: company.industry,
          slug: company.slug,
          themeSettings: company.themeSettings,
        },
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error("🔥 Erro ao buscar perfil público:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  }
);
// server.js - Adicione estas rotas:
app.get("/api/public/company/:slug", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const { slug } = req.params;

    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        themeSettings: true,
        employees: {
          where: { status: "APPROVED" },
          select: {
            id: true,
            fullName: true,
            position: true,
            bio: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Empresa não encontrada",
      });
    }

    res.json({
      success: true,
      company,
      employees: company.employees,
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno",
    });
  }
});
// No server.js, adicione ANTES das rotas de upload geral:
app.post(
  "/api/employee/upload-avatar/:id",
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const employeeId = parseInt(req.params.id);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Nenhum arquivo enviado",
        });
      }

      // URL do avatar
      const avatarUrl = `/api/uploads/${req.file.filename}`;

      // Atualiza no banco
      await prisma.employeeProfile.update({
        where: { id: employeeId },
        data: { avatarUrl },
      });

      res.json({
        success: true,
        avatarUrl,
        message: "Avatar atualizado com sucesso",
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error("Erro no upload do avatar:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  }
);

// ---------- ROTAS ADICIONAIS ----------

// Upload geral
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  res.json({
    success: true,
    fileUrl: `http://localhost:5000/uploads/${req.file.filename}`,
  });
});

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", timestamp: new Date().toISOString() })
);

// Rota raiz
app.get("/", (req, res) =>
  res.json({
    message: "OphuaConnect API",
    version: "1.0.0",
    status: "online",
    endpoints: [
      "/api/auth/login",
      "/api/auth/register/company",
      "/api/auth/register/personal",
      "/api/auth/register/employee/:slug",
      "/api/company/profile",
      "/api/company/dashboard",
      "/api/company/employees",
      "/api/company/upload-logo",
      "/api/admin/companies",
      "/api/upload",
      "/api/health",
    ],
  })
);

// ---------- MIDDLEWARE DE ERROS ----------
app.use((err, req, res, next) => {
  console.error("🔥 ERRO GLOBAL:", err.stack);
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Arquivo muito grande. Máximo: 5MB" });
  }
  res.status(500).json({ error: "Erro interno do servidor" });
});

// Rota não encontrada
app.use("*", (req, res) =>
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.originalUrl,
  })
);

// ---------- INICIAR SERVIDOR ----------
const PORT = process.env.PORT || 5000;
async function startServer() {
  await Database.initialize();
  app.listen(PORT, () => {
    console.log(`🚀 OphuaConnect rodando em http://localhost:${PORT}`);
    console.log(`📁 Uploads disponíveis em: http://localhost:${PORT}/uploads/`);
  });
}
startServer();
