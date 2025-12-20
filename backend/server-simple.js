// server-simple.js - FUNCIONA SEM BANCO!
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Dados em MEMÓRIA
const users = [
  {
    id: 1,
    email: 'admin@ophuaconnect.com',
    password: 'Admin123!', // Em produção, use hash!
    role: 'SUPER_ADMIN',
    fullName: 'Super Admin'
  }
];

// Login SIMPLES - SEM BANCO
app.post('/api/auth/login', (req, res) => {
  try {
    console.log(' Login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email e senha são obrigatórios' 
      });
    }
    
    // Encontrar usuário
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.log(' Usuário não encontrado');
      return res.status(401).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
    }
    
    // Verificar senha (simples)
    if (user.password !== password) {
      console.log('❌ Senha incorreta');
      return res.status(401).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
    }
    
    // Gerar token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      'ophuaconnect-secret-key-2025',
      { expiresIn: '7d' }
    );
    
    console.log(' Login bem-sucedido!');
    
    // Retornar resposta
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      },
      message: 'Login realizado com sucesso'
    });
    
  } catch (error) {
    console.error(' ERRO no login:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'OphuaConnect API funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'OphuaConnect Platform API',
    status: 'online',
    endpoints: {
      login: 'POST /api/auth/login',
      health: 'GET /api/health'
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
 OPHUACONNECT BACKEND FUNCIONANDO!
 Porta: ${PORT}
 URL: http://localhost:${PORT}
  Frontend: http://localhost:5173

 SUPER ADMIN PRONTO:
 Email: admin@ophuaconnect.com
 Senha: Admin123!

 Login API: POST http://localhost:${PORT}/api/auth/login
 Health check: GET http://localhost:${PORT}/api/health

 ${new Date().toLocaleString()}
  `);
});
