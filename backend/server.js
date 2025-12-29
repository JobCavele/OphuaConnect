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
app.use(express.json());

// ---------- FUNÇÃO AUXILIAR PARA VERIFICAR TOKEN ----------
const verifyToken = (token) => {
  try {
    const jwt = require("jsonwebtoken");
    return jwt.verify(token, process.env.JWT_SECRET || "ophuaconnect-secret-2025");
  } catch {
    return null;
  }
};

// ---------- UPLOAD ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
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
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Apenas imagens são permitidas"));
  },
});

// ---------- ROTAS DE AUTENTICAÇÃO ----------

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    const prisma = new PrismaClient();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email e senha são obrigatórios" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        personalProfile: true,
        companyAdmin: { include: { company: true } },
        employeeProfile: { include: { company: true } },
      },
    });

    if (!user) return res.status(401).json({ success: false, error: "Credenciais inválidas" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ success: false, error: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "ophuaconnect-secret-2025",
      { expiresIn: "7d" }
    );

    let userData = { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };

    if (user.role === "PERSONAL" && user.personalProfile) {
      userData = { ...userData, ...user.personalProfile };
    } else if (user.role === "COMPANY_ADMIN" && user.companyAdmin?.[0]?.company) {
      userData.company = user.companyAdmin[0].company;
    } else if (user.role === "EMPLOYEE" && user.employeeProfile) {
      userData = { ...userData, ...user.employeeProfile, company: user.employeeProfile.company };
    }

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
    const { email, password, fullName, phone, bio, jobTitle, ...social } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: "Campos obrigatórios faltando" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ success: false, error: "Email já registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email, password: hashedPassword, role: "PERSONAL" } });
      const themeSettings = await tx.themeSettings.create({ data: { primaryColor: "#3B82F6", secondaryColor: "#1E40AF" } });
      const personalProfile = await tx.personalProfile.create({
        data: { fullName, phone, bio, jobTitle, userId: user.id, themeSettingsId: themeSettings.id, socialLinks: social },
      });
      return { user, personalProfile };
    });

    const token = jwt.sign({ id: result.user.id, email, role: "PERSONAL" }, process.env.JWT_SECRET || "ophuaconnect-secret-2025", { expiresIn: "7d" });

    res.status(201).json({ success: true, token, user: { ...result.user, ...result.personalProfile } });
    await prisma.$disconnect();
  } catch (error) {
    console.error("🔥 Register personal error:", error);
    res.status(500).json({ success: false, error: "Erro ao criar conta pessoal" });
  }
});

// REGISTER COMPANY (com logo opcional)
app.post("/api/auth/register/company", upload.single("logo"), async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    const prisma = new PrismaClient();
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

    if (!email || !password || !companyName || !fullName) {
      return res.status(400).json({ success: false, error: "Campos obrigatórios faltando" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ success: false, error: "Email já registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = companyName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email, password: hashedPassword, role: "COMPANY_ADMIN" } });
      const themeSettings = await tx.themeSettings.create({ data: { primaryColor: "#3B82F6", secondaryColor: "#1E40AF" } });
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug,
          website,
          description,
          logoUrl: req.file ? `/uploads/${req.file.filename}` : null,
          socialLinks: { facebook, instagram, linkedin, twitter, github },
          themeSettingsId: themeSettings.id,
          status: "ACTIVE",
        },
      });
      await tx.companyAdmin.create({ data: { userId: user.id, companyId: company.id } });
      return { user, company };
    });

    const token = jwt.sign(
      { id: result.user.id, email, role: "COMPANY_ADMIN", companyId: result.company.id },
      process.env.JWT_SECRET || "ophuaconnect-secret-2025",
      { expiresIn: "7d" }
    );

    res.status(201).json({ success: true, token, user: { ...result.user, company: result.company } });
    await prisma.$disconnect();
  } catch (error) {
    console.error("🔥 Company register error:", error);
    res.status(500).json({ success: false, error: "Erro ao criar conta empresarial" });
  }
});

