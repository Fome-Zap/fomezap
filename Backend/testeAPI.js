// Teste manual de API - executar no navegador ou Node.js
// Este arquivo serve para testar as rotas manualmente

// ========================================
// TESTE 1: Login
// ========================================
console.log('🔐 Teste 1: Login');
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@demo.com',
    senha: '123456'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Login:', data);
  const token = data.token;
  
  // ========================================
  // TESTE 2: Listar Categorias
  // ========================================
  console.log('\n📁 Teste 2: Listar Categorias');
  return fetch('http://localhost:5000/api/admin/demo/categorias', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(r => r.json())
  .then(categorias => {
    console.log('✅ Categorias:', categorias);
    
    // ========================================
    // TESTE 3: Buscar Configurações
    // ========================================
    console.log('\n⚙️  Teste 3: Buscar Configurações');
    return fetch('http://localhost:5000/api/admin/demo/configuracoes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  })
  .then(r => r.json())
  .then(config => {
    console.log('✅ Configurações:', config);
    
    // ========================================
    // TESTE 4: Criar Categoria
    // ========================================
    console.log('\n➕ Teste 4: Criar Categoria');
    return fetch('http://localhost:5000/api/admin/demo/categorias', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: 'Lanches',
        icone: '🍔'
      })
    });
  })
  .then(r => r.json())
  .then(result => {
    console.log('✅ Categoria criada:', result);
  });
})
.catch(err => console.error('❌ Erro:', err));
