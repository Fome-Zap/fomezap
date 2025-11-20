# 🍽️ FomeZap

**Plataforma multi-tenant de cardápio digital para restaurantes**

## 📋 Sobre o Projeto

FomeZap é uma solução SaaS que permite a restaurantes, lanchonetes, pizzarias e outros estabelecimentos criar seu próprio cardápio digital com subdomínio personalizado (ex: `restaurante.fomezap.com`).

## 📁 Estrutura do Projeto

```
FomeZap/
├── Backend/           # Servidor Node.js + Express + MongoDB
│   ├── index.js      # 🚀 Servidor principal (ESSENCIAL)
│   ├── createSuperAdmin.js  # Criar primeiro admin em produção
│   ├── Controllers/   # Lógica de negócio
│   ├── Models/        # Schemas MongoDB
│   ├── Routes/        # Rotas da API
│   ├── Middlewares/   # Autenticação e validação
│   ├── utils/         # Utilitários (email, validações)
│   └── scripts/       # 🔧 Scripts utilitários (ignorados no git)
│
├── Frontend/          # Interface React + Vite
│   ├── src/
│   │   ├── pages/    # Páginas da aplicação
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── contexts/ # Context API (Auth, Carrinho, Tenant)
│   │   └── api/      # Cliente HTTP (Axios)
│   └── public/       # Assets estáticos
│
├── docs/              # 📚 Documentação completa (ignorada no git)
│   ├── TCC/          # Trabalho de Conclusão de Curso (ABNT)
│   ├── README.md     # Índice de documentação
│   └── *.md          # Guias de deploy, arquitetura, etc.
│
└── SuperAdmin/        # Interface super admin (opcional)
```

> **💡 Nota:** As pastas `docs/` e `Backend/scripts/` não afetam o funcionamento do sistema e estão no `.gitignore`.

### ✨ Funcionalidades

#### 👥 **Para Clientes:**
- 📱 Cardápio responsivo e intuitivo
- 🛒 Carrinho de compras integrado
- ➕ Sistema de extras/adicionais
- 📲 Finalização via WhatsApp
- 🏷️ Filtros por categoria

#### 🏪 **Para Restaurantes:**
- 🎨 Subdomínio personalizado
- 📊 Painel administrativo (em desenvolvimento)
- 🔧 Gestão de produtos e categorias
- 🖼️ Upload de imagens
- ⚙️ Configurações personalizáveis

## 🛠️ Tecnologias

### Backend
- **Node.js** + Express
- **MongoDB** + Mongoose
- **Arquitetura multi-tenant**

### Frontend
- **React** + Vite
- **CSS** puro (design responsivo)
- **Componentes funcionais**

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- MongoDB local ou Atlas
- Git

### Backend
```bash
cd Backend
npm install
npm start
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## 📁 Estrutura do Projeto

```
FomeZap/
├── Backend/
│   ├── Controllers/
│   │   ├── PedidoController.js
│   │   └── TenantController.js
│   ├── Models/
│   │   ├── SaaSModels.js
│   │   └── TenantModels.js
│   ├── db/
│   │   └── conn.js
│   └── Routes/
│       └── routes.js
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── FomeZapExact.jsx
│   │   │   └── FomeZapExact.css
│   │   ├── components/
│   │   │   ├── ErrorScreen.jsx
│   │   │   └── LoadingScreen.jsx
│   │   └── data/
│   │       └── mockData.js
└── README.md
```

## 🎯 Roadmap

### ✅ Concluído
- Arquitetura multi-tenant
- Interface do cardápio
- Sistema de carrinho
- Integração WhatsApp
- Design responsivo

### 🔄 Em Desenvolvimento
- Painel administrativo
- CRUD de produtos
- Upload de imagens
- Autenticação

### 📅 Planejado
- Templates por tipo de negócio
- Analytics básicos
- Pagamentos online
- Notificações

## 🤝 Contribuição

Este é um projeto em desenvolvimento ativo. Contribuições são bem-vindas!

## 📚 Documentação

A documentação completa está em `docs/` (não versionada no git):

- **📖 Para Deploy:** `docs/DEPLOY.md` - Guia completo MongoDB Atlas + Render + Vercel
- **🏗️ Para Arquitetura:** `docs/arquitetura-saas.md` e `docs/sistema-multi-tenant.md`
- **🎓 Para TCC:** `docs/TCC/00-ESTRUTURA-TCC.md` - Trabalho acadêmico completo (ABNT)
- **🔧 Para Scripts:** `docs/scripts/README.md` - Documentação dos scripts utilitários
- **📋 Índice Completo:** `docs/README.md`

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**FomeZap** - Transformando a experiência gastronômica digital 🚀