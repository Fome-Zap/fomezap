# Sistema Multi-Tenant FomeZap

## 🎯 Conceito
- **1 projeto React** serve **N clientes**
- **Roteamento dinâmico** por slug do cliente
- **Configuração JSON** personalizada por cliente
- **Assets isolados** por cliente

## 📁 Estrutura Simplificada
```
src/
├── App.jsx
│   └── Routes: /:clienteSlug → CarregaConfig(clienteSlug)
├── hooks/
│   └── useConfig(clienteSlug) → carrega JSON do cliente
├── components/ (REUTILIZADOS)
│   ├── Header.jsx
│   ├── ProductCard.jsx
│   ├── Cart.jsx
│   └── CategoryFilter.jsx
└── utils/
    └── configLoader.js → fetch(`/configs/${clienteSlug}.json`)

public/
├── configs/
│   ├── familia-burguer.json    ← Config cliente 1
│   ├── burguer-do-joao.json    ← Config cliente 2
│   └── lanchonete-maria.json   ← Config cliente 3
└── assets/
    ├── familia-burguer/        ← Assets cliente 1
    ├── burguer-do-joao/        ← Assets cliente 2
    └── lanchonete-maria/       ← Assets cliente 3
```

## 🚀 Fluxo de Execução
1. User acessa: `fomezap.com/familia-burguer`
2. React Router captura: `clienteSlug = "familia-burguer"`
3. useConfig carrega: `/configs/familia-burguer.json`
4. Componentes renderizam com os dados do JSON
5. Assets carregam de: `/assets/familia-burguer/`

## ✅ Vantagens
- **1 só código** para manter
- **1 só deploy** para todos os clientes
- **Adicionar cliente** = criar JSON + assets
- **Atualizações** aplicam para todos automaticamente
- **Economia** de infraestrutura
- **Facilidade** de manutenção

## 📋 Para Adicionar Novo Cliente
1. Criar: `public/configs/novo-cliente.json`
2. Criar: `public/assets/novo-cliente/`
3. Pronto! URL: `fomezap.com/novo-cliente`