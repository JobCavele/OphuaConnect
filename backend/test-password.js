// test-password.js
const bcrypt = require('bcrypt');

async function testPassword() {
  // Hash atual do admin do banco
  const hash = '$2a$10$jBhhYB.BfskZXf29T2ckkeuFd1Ddr3ydMmb.kd5GcJRG.x67hFLFq';
  
  // Senha que estamos testando
  const password = 'Admin123!';
  
  console.log('=== TESTE DE SENHA ===');
  console.log('Hash do banco:', hash);
  console.log('Senha a testar:', password);
  console.log('Tamanho do hash:', hash.length, 'caracteres');
  
  // Testar comparação
  console.log('\n🔐 Testando comparação bcrypt...');
  try {
    const isValid = await bcrypt.compare(password, hash);
    console.log('✅ Senha válida?', isValid);
    
    if (!isValid) {
      console.log('❌ Senha INCORRETA ou problema no bcrypt');
    }
  } catch (error) {
    console.log('❌ Erro no bcrypt.compare:', error.message);
  }
  
  // Gerar novo hash para comparação
  console.log('\n🔐 Gerando novo hash...');
  try {
    const newHash = await bcrypt.hash(password, 10);
    console.log('Novo hash gerado:', newHash);
    console.log('Começa com $2a$?', newHash.startsWith('$2a$'));
    console.log('Tamanho:', newHash.length, 'caracteres');
    
    // Comparar novo hash com senha
    const newIsValid = await bcrypt.compare(password, newHash);
    console.log('✅ Novo hash funciona?', newIsValid);
  } catch (error) {
    console.log('❌ Erro ao gerar hash:', error.message);
  }
  
  // Testar variações da senha
  console.log('\n🔐 Testando variações da senha:');
  const variations = [
    'Admin123!',      // Original
    'Admin123',       // Sem !
    'admin123!',      // a minúsculo
    'Admin123! ',     // Com espaço no final
    ' Admin123!',     // Com espaço no início
    'Admin123@',      // @ em vez de !
    'Admin123#',      // # em vez de !
  ];
  
  for (const variation of variations) {
    try {
      const isValid = await bcrypt.compare(variation, hash);
      console.log(`${variation}: ${isValid ? '✅ CORRETA' : '❌ incorreta'}`);
    } catch (error) {
      console.log(`${variation}: ❌ ERRO - ${error.message}`);
    }
  }
}

// Executar o teste
testPassword()
  .then(() => {
    console.log('\n=== TESTE CONCLUÍDO ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro no teste:', error);
    process.exit(1);
  });