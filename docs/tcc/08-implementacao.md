# 8. Implementação

Esta seção descreve como as funcionalidades principais foram implementadas, com referências aos arquivos do repositório.

## 8.1 Backend

- Arquivo principal: `Backend/index.js` (NODE.JS, 2024)
  - Configura CORS para permitir subdomínios e origens de desenvolvimento
  - Serves `/uploads` e `/fotos-padrao` como estáticos
  - Registra rotas de autenticação, rotas públicas e rotas admin protegidas
  - Health check (`/health`) e rota de criação de dados demo (`/setup-demo`)

- Modelos: `Backend/Models/TenantModels.js` (MONGODB, 2024)
  - Schemas Mongoose: Tenant, Categoria, Produto, Extra, Pedido
  - Índices para `tenantId` e middlewares `pre` para aplicar filtros de segurança

- Conexão: `Backend/db/conn.js`
  - Conecta ao MongoDB usando `mongoose.connect(uri)`; URI configurado via env var

- Uploads: `Backend/Middlewares/upload.js` + `Controllers/UploadController.js`
  - Processamento de imagens com `multer` e `sharp` para gerar miniaturas e armazenar arquivos

- Autenticação: `Backend/Middlewares/auth.js`
  - Verificação de JWT e funções utilitárias para checar permissões admin/tenant

## 8.2 Frontend

-- Entrypoint: `Frontend/src/main.jsx` e `Frontend/src/App.jsx` (REACT, 2024)
  - Configura `Routes` para o cardápio público, checkout e painel admin

- Página principal: `Frontend/src/pages/FomeZapExact.jsx`
  - Detecta `tenant` via `useSearchParams` (desenvolvimento) ou via `TenantContext` em produção por subdomínio
  - Carrega `tenantData`, `categorias`, `produtos` e `extras` via `API_URL` (MONGODB, 2024)
  - Gerencia `carrinho` com persistência no `localStorage` (chave `carrinho_${tenantId}`) e finaliza pedidos via WhatsApp (WHATSAPP, 2025)
  - Implementa UI de extras, modais de entrega e notificações (toast)

- Painel Admin: `Frontend/src/components/Admin/*` e páginas em `Frontend/src/pages/Admin/*`
  - Rotas protegidas por `ProtectedRoute` que verificam token JWT
  - CRUD de categorias, produtos, extras e pedidos

## 8.3 Banco de Dados

- Uso do MongoDB (collections por entidades)
- Principais coleções: tenants, categorias, produtos, extras, pedidos
- Scripts/rotas de população (`/setup-demo`) criam tenant `demo` e dados de exemplo para testes

## 8.4 Execução local (desenvolvimento)

No PowerShell (Windows) — comandos rápidos:

```powershell
# Backend
cd Backend
npm install
npm run dev    # nodemon index.js

# Frontend
cd ..\Frontend
npm install
npm run dev    # Vite

# MongoDB (local, se não usar Atlas)
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 8.5 Observações de implementação

- Algumas funcionalidades do painel admin ainda estão em desenvolvimento; a prioridade foi o MVP (cardápio público + carrinho + envio WhatsApp).
- O projeto inclui variedade de dependências importantes (mongoose, express, multer, sharp, axios, react-router-dom) e scripts de conveniência.

---

Se quiser, eu gero trechos de código formatados no TCC (ex.: pseudocódigo para `carregarDados()` ou fragmentos de `TenantModels.js`) e adiciono como anexos.