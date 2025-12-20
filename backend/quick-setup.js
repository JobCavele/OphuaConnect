const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function setup() {
  const prisma = new PrismaClient();
  
  try {
    console.log(' CONFIGURAÇÃO RÁPIDA DO OPHUACONNECT');
    console.log('=' .repeat(50));
    
    // 1. Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@ophuaconnect.com' }
    });
    
    if (existing) {
      console.log(' Super Admin já existe!');
      console.log('Email:', existing.email);
      console.log('Role:', existing.role);
      
      // Testar senha
      const testPass = await bcrypt.compare('Admin123!', existing.password);
      console.log('Senha funciona?', testPass ? ' SIM' : ' NÃO');
      
      if (!testPass) {
        const newHash = await bcrypt.hash('Admin123!', 10);
        await prisma.user.update({
          where: { id: existing.id },
          data: { password: newHash }
        });
        console.log(' Senha resetada!');
      }
    } else {
      // 2. Criar novo super admin
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      const superAdmin = await prisma.user.create({
        data: {
          email: 'admin@ophuaconnect.com',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          personalProfile: {
            create: {
              fullName: 'Super Admin',
              themeSettings: {
                create: {
                  primaryColor: '#7C3AED',
                  secondaryColor: '#5B21B6',
                  fontFamily: 'Inter'
                }
              }
            }
          }
        }
      });
      
      console.log(' Super Admin CRIADO com sucesso!');
      console.log('ID:', superAdmin.id);
    }
    
    // 3. Gerar token de teste
    const user = await prisma.user.findUnique({
      where: { email: 'admin@ophuaconnect.com' }
    });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'ophuaconnect-super-secret-jwt-key-2025',
      { expiresIn: '7d' }
    );
    
    console.log('\n PRONTO PARA USAR!');
    console.log('=' .repeat(50));
    console.log(' SUPER ADMIN:');
    console.log('Email: admin@ophuaconnect.com');
    console.log('Senha: Admin123!');
    console.log('Token:', token);
    console.log('\n Frontend: http://localhost:5173');
    console.log(' Backend: http://localhost:5000');
    console.log('\n', new Date().toLocaleString());
    
  } catch (error) {
    console.error(' ERRO:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setup();