// REGISTER EMPLOYEE (com avatar opcional)
app.post(
  "/api/auth/register/employee/:companySlug",
  upload.single("avatar"),
  express.urlencoded({ extended: true }),
  async (req, res) => {
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

      if (!email || !password || !fullName) {
        return res.status(400).json({ success: false, error: "Campos obrigatórios faltando" });
      }

      const company = await prisma.company.findUnique({ where: { slug: companySlug } });
      if (!company) return res.status(404).json({ success: false, error: "Empresa não encontrada" });

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ success: false, error: "Email já registrado" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data: { email, password: hashedPassword, role: "EMPLOYEE" } });
        const companyTheme = await tx.themeSettings.findUnique({ where: { id: company.themeSettingsId } });
        const themeSettings = await tx.themeSettings.create({
          data: { primaryColor: companyTheme?.primaryColor || "#3B82F6", secondaryColor: companyTheme?.secondaryColor || "#1E40AF" },
        });
        const employeeProfile = await tx.employeeProfile.create({
          data: {
            fullName,
            position,
            phone,
            bio,
            avatarUrl: req.file ? `/uploads/${req.file.filename}` : null,
            userId: user.id,
            companyId: company.id,
            themeSettingsId: themeSettings.id,
            socialLinks: { facebook, instagram, linkedin, twitter, github },
            status: "PENDING",
          },
        });
        return { user, employeeProfile, company };
      });

      const token = jwt.sign(
        { id: result.user.id, email, role: "EMPLOYEE", companyId: company.id, employeeProfileId: result.employeeProfile.id },
        process.env.JWT_SECRET || "ophuaconnect-secret-2025",
        { expiresIn: "7d" }
      );

      res.status(201).json({ success: true, token, user: { ...result.user, ...result.employeeProfile, company } });
      await prisma.$disconnect();
    } catch (error) {
      console.error("🔥 Employee register error:", error);
      res.status(500).json({ success: false, error: "Erro ao criar conta de funcionário" });
    }
  }
);

// ---------- ROTAS DE EMPRESA (COMPANY_ADMIN OU SUPER_ADMIN) ----------
const requireAuthCompanyOrSuper = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ success: false, error: "Token não fornecido" });
  const decoded = verifyToken(auth.split(" ")[1]);
  if (!decoded) return res.status(401).json({ success: false, error: "Token inválido" });
  if (decoded.role !== "COMPANY_ADMIN" && decoded.role !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, error: "Acesso negado" });
  }
  req.user = decoded;
  next();
};

