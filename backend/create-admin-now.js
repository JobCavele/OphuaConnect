// create-admin-now.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function createAdminNow() {
  console.log(' Criando Super Admin...');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Primeiro, limpe tudo (opcional)
    console.log(' Limpando dados antigos...');
    await prisma.$executeRaw`TRUNCATE TABLE users, personal_profiles, theme_settings CASCADE`;
    
    // 2. Criar hash da senha
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log(' Criando Super Admin...');
    
    // 3. Criar usuário
    const user = await prisma.user.create({
      data: {
        email: 'admin@ophuaconnect.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    });
    
    console.log(' Usuário criado:', user.id);
    
    // 4. Criar perfil pessoal
    const profile = await prisma.personalProfile.create({
      data: {
        fullName: 'Super Admin',
        userId: user.id,
        themeSettings: {
          create: {
            primaryColor: '#7C3AED',
            secondaryColor: '#5B21B6',
            fontFamily: 'Inter'
          }
        }
      },
      include: {
        themeSettings: true
      }
    });
    
    console.log(' Perfil criado:', profile.id);
    
    // 5. Gerar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'ophuaconnect-key-2025',
      { expiresIn: '7d' }
    );
    
    console.log('\n SUPER ADMIN CRIADO COM SUCESSO! ');
    console.log('=' .repeat(50));
    console.log(' Email: admin@ophuaconnect.com');
    console.log(' Senha: Admin123!');
    console.log(' Token:', token);
    console.log(' User ID:', user.id);
    console.log('=' .repeat(50));
    console.log('\n Frontend: http://localhost:5173');
    console.log(' Login API: POST http://localhost:5000/api/auth/login');
    console.log('', new Date().toLocaleString());
    
  } catch (error) {
    console.error(' ERRO:', error.message);
    
    // Tentar método alternativo
    console.log('\n Tentando método alternativo...');
    try {
      // Criar manualmente via SQL
      const hash = await bcrypt.hash('Admin123!', 10);
      console.log('Hash da senha:', hash);
      
      // Mostrar comando SQL para executar manualmente
      console.log('\n Execute no banco manualmente:');
      console.log(`
        INSERT INTO users (email, password, role, created_at, updated_at) 
        VALUES (
          'admin@ophuaconnect.com', 
          '${hash}', 
          'SUPER_ADMIN', 
          NOW(), 
          NOW()
        );
      `);
      
    } catch (e) {
      console.error('Erro no método alternativo:', e.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminNow();
