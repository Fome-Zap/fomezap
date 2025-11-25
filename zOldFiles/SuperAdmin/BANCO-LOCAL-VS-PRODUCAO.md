# 🎓 ENTENDENDO: BANCO LOCAL vs BANCO DE PRODUÇÃO

## 📋 CONCEITO BÁSICO

Imagine que você tem **2 restaurantes separados:**
- Um na sua casa (para testar receitas) = **BANCO LOCAL**
- Um no centro da cidade (clientes reais) = **BANCO PRODUÇÃO**

**Eles são TOTALMENTE INDEPENDENTES!**

---

## 💻 BANCO LOCAL (Desenvolvimento)

### O que é?
- MongoDB rodando **no seu computador**
- Dados armazenados **no seu HD**
- Só você tem acesso

### Como acessar?
```
mongodb://127.0.0.1:27017/FomeZap
```

### Onde estão os dados?
```
C:\Program Files\MongoDB\Server\7.0\data\
(ou onde você instalou o MongoDB)
```

### Para que serve?
✅ Testar funcionalidades  
✅ Criar tenants de teste  
✅ Experimentar sem medo  
✅ Aprender sem quebrar nada  

### Ver dados:
- MongoDB Compass: `mongodb://localhost:27017`
- Clicar em database `FomeZap`
- Ver collections: `tenants`, `users`, `categorias`, etc.

---

## 🌐 BANCO PRODUÇÃO (MongoDB Atlas)

### O que é?
- MongoDB rodando **na nuvem** (servidores da MongoDB)
- Dados armazenados **na internet**
- Seus clientes reais usam estes dados

### Como acessar?
```
mongodb+srv://usuario:senha@fomezap-prod.mongodb.net/fomezap
```

### Onde estão os dados?
- Servidores MongoDB Atlas (cloud)
- Replicado em vários servidores
- Backup automático

### Para que serve?
✅ Dados dos clientes reais  
✅ Sistema em produção  
✅ Acessível 24/7  
✅ Dados seguros e com backup  

### Ver dados:
**Opção 1 - MongoDB Compass:**
```
mongodb+srv://tffjauds_db_user:SuaSenha@fomezap-prod.mongodb.net/fomezap
```

**Opção 2 - MongoDB Atlas (Web):**
1. https://cloud.mongodb.com
2. Login
3. Cluster: fomezap-prod
4. Browse Collections

---

## 🔄 COMPARAÇÃO LADO A LADO

| Aspecto | LOCAL (127.0.0.1) | PRODUÇÃO (Atlas) |
|---------|-------------------|------------------|
| **Localização** | Seu computador | Nuvem (internet) |
| **Acesso** | Só você | Qualquer lugar |
| **Dados** | Teste/desenvolvimento | Clientes reais |
| **Velocidade** | Muito rápido | Depende da internet |
| **Custo** | Grátis | Pago (após limite) |
| **Backup** | Manual (você faz) | Automático |
| **Segurança** | Se PC quebrar, perde | Replicado e seguro |
| **URL de exemplo** | demo.localhost:5173 | demo.fomezap.com |

---

## 🎯 QUANDO USAR CADA UM?

### Use BANCO LOCAL para:
```
✅ Desenvolver novas funcionalidades
✅ Testar antes de colocar no ar
✅ Criar tenants de teste
✅ Aprender a usar o sistema
✅ Experimentar sem medo de quebrar
```

### Use BANCO PRODUÇÃO para:
```
✅ Criar tenants de clientes reais
✅ Gerenciar dados dos clientes
✅ Fazer alterações que afetam o site online
✅ Quando o backend está no Render
```

---

## ⚠️ ATENÇÃO IMPORTANTE!

### ❌ NÃO SE MISTURAM!

Se você criar um tenant localmente:
- ❌ Ele NÃO aparece em produção
- ❌ Não fica disponível em demo.fomezap.com
- ✅ Só existe no seu computador