// Dashboard da empresa
app.get("/api/company/dashboard", requireAuthCompanyOrSuper, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    let companyId;
    if (req.user.role === "SUPER_ADMIN") {
      companyId = 1;
    } else {
      const admin = await prisma.companyAdmin.findUnique({ where: { userId: req.user.id } });
      if (!admin) return res.status(403).json({ error: "Admin não vinculado a empresa" });
      companyId = admin.companyId;
    }

    const [totalEmployees, pendingEmployees, activeEmployees] = await prisma.$transaction([
      prisma.employeeProfile.count({ where: { companyId } }),
      prisma.employeeProfile.count({ where: { companyId, status: "PENDING" } }),
      prisma.employeeProfile.count({ where: { companyId, status: "APPROVED" } }),
    ]);
    await prisma.$disconnect();

    res.json({ totalEmployees, pendingApprovals: pendingEmployees, activeEmployees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Lista de funcionários da empresa
app.get("/api/company/employees", requireAuthCompanyOrSuper, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    let companyId;
    if (req.user.role === "SUPER_ADMIN") {
      companyId = 1;
    } else {
      const admin = await prisma.companyAdmin.findUnique({ where: { userId: req.user.id } });
      if (!admin) return res.status(403).json({ error: "Admin não vinculado a empresa" });
      companyId = admin.companyId;
    }

    const employees = await prisma.employeeProfile.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, position: true, status: true, createdAt: true, user: { select: { email: true } } },
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
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Aprovar funcionário (COMPANY_ADMIN / SUPER_ADMIN)
app.patch("/api/company/employees/:id/approve", requireAuthCompanyOrSuper, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    let companyId;
    if (req.user.role === "SUPER_ADMIN") {
      companyId = 1;
    } else {
      const admin = await prisma.companyAdmin.findUnique({ where: { userId: req.user.id } });
      if (!admin) return res.status(403).json({ error: "Admin não vinculado a empresa" });
      companyId = admin.companyId;
    }

    const emp = await prisma.employeeProfile.findUnique({
      where: { id: Number(req.params.id) },
      select: { companyId: true },
    });
    if (!emp || emp.companyId !== companyId) return res.status(404).json({ error: "Funcionário não encontrado" });

    const updated = await prisma.employeeProfile.update({
      where: { id: emp.id },
      data: { status: "APPROVED" },
    });
    await prisma.$disconnect();
    res.json({ success: true, message: "Funcionário aprovado", employee: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Rejeitar funcionário (COMPANY_ADMIN / SUPER_ADMIN)
app.patch("/api/company/employees/:id/reject", requireAuthCompanyOrSuper, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    let companyId;
    if (req.user.role === "SUPER_ADMIN") {
      companyId = 1;
    } else {
      const admin = await prisma.companyAdmin.findUnique({ where: { userId: req.user.id } });
      if (!admin) return res.status(403).json({ error: "Admin não vinculado a empresa" });
      companyId = admin.companyId;
    }

    const emp = await prisma.employeeProfile.findUnique({
      where: { id: Number(req.params.id) },
      select: { companyId: true },
    });
    if (!emp || emp.companyId !== companyId) return res.status(404).json({ error: "Funcionário não encontrado" });

    await prisma.employeeProfile.delete({ where: { id: emp.id } });
    await prisma.$disconnect();
    res.json({ success: true, message: "Funcionário rejeitado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// ---------- ROTAS DE SUPER-ADMIN (GLOBAL) ----------

const requireSuperAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ success: false, error: "Token não fornecido" });
  const decoded = verifyToken(auth.split(" ")[1]);
  if (!decoded || decoded.role !== "SUPER_ADMIN") return res.status(403).json({ success: false, error: "Acesso negado" });
  req.user = decoded;
  next();
};

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
app.get("/api/admin/companies/:id/employees", requireSuperAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const companyId = Number(req.params.id);

    const employees = await prisma.employeeProfile.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, position: true, status: true, createdAt: true, user: { select: { email: true } } },
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
});

// Atualizar empresa
app.patch("/api/admin/companies/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const companyId = Number(req.params.id);
    const { name, description, website, status, primaryColor, secondaryColor } = req.body;

    const company = await prisma.company.update({
      where: { id: companyId },
      data: { name, description, website, status },
    });

    if (primaryColor || secondaryColor) {
      await prisma.themeSettings.update({
        where: { id: company.themeSettingsId },
        data: { primaryColor: primaryColor || undefined, secondaryColor: secondaryColor || undefined },
      });
    }

    await prisma.$disconnect();
    res.json({ success: true, message: "Empresa atualizada", company });
  } catch (err) {
    console.error("PATCH /api/admin/companies/:id", err);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});

// ---------- NOVAS ROTAS SUPER-ADMIN: aprovar / rejeitar QUALQUER funcionário ----------
app.patch("/api/admin/employees/:id/approve", requireSuperAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const id = Number(req.params.id);

    const updated = await prisma.employeeProfile.update({
      where: { id },
      data: { status: "APPROVED" },
    });
    await prisma.$disconnect();
    res.json({ success: true, message: "Funcionário aprovado", employee: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

app.patch("/api/admin/employees/:id/reject", requireSuperAdmin, async (req, res) => {
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
});

// ---------- UPLOAD ----------
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });
  res.json({ success: true, fileUrl: `/uploads/${req.file.filename}` });
});

app.use("/uploads", express.static("uploads"));

// ---------- HEALTH & ROOT ----------
app.get("/api/health", (req, res) => res.json({ status: "OK", timestamp: new Date().toISOString() }));
app.get("/", (req, res) => res.json({ message: "OphuaConnect API", version: "1.0.0", status: "online" }));

// ---------- ERROS ----------
app.use((err, req, res, next) => {
  console.error("🔥 ERRO GLOBAL:", err.stack);
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Arquivo muito grande. Máximo: 5MB" });
  }
  res.status(500).json({ error: "Erro interno do servidor" });
});

app.use("*", (req, res) => res.status(404).json({ error: "Rota não encontrada", path: req.originalUrl }));

// ---------- START ----------
const PORT = process.env.PORT || 5000;
async function startServer() {
  await Database.initialize();
  app.listen(PORT, () => {
    console.log(`🚀 OphuaConnect rodando em http://localhost:${PORT}`);
  });
}
startServer();