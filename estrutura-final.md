FomeZap-MultiTenant/
├── README.md
├── package.json
├── vite.config.js
├── public/
│   ├── configs/                     ← Configurações dos clientes
│   │   ├── template.json           ← Template padrão
│   │   ├── familia-burguer.json    ← Cliente 1
│   │   ├── burguer-do-joao.json    ← Cliente 2
│   │   ├── lanchonete-maria.json   ← Cliente 3
│   │   └── pizzaria-ze.json        ← Cliente N
│   └── assets/                      ← Assets por cliente
│       ├── shared/                  ← Imagens compartilhadas
│       │   ├── default-logo.png
│       │   └── icons/
│       ├── familia-burguer/         ← Assets cliente 1
│       │   ├── logo.jpg
│       │   └── produtos/
│       │       ├── x-bacon.jpg
│       │       └── x-tudo.jpg
│       ├── burguer-do-joao/         ← Assets cliente 2
│       └── lanchonete-maria/        ← Assets cliente 3
├── src/
│   ├── App.jsx                      ← Roteamento principal
│   ├── components/                  ← Componentes reutilizáveis
│   │   ├── CardapioDinamico.jsx
│   │   ├── Header.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   └── PainelAdmin.jsx
│   ├── hooks/                       ← Hooks customizados
│   │   ├── useConfig.js
│   │   ├── useCart.js
│   │   └── useWhatsApp.js
│   ├── utils/                       ← Utilitários
│   │   ├── configLoader.js
│   │   ├── configGenerator.js
│   │   └── formatters.js
│   ├── styles/                      ← Estilos globais
│   │   ├── global.css
│   │   ├── components.css
│   │   └── themes.css
│   └── contexts/                    ← Contextos React
│       ├── ConfigContext.jsx
│       └── CartContext.jsx
├── scripts/                         ← Scripts de automação
│   ├── add-client.js               ← Script para adicionar cliente
│   ├── generate-config.js          ← Gerador de configuração
│   └── deploy.js                   ← Script de deploy
└── docs/                           ← Documentação
    ├── como-adicionar-cliente.md
    ├── personalizacao.md
    └── estrutura-json.md

## 🚀 Deploy
- **Desenvolvimento:** localhost:3000/familia-burguer
- **Produção:** fomezap.com/familia-burguer
- **Alternativa:** familia-burguer.fomezap.com

## 📋 Adicionar Novo Cliente (5 minutos)
1. `npm run add-client "Pizzaria do Zé" pizzaria-ze`
2. Editar: `public/configs/pizzaria-ze.json`
3. Adicionar logo: `public/assets/pizzaria-ze/logo.jpg`
4. Pronto! URL: `fomezap.com/pizzaria-ze`