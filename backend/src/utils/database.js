// utils/database.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

class Database {
  static async initialize() {
    try {
      console.log("🔄 Inicializando banco de dados...");

      // Testar conexão
      await prisma.$queryRaw`SELECT 1`;
      console.log("✅ Conexão com banco estabelecida");

      // Verificar se existe super admin
      const superAdmin = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
      });

      if (!superAdmin) {
        console.log("👑 Criando super admin padrão...");

        const hashedPassword = await bcrypt.hash("Admin123!", 10);

        await prisma.user.create({
          data: {
            email: "admin@ophuaconnect.com",
            password: hashedPassword,
            role: "SUPER_ADMIN",
          },
        });

        console.log(
          "✅ Super admin criado: admin@ophuaconnect.com / Admin123!"
        );
      } else {
        console.log("✅ Super admin já existe");
      }

      console.log("🎉 Banco de dados inicializado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao inicializar banco:", error.message);
      throw error;
    }
  }

  static async getPrisma() {
    return prisma;
  }

  static async disconnect() {
    await prisma.$disconnect();
  }
}

module.exports = Database;
