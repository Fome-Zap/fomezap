# 🍽️ FomeZap

**Plataforma multi-tenant de cardápio digital para restaurantes**

## 📋 Sobre o Projeto

FomeZap é uma solução SaaS que permite a restaurantes, lanchonetes, pizzarias e outros estabelecimentos criar seu próprio cardápio digital com subdomínio personalizado (ex: `restaurante.fomezap.com`).

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

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**FomeZap** - Transformando a experiência gastronômica digital 🚀