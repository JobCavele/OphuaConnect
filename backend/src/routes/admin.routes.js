// Rota para estatísticas do admin
router.get('/stats', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Contar empresas por status
    const companiesByStatus = await prisma.company.groupBy({
      by: ['status'],
      _count: true
    });
    
    // Converter para objeto mais fácil
    const companyStats = {
      ACTIVE: 0,
      INACTIVE: 0,
      SUSPENDED: 0,
      PENDING: 0
    };
    
    companiesByStatus.forEach(stat => {
      companyStats[stat.status] = stat._count;
    });
    
    // Contar usuários por role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });
    
    // Converter para objeto
    const userStats = {
      PERSONAL: 0,
      EMPLOYEE: 0,
      COMPANY_ADMIN: 0,
      SUPER_ADMIN: 0
    };
    
    usersByRole.forEach(stat => {
      userStats[stat.role] = stat._count;
    });
    
    // Empresas recentes (últimos 7 dias)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentCompanies = await prisma.company.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    });
    
    // Usuários recentes
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    });

    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: {
        // Estatísticas gerais
        totalCompanies: Object.values(companyStats).reduce((a, b) => a + b, 0),
        totalUsers: Object.values(userStats).reduce((a, b) => a + b, 0),
        pendingApprovals: companyStats.PENDING,
        activeCompanies: companyStats.ACTIVE,
        recentCompanies,
        recentUsers,
        
        // Detalhados
        companyStats,
        userStats
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas'
    });
  }
});
