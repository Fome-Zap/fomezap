# 🚀 GUIA RÁPIDO - SUPER ADMIN

## ⚡ COMO USAR (3 PASSOS)

### 1️⃣ Instalar
```bash
cd SuperAdmin
npm install
```

### 2️⃣ Escolher Banco de Dados

**Arquivo:** `.env`

**Opção A - Banco LOCAL (testar sem afetar produção):**
```env
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap
```

**Opção B - Banco PRODUÇÃO (gerenciar clientes reais):**
```env
MONGODB_URI=mongodb+srv://tffjauds_db_user:SuaSenha@fomezap-prod.mongodb.net/fomezap
```

### 3️⃣ Rodar
```bash
npm run dev
```

Acesse: **http://localhost:3001**

---

## 📊 COMO VER DADOS NO BANCO

### 💻 MongoDB Compass (Recomendado)

**Baixar:** https://www.mongodb.com/try/download/compass

**Conectar Banco Local:**
```
mongodb://localhost:27017
```

**Conectar Banco Produção:**
```
mongodb+srv://tffjauds_db_user:SuaSenha@fomezap-prod.mongodb.net/fomezap
```

### 🌐 MongoDB Atlas (Web)

**Produção apenas:**
1. Acessar: https://cloud.mongodb.com
2. Login
3. Cluster: fomezap-prod
4. Browse Collections

---

## ❓ DÚVIDAS COMUNS

### "Como sei qual banco estou usando?"

No painel, veja o status no topo:
- 💻 DESENVOLVIMENTO = Banco local
- 🌐 PRODUÇÃO = MongoDB Atlas (online)

### "Se eu criar tenant localmente, vai para produção?"

**NÃO!** 
- Local = Dados no seu computador
- Produção = Dados na nuvem

Para mudar, edite `.env` e escolha qual `MONGODB_URI` usar.

### "Como criar tenant para cliente real?"

1. Abrir `.env`
2. Trocar para `MONGODB_URI` de produção
3. Salvar e reiniciar painel
4. Criar tenant normalmente

---

## 🎯 FUNCIONALIDADES

✅ **Criar Tenant**
- Preencher formulário
- Slug gerado automaticamente
- Opção de criar admin junto
- 3 categorias padrão criadas

✅ **Editar Tenant**
- Alterar nome, slug, status
- Ativar/desativar
- Atualizar contatos

✅ **Excluir Tenant**
- Remove tenant + todos os dados
- Ação irreversível
- Confirmação obrigatória

✅ **Ver Estatísticas**
- Quantas categorias
- Quantos produtos
- Quantos usuários

---

**Documentação completa:** `README.md`