Para criar em produção:
1. Trocar `.env` para URI de produção
2. Reiniciar painel
3. Criar tenant
4. Agora sim está online!

---

## 🔧 COMO TROCAR ENTRE OS DOIS

### Arquivo: `SuperAdmin/.env`

**ANTES (local):**
```env
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap
```

**DEPOIS (produção):**
```env
MONGODB_URI=mongodb+srv://tffjauds_db_user:SuaSenha@fomezap-prod.mongodb.net/fomezap
```

**Reiniciar painel:**
```bash
# Parar: Ctrl + C
# Iniciar novamente:
npm run dev
```

**Verificar qual está ativo:**
- Olhar topo do painel
- 💻 DESENVOLVIMENTO = Local
- 🌐 PRODUÇÃO = Atlas

---

## 📊 VISUALIZAR DADOS

### MongoDB Compass (Desktop App)

**Download:** https://www.mongodb.com/try/download/compass

**Vantagens:**
- Interface visual bonita
- Fácil de usar
- Ver, editar, excluir dados
- Funciona local e produção

**Como usar:**

1️⃣ **Abrir Compass**

2️⃣ **Conectar:**

**Local:**
```
mongodb://localhost:27017
```

**Produção:**
```
mongodb+srv://tffjauds_db_user:SuaSenha@fomezap-prod.mongodb.net/fomezap
```

3️⃣ **Navegar:**
- Database: `FomeZap` ou `fomezap`
- Collections: `tenants`, `users`, `categorias`, `produtos`

4️⃣ **Ver dados:**
- Clicar na collection
- Ver documentos (registros)
- Editar, excluir, criar novos

---

## 🎓 EXEMPLO PRÁTICO

### Cenário: Você quer criar tenant "Pizzaria do Zé"

**Opção 1 - TESTAR PRIMEIRO (recomendado):**
```bash
# 1. Usar banco local
# .env: MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap

# 2. Criar tenant no painel
# Nome: Pizzaria do Zé (teste)

# 3. Testar tudo:
# - Acessar localhost:5173?tenant=pizzaria-do-ze
# - Adicionar produtos
# - Testar pedidos
# - Ver se funciona

# 4. Tá tudo ok? Agora criar em produção:
# Trocar .env para produção
# Criar tenant novamente
# Agora sim está online em pizzaria-do-ze.fomezap.com
```

**Opção 2 - DIRETO EM PRODUÇÃO (só se tiver certeza):**
```bash
# 1. Usar banco produção
# .env: MONGODB_URI=mongodb+srv://...

# 2. Criar tenant
# Nome: Pizzaria do Zé

# 3. Já está online!
# pizzaria-do-ze.fomezap.com
```

---

## 🔐 DICA DE SEGURANÇA

**NUNCA compartilhe:**
- ❌ Senha do MongoDB Atlas
- ❌ URI de conexão completa
- ❌ Arquivo `.env`

**Use variáveis de ambiente:**
- ✅ Render: Environment Variables
- ✅ Vercel: Environment Variables
- ✅ Nunca commitar `.env` no Git

---

## 📞 RESUMO EXECUTIVO

**Para aprender/testar:**
```
Use banco LOCAL (mongodb://127.0.0.1:27017/FomeZap)
Ver dados: MongoDB Compass → localhost:27017
```

**Para clientes reais:**
```
Use banco PRODUÇÃO (mongodb+srv://...@fomezap-prod.mongodb.net/fomezap)
Ver dados: cloud.mongodb.com ou Compass com URI de produção
```

**Para trocar:**
```
Editar SuperAdmin/.env
Trocar MONGODB_URI
Reiniciar painel
```

**Para ver qual está ativo:**
```
Olhar topo do painel Super Admin
💻 = Local | 🌐 = Produção
```

---

**Ficou claro? Qualquer dúvida, pergunte! 😊**
