# 🔐 PAINEL SUPER ADMIN - GERENCIADOR DE TENANTS

## 📋 O QUE É ISSO?

Painel visual para você gerenciar todos os tenants (clientes) da plataforma FomeZap.

**Aqui você pode:**
- ✅ Ver lista de todos os tenants
- ✅ Criar novo tenant (com dados completos)
- ✅ Editar informações do tenant
- ✅ Ativar/Desativar tenant
- ✅ Excluir tenant
- ✅ Ver estatísticas (produtos, pedidos, usuários)

---

## 🚀 COMO USAR

### **1. Instalar Dependências**
```bash
cd SuperAdmin
npm install
```

### **2. Configurar .env**
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
```

### **3. Rodar o Painel**
```bash
npm run dev
```

### **4. Acessar**
```
http://localhost:3001
```

---

## 🔧 CONFIGURAÇÃO

### **Desenvolvimento (Banco Local)**
```env
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap
PORT=3001
NODE_ENV=development
```

### **Produção (MongoDB Atlas)**
```env
MONGODB_URI=mongodb+srv://tffjauds_db_user:SuaSenha@fomezap-prod.mongodb.net/fomezap
PORT=3001
NODE_ENV=production
```

---

## 📊 COMO VER DADOS NO BANCO

### **Opção 1: MongoDB Compass (Visual - Recomendado)**

**Banco Local:**
1. Baixar: https://www.mongodb.com/try/download/compass
2. Abrir MongoDB Compass
3. Conectar: `mongodb://localhost:27017`
4. Ver database: `FomeZap`
5. Ver collections: `tenants`, `users`, `categorias`, etc.

**Banco Produção:**
1. Abrir MongoDB Compass
2. Conectar: `mongodb+srv://tffjauds_db_user:SuaSenha@fomezap-prod.mongodb.net/fomezap`
3. Ver collections online

### **Opção 2: MongoDB Atlas (Web - Produção)**
```
1. Acessar: https://cloud.mongodb.com
2. Login
3. Cluster: fomezap-prod
4. Browse Collections
5. Database: fomezap
```

---

## 🎯 ESTRUTURA DO PAINEL

```
SuperAdmin/
├── server.js           # Servidor backend do painel
├── package.json        # Dependências
├── .env               # Configuração (não commitado)
├── .env.example       # Exemplo de configuração
├── public/            # Frontend estático
│   ├── index.html     # Página principal
│   ├── styles.css     # Estilos
│   └── app.js         # JavaScript do frontend
└── README.md          # Esta documentação
```

---

## 🔐 SEGURANÇA

**⚠️ IMPORTANTE:**
- Este painel é APENAS para você (dono da plataforma)
- NÃO expor publicamente
- Rodar apenas localmente ou em servidor protegido
- Adicionar autenticação antes de colocar online

---

## 🎓 DIFERENÇA: LOCAL vs PRODUÇÃO

### **Banco Local (Desenvolvimento)**
- Dados ficam no seu computador
- Usar para testes
- Não afeta produção
- Rápido para testar

### **Banco Produção (MongoDB Atlas)**
- Dados na nuvem
- Clientes reais usam estes dados
- CUIDADO ao modificar
- Sempre fazer backup antes

### **Como Escolher?**
```
No .env do SuperAdmin:

# Para testar/desenvolver:
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap

# Para gerenciar clientes reais:
MONGODB_URI=mongodb+srv://...@fomezap-prod.mongodb.net/fomezap
```

---

## 📞 SUPORTE

Se tiver dúvidas:
1. Ler esta documentação
2. Verificar se MongoDB está rodando
3. Verificar se .env está configurado
4. Ver logs do terminal

---

**Criado em:** 15 de Novembro de 2025
**Versão:** 1.0
