# 🔍 INSTALAR MONGODB COMPASS - VISUALIZADOR DE DADOS

## 📋 O QUE É?

**MongoDB Compass** é um programa visual para ver e gerenciar dados do MongoDB.

**Pense assim:**
- MongoDB = Banco de dados (invisível)
- Compass = "Explorador de arquivos" para ver os dados

---

## 📥 DOWNLOAD E INSTALAÇÃO

### 1️⃣ Baixar

**Site oficial:**
```
https://www.mongodb.com/try/download/compass
```

**Opções:**
- Windows (recomendado: .exe installer)
- Mac
- Linux

**Tamanho:** ~130 MB

### 2️⃣ Instalar

**Windows:**
1. Executar o arquivo `.exe`
2. Next → Next → Install
3. Aguardar instalação (~2 minutos)
4. Finish

**Mac:**
1. Abrir arquivo `.dmg`
2. Arrastar para pasta Applications
3. Pronto!

### 3️⃣ Abrir pela primeira vez

1. Procurar "MongoDB Compass" no menu iniciar
2. Abrir
3. Tela de conexão aparece

---

## 🔗 CONECTAR NO BANCO

### BANCO LOCAL (seu computador)

**Passo 1:** Garantir que MongoDB está rodando

**Windows (Docker):**
```bash
docker ps
# Deve mostrar container "fomezap-mongodb"
```

**Ou MongoDB instalado:**
```bash
# Ver se MongoDB está rodando
services.msc
# Buscar: MongoDB Server
```

**Passo 2:** Conectar no Compass

```
URI: mongodb://localhost:27017
```

**Clicar:** "Connect"

**Resultado:** Mostra databases, incluindo `FomeZap`

---

### BANCO PRODUÇÃO (MongoDB Atlas)

**Passo 1:** Pegar URI de conexão

**Opção A - Usar a URI que você já tem:**
```
mongodb+srv://tffjauds_db_user:SuaSenha@fomezap-prod.mongodb.net/fomezap
```

**Opção B - Pegar no MongoDB Atlas:**
1. Acessar: https://cloud.mongodb.com
2. Login
3. Cluster: fomezap-prod
4. Botão "Connect"
5. Escolher "Connect using MongoDB Compass"
6. Copiar URI

**Passo 2:** Conectar no Compass

1. Colar URI na caixa de texto
2. Clicar "Connect"
3. Aguardar (~5 segundos)
4. Mostra databases, incluindo `fomezap`

---

## 📂 NAVEGAR NOS DADOS

### Estrutura

```
FomeZap (ou fomezap) ← Database
│
├── tenants          ← Todos os restaurantes/tenants
├── users            ← Todos os usuários (admins)
├── categorias       ← Categorias de todos os tenants
├── produtos         ← Produtos de todos os tenants
├── extras           ← Extras disponíveis
└── pedidos          ← Pedidos dos clientes
```

### Ver Dados de um Tenant Específico

**Exemplo: Ver produtos do tenant "familia"**

1. Abrir database `FomeZap`
2. Clicar em collection `produtos`
3. No filtro, digitar:
```json
{ "tenantId": "familia" }
```
4. Apertar "Find"
5. Mostra apenas produtos deste tenant

---

## 🎯 OPERAÇÕES BÁSICAS

### 1️⃣ VER TODOS OS REGISTROS

1. Abrir collection (ex: `tenants`)
2. Automático mostra todos
3. Rolar para ver mais

### 2️⃣ BUSCAR ESPECÍFICO

**Buscar tenant por slug:**
```json
{ "slug": "familia" }
```

**Buscar usuário por email:**
```json
{ "email": "admin@familia.com" }
```

### 3️⃣ EDITAR REGISTRO

1. Clicar no documento (linha)
2. Botão "Edit Document"
3. Alterar valores
4. "Update"

⚠️ **CUIDADO:** Editar pode quebrar sistema!

### 4️⃣ EXCLUIR REGISTRO

1. Clicar no documento
2. Botão "Delete Document"
3. Confirmar

⚠️ **CUIDADO:** Ação irreversível!

### 5️⃣ CRIAR NOVO REGISTRO

1. Botão "Insert Document"
2. Escrever JSON
3. "Insert"

⚠️ **DIFÍCIL:** Melhor usar painel Super Admin

---

## 📊 EXEMPLOS PRÁTICOS

### Ver todos os tenants cadastrados

```
1. Database: FomeZap
2. Collection: tenants
3. Ver lista completa
```

### Ver produtos do tenant "familia"

```
1. Collection: produtos
2. Filter: { "tenantId": "familia" }
3. Find
```

### Ver usuários admin de todos os tenants

```
1. Collection: users
2. Filter: { "role": "tenant_admin" }
3. Find
```

### Contar quantos produtos tem cada tenant

```
1. Collection: produtos
2. Aggregations (ícone de gráfico)
3. Usar aggregation pipeline (avançado)
```

---

## 🆚 COMPASS vs SUPER ADMIN

| Tarefa | Compass | Super Admin |
|--------|---------|-------------|
| Ver dados | ✅ Excelente | ❌ Não mostra detalhes |
| Criar tenant | ⚠️ Difícil (manual) | ✅ Fácil (formulário) |
| Editar tenant | ⚠️ Requer conhecimento | ✅ Fácil |
| Excluir tenant | ⚠️ Manual, arriscado | ✅ Seguro (exclui tudo relacionado) |
| Buscar dados | ✅ Poderoso | ❌ Limitado |
| Para iniciantes | ⚠️ Intimidante | ✅ Amigável |

**Recomendação:**
- Use **Super Admin** para gerenciar tenants
- Use **Compass** para ver/investigar dados
- Use **Compass** para debug avançado

---

## 💡 DICAS

### Atalhos úteis

```
Ctrl + K = Buscar collection
Ctrl + F = Buscar dentro de documento
Ctrl + N = Nova query
```

### Favoritar conexões

1. Conectar uma vez
2. Salvar nos favoritos
3. Próxima vez: clicar no favorito

### Exportar dados

1. Collection → Export Data
2. Escolher formato (JSON ou CSV)
3. Salvar

### Importar dados

1. Collection → Import Data
2. Escolher arquivo
3. Importar

---

## 🐛 TROUBLESHOOTING

### "Failed to connect"

**Banco local:**
```
✅ MongoDB está rodando?
docker ps (deve mostrar fomezap-mongodb)
```

**Banco produção:**
```
✅ URI está correta?
✅ Senha está certa?
✅ Internet funcionando?
✅ IP permitido no Atlas? (0.0.0.0/0)
```

### "Authentication failed"

```
❌ Senha incorreta na URI
✅ Verificar URI no .env
✅ Copiar URI completa do Atlas
```

### "Network timeout"

```
❌ Firewall bloqueando
❌ Internet lenta/instável
✅ Tentar VPN
✅ Verificar MongoDB Atlas network access
```

---

## 📸 SCREENSHOTS

**Tela inicial do Compass:**
```
┌─────────────────────────────────────┐
│ New Connection                      │
│                                     │
│ URI: [mongodb://localhost:27017___]│
│                                     │
│          [ Connect ]                │
└─────────────────────────────────────┘
```

**Visualizando database:**
```
┌──────────────────────────────────────┐
│ FomeZap                              │
│  ├─ tenants         (3 documents)   │
│  ├─ users           (5 documents)   │
│  ├─ categorias      (12 documents)  │
│  ├─ produtos        (28 documents)  │
│  └─ pedidos         (156 documents) │
└──────────────────────────────────────┘
```

---

## 🎓 PRÓXIMOS PASSOS

Depois de instalar:

1. ✅ Conectar no banco local
2. ✅ Ver database `FomeZap`
3. ✅ Abrir collection `tenants`
4. ✅ Ver tenants cadastrados
5. ✅ Praticar filtros
6. ✅ Conectar em produção (quando necessário)

---

## 📞 RESUMO RÁPIDO

**Download:**
```
https://www.mongodb.com/try/download/compass
```

**Conectar Local:**
```
mongodb://localhost:27017
```

**Conectar Produção:**
```
mongodb+srv://tffjauds_db_user:SuaSenha@fomezap-prod.mongodb.net/fomezap
```

**Ver tenants:**
```
Database: FomeZap
Collection: tenants
```

**Buscar tenant específico:**
```
Filter: { "slug": "familia" }
```

---

**Fácil né? Agora você pode ver TUDO! 👀**
