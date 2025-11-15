# Resumo

**Título (provisório):** FomeZap — Plataforma SaaS Multi-tenant de Cardápio Digital

**Resumo:**

FomeZap é uma plataforma SaaS desenvolvida para permitir que restaurantes e estabelecimentos de alimentação criem e gerenciem cardápios digitais personalizados, com roteamento por subdomínios ou slugs, integração com WhatsApp para finalização de pedidos e painel administrativo para gerenciamento de produtos, categorias e pedidos. O sistema foi implementado com arquitetura multi-tenant, garantindo isolamento de dados por tenant (FOWLER, 2002), e utiliza uma stack moderna composta por Node.js/Express no backend (NODE.JS, 2024), MongoDB (Mongoose) como banco de dados (MONGODB, 2024) e React (Vite) no frontend (REACT, 2024).

O projeto inclui funcionalidades essenciais para um MVP: interface responsiva para clientes, sistema de carrinho com persistência local, seleção de extras por produto, integração para envio de pedidos via WhatsApp (WHATSAPP, 2025) e serviços de upload/armazenamento de imagens. No backend, foram modelados schemas para Tenant, Categoria, Produto, Extra e Pedido, além de rotas para gerenciamento e endpoints públicos (MONGODB, 2024).

Este trabalho descreve o processo de concepção, projeto e implementação do sistema, incluindo levantamento de requisitos, arquitetura de software, escolha de tecnologias, implementação das principais funcionalidades, testes de validação e sugestões de trabalhos futuros (pagamentos online, analytics por tenant, templates e autenticação administrativa completa).

**Palavras-chave:** SaaS, multi-tenant, cardápio digital, React, Node.js, MongoDB, arquitetura de software, MVP

---

> Obs: este é um rascunho inicial do resumo; posso ampliá-lo e adaptá-lo ao estilo ABNT ou às exigências da sua banca/orientador quando você confirmar as normas e detalhes adicionais (autor, orientador, curso, data, instituição).