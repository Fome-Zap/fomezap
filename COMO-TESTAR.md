# 🧪 Como Testar o FomeZap

## 📋 Pré-requisitos

Antes de começar, certifique-se que você tem instalado:

- ✅ **Node.js** (versão 18 ou superior)
- ✅ **MongoDB** (rodando localmente ou MongoDB Atlas)
- ✅ **Git Bash** ou **PowerShell** (para rodar comandos)

---

## 🚀 Passo 1: Verificar MongoDB

O MongoDB precisa estar rodando. Teste no terminal:

```powershell
# Verificar se o MongoDB está rodando
mongo --version
# ou
mongosh --version
```

**Se não estiver rodando:**
- Windows: Abra o "Services" e inicie o serviço "MongoDB"
- Ou instale MongoDB Community: https://www.mongodb.com/try/download/community

---

## 🔧 Passo 2: Instalar Dependências

### Backend
```powershell
cd Backend
npm install
```

### Frontend
```powershell
cd ..\Frontend
npm install
```

---

## 🎯 Passo 3: Criar Dados de Demonstração

Com o MongoDB rodando, vamos popular o banco com dados de teste:

```powershell
# Volte para a pasta Backend (se não estiver nela)
cd ..\Backend

# Inicie o servidor
npm start
```

O servidor vai iniciar na porta **5000**. Você verá algo assim:
```
🚀 FomeZap API rodando na porta 5000
📊 Health check: http://localhost:5000/health
🔍 Debug tenant: http://localhost:5000/detect-tenant
🏪 API Multi-tenant: http://localhost:5000/api/*
📝 ToDo (compatibilidade): http://localhost:5000/ToDo/*
Conectou mongodb
```

### Agora, em outro terminal, crie os dados demo:

Abra seu navegador e acesse:
```
http://localhost:5000/setup-demo
```

Você deve ver uma resposta JSON assim:
```json
{
  "success": true,
  "message": "Dados demo criados com sucesso!",
  "tenant": "demo",
  "testUrl": "http://localhost:5173?tenant=demo"
}
```

✅ **Pronto!** Agora você tem um restaurante demo no banco de dados.

---

## 🎨 Passo 4: Rodar o Frontend

Em um **novo terminal** (mantenha o backend rodando):

```powershell
cd Frontend
npm run dev
```

O Vite vai iniciar o servidor de desenvolvimento, geralmente na porta **5173**:
```
VITE v7.1.2  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🧪 Passo 5: Testar a Aplicação

### Opção 1: Usando Mock Data (atual)

Abra o navegador em:
```
http://localhost:5173/
```

Você deve ver a página do **FomeZapExact** com dados mockados (Lanchonete em Família).

**Teste estas funcionalidades:**
- ✅ Filtrar categorias (Lanches Pão Francês, Hambúrgueres, etc)
- ✅ Adicionar produto ao carrinho
- ✅ Abrir modal de extras (para lanches específicos)
- ✅ Ver carrinho lateral
- ✅ Alterar quantidades
- ✅ Remover itens
- ✅ Finalizar pedido
- ✅ Preencher dados de entrega
- ✅ Enviar para WhatsApp

### Opção 2: Conectar com Backend Real (próximo passo)

Para conectar o frontend com o backend, precisaremos:
1. Criar uma página que busque dados da API
2. Usar o tenant "demo" que criamos

---

## 🔍 Passo 6: Testar as APIs Diretamente

Enquanto o backend está rodando, você pode testar as APIs:

### Health Check
```
GET http://localhost:5000/health
```

### Detectar Tenant
```
GET http://localhost:5000/detect-tenant?tenant=demo
```

### Buscar Configuração do Tenant
```
GET http://localhost:5000/api/config?tenant=demo
```

### Criar um Pedido de Teste
Use uma ferramenta como **Postman**, **Insomnia** ou **Thunder Client** (extensão do VS Code):

```http
POST http://localhost:5000/api/pedidos?tenant=demo
Content-Type: application/json

{
  "cliente": {
    "nome": "João Silva",
    "telefone": "(11) 98888-7777",
    "email": "joao@email.com"
  },
  "itens": [
    {
      "produtoId": "ID_DO_PRODUTO_AQUI",
      "nome": "X-Burger",
      "quantidade": 2,
      "extras": []
    }
  ],
  "entrega": {
    "tipo": "delivery",
    "endereco": "Rua Teste, 123"
  },
  "pagamento": {
    "forma": "dinheiro",
    "status": "pendente"
  },
  "observacoes": "Sem cebola"
}
```

---

## 📊 Verificar Dados no MongoDB

### Usando MongoDB Compass (GUI)
1. Abra MongoDB Compass
2. Conecte em: `mongodb://127.0.0.1:27017`
3. Selecione o banco `ToDo`
4. Veja as collections: `tenants`, `categorias`, `produtos`, `pedidos`

### Usando mongosh (terminal)
```bash
mongosh

use ToDo
db.tenants.find().pretty()
db.produtos.find({ tenantId: "demo" }).pretty()
db.categorias.find({ tenantId: "demo" }).pretty()
```

---

## 🐛 Problemas Comuns

### Backend não inicia
- **Erro:** `Cannot find module`
  - **Solução:** Execute `npm install` na pasta Backend

- **Erro:** `MongoNetworkError`
  - **Solução:** Certifique-se que o MongoDB está rodando

### Frontend não carrega
- **Erro:** `Failed to fetch`
  - **Solução:** Verifique se o backend está rodando na porta 5000

### Página em branco
- **Solução:** Abra o Console do navegador (F12) e veja os erros

---

## 📝 Próximos Passos Após os Testes

Depois de testar o que já funciona, podemos:

1. ✅ **Conectar frontend com backend real**
   - Substituir mockData por chamadas à API
   - Usar axios para buscar dados do tenant

2. ✅ **Melhorar a detecção de tenant**
   - Usar subdomínio em desenvolvimento
   - Configurar Vite para aceitar subdomínios

3. ✅ **Criar painel administrativo**
   - Login de restaurantes
   - CRUD de produtos
   - Upload de imagens

4. ✅ **Sistema de cadastro**
   - Novo restaurante pode se registrar
   - Gerar tenantId automaticamente

---

## 🎉 Checklist de Testes

Marque o que você conseguiu testar:

- [ ] MongoDB conectado
- [ ] Backend rodando na porta 5000
- [ ] Dados demo criados com sucesso
- [ ] Frontend rodando na porta 5173
- [ ] Página do cardápio carregou
- [ ] Consegui adicionar produtos ao carrinho
- [ ] Modal de extras funciona
- [ ] Carrinho abre e fecha
- [ ] Consegui alterar quantidades
- [ ] Modal de finalização abre
- [ ] Link do WhatsApp é gerado corretamente
- [ ] API `/health` responde
- [ ] API `/api/config?tenant=demo` retorna dados

---

**🚀 Boa sorte com os testes! Qualquer erro, me avise que te ajudo a resolver.**
