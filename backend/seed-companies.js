// seed-companies.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedCompanies() {
  try {
    console.log('🌱 Iniciando seed de empresas e dados...');
    
    // 1. Verificar/Criar usuário admin
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@ophuaconnect.com' }
    });
    
    if (!adminUser) {
      console.log('👑 Criando usuário admin...');
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@ophuaconnect.com',
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
      console.log('✅ Admin criado:', adminUser.email);
    }
    
    // 2. Verificar/Criar um usuário COMPANY_ADMIN para ser dono das empresas
    let companyAdminUser = await prisma.user.findUnique({
      where: { email: 'company@admin.com' }
    });
    
    if (!companyAdminUser) {
      console.log('🏢 Criando usuário company admin...');
      const hashedPassword = await bcrypt.hash('Company123!', 10);
      
      companyAdminUser = await prisma.user.create({
        data: {
          email: 'company@admin.com',
          password: hashedPassword,
          role: 'COMPANY_ADMIN'
        }
      });
      console.log('✅ Company Admin criado:', companyAdminUser.email);
    }
    
    // 3. Criar empresas de teste
    console.log('🏭 Criando empresas...');
    
    const companies = [
      {
        name: "Tech Solutions Ltda",
        slug: "tech-solutions-ltda",
        website: "https://techsolutions.com",
        description: "Soluções tecnológicas inovadoras",
        status: "ACTIVE",
      },
      {
        name: "Design Studio Creative",
        slug: "design-studio-creative", 
        website: "https://designstudio.com",
        description: "Design criativo e inovador",
        status: "PENDING",
      },
      {
        name: "Marketing Pro Digital",
        slug: "marketing-pro-digital",
        website: "https://marketingpro.com",
        description: "Marketing digital especializado",
        status: "ACTIVE",
      },
      {
        name: "Consulting Experts",
        slug: "consulting-experts",
        website: "https://consultingexperts.com",
        description: "Consultoria empresarial",
        status: "INACTIVE",
      },
      {
        name: "Software House",
        slug: "software-house",
        website: "https://softwarehouse.com",
        description: "Desenvolvimento de software",
        status: "SUSPENDED",
      }
    ];
    
    // 4. Criar cada empresa
    for (const companyData of companies) {
      const existing = await prisma.company.findUnique({
        where: { slug: companyData.slug }
      });
      
      if (!existing) {
        // Criar themeSettings para a empresa
        const themeSettings = await prisma.themeSettings.create({
          data: {
            primaryColor: "#3B82F6",
            secondaryColor: "#1E40AF",
            fontFamily: "Inter"
          }
        });
        
        // Criar empresa
        const company = await prisma.company.create({
          data: {
            name: companyData.name,
            slug: companyData.slug,
            website: companyData.website,
            description: companyData.description,
            status: companyData.status,
            themeSettingsId: themeSettings.id,
            socialLinks: {
              facebook: `https://facebook.com/${companyData.slug}`,
              instagram: `https://instagram.com/${companyData.slug}`,
              linkedin: `https://linkedin.com/company/${companyData.slug}`
            }
          }
        });
        
        // Se for uma empresa ACTIVE, vincular ao companyAdminUser
        if (companyData.status === "ACTIVE") {
          await prisma.companyAdmin.create({
            data: {
              userId: companyAdminUser.id,
              companyId: company.id
            }
          });
          console.log(`✅ Empresa ativa criada: ${company.name} (Admin: ${companyAdminUser.email})`);
        } else {
          console.log(`✅ Empresa criada: ${company.name} (Status: ${company.status})`);
        }
      } else {
        console.log(`⏭️ Empresa já existe: ${companyData.name}`);
      }
    }
    
    // 5. Criar alguns usuários PERSONAL para teste
    console.log('👤 Criando usuários pessoais...');
    
    const personalUsers = [
      {
        email: "joao.silva@email.com",
        password: "User123!",
        fullName: "João Silva",
        phone: "(11) 99999-9999",
        bio: "Desenvolvedor Full Stack"
      },
      {
        email: "maria.santos@email.com", 
        password: "User123!",
        fullName: "Maria Santos",
        phone: "(11) 98888-8888",
        bio: "Designer UX/UI"
      }
    ];
    
    for (const userData of personalUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (!existing) {
        // Criar usuário
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            role: "PERSONAL"
          }
        });
        
        // Criar themeSettings
        const themeSettings = await prisma.themeSettings.create({
          data: {
            primaryColor: "#3B82F6",
            secondaryColor: "#1E40AF",
            fontFamily: "Inter"
          }
        });
        
        // Criar perfil pessoal
        await prisma.personalProfile.create({
          data: {
            fullName: userData.fullName,
            phone: userData.phone,
            bio: userData.bio,
            userId: user.id,
            themeSettingsId: themeSettings.id,
            socialLinks: {
              linkedin: `https://linkedin.com/in/${userData.fullName.toLowerCase().replace(/\s/g, '-')}`
            }
          }
        });
        
        console.log(`✅ Usuário pessoal criado: ${userData.fullName}`);
      }
    }
    
    // 6. Estatísticas finais
    console.log('\n📊 ESTATÍSTICAS FINAIS:');
    
    const totalCompanies = await prisma.company.count();
    const activeCompanies = await prisma.company.count({
      where: { status: "ACTIVE" }
    });
    const pendingCompanies = await prisma.company.count({
      where: { status: "PENDING" }
    });
    const totalUsers = await prisma.user.count();
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });
    
    console.log(`Total de empresas: ${totalCompanies}`);
    console.log(`- Ativas: ${activeCompanies}`);
    console.log(`- Pendentes: ${pendingCompanies}`);
    console.log(`- Inativas/Suspensas: ${totalCompanies - activeCompanies - pendingCompanies}`);
    console.log(`\nTotal de usuários: ${totalUsers}`);
    usersByRole.forEach(role => {
      console.log(`- ${role.role}: ${role._count}`);
    });
    
    console.log('\n🎉 Seed concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no seed:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCompanies();