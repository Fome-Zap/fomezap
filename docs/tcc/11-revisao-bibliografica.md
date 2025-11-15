# 11. Revisão Bibliográfica

## 11.1 Introdução

Esta revisão bibliográfica apresenta os fundamentos teóricos e práticos que embasam as decisões do projeto FomeZap. Cobre conceitos centrais sobre plataformas SaaS e multi-tenancy, arquitetura web moderna (React, Node.js, MongoDB), aspectos de usabilidade e acessibilidade, privacidade de dados (LGPD) e opções de integração para pagamentos e finalização de pedidos (ex.: WhatsApp). Onde possível, a revisão relaciona cada tópico às decisões de projeto adotadas no FomeZap.

## 11.2 SaaS e Multi-Tenancy

Plataformas SaaS (Software as a Service) permitem prover software como um serviço centralizado para múltiplos clientes. Um dos desafios mais relevantes em SaaS é o isolamento e a gestão dos dados de cada cliente (tenant). Padrões de multi-tenancy incluem: (a) banco por tenant, (b) schema por tenant e (c) isolamento lógico por campo `tenantId` em uma mesma base de dados. Cada abordagem tem trade-offs entre custo, isolamento e complexidade operacional (FOWLER, 2002; AMAZON WEB SERVICES, 2020).

No FomeZap optou-se pelo isolamento lógico via `tenantId` em MongoDB. Essa escolha reduz o custo operacional e a complexidade de deploy (um só banco), mas exige disciplina: todas as consultas e operações devem filtrar `tenantId`, é necessário criar índices adequados e proteger endpoints para evitar vazamento entre tenants (FOWLER, 2002).

## 11.3 Arquitetura Web Moderna (React + Node + MongoDB)

A arquitetura escolhida segue o padrão moderno de separação entre frontend (aplicação React) e backend (API REST em Node.js/Express). React provê componentização, gerenciamento de estado via hooks e Context API, o que facilita a construção de UIs reativas e a propagação de informações do tenant pelo aplicativo. Vite é usado como bundler de desenvolvimento por sua rapidez no hot-reload (REACT, 2024).

Node.js com Express é apropriado para APIs leves e escaláveis; combinado com MongoDB (banco document-oriented) oferece flexibilidade de modelagem, especialmente útil para modelos com atributos variáveis (ex.: extras nos produtos) e para iterações rápidas de desenvolvimento (NODE.JS, 2024; MONGODB, 2024).

No projeto, Mongoose é utilizado para modelagem, validação e definição de middlewares (p.ex. filtros de segurança que auxiliam o isolamento por tenant). Índices no MongoDB são configurados para melhorar performance em consultas por `tenantId`, `categoria` e `status` (MONGODB, 2024).

## 11.4 Usabilidade, Mobile-First e Acessibilidade

A aceitação de uma plataforma de cardápio digital depende fortemente da usabilidade mobile-first, pois grande parte dos clientes acessam o serviço via smartphones. Princípios de usabilidade (NIELSEN NORMAN GROUP, 1995) e práticas de acessibilidade (WCAG) orientam decisões de layout, contraste, navegação e feedbacks ao usuário.

No FomeZap, o foco em mobile-first, persistência local do carrinho e feedbacks (toasts, modais) busca reduzir atritos e melhorar a taxa de conversão do pedido (NIELSEN NORMAN GROUP, 1995).

## 11.5 Privacidade e Legislação (LGPD)

A Lei Geral de Proteção de Dados (LGPD) impõe requisitos para coleta, armazenamento e tratamento de dados pessoais no Brasil. Entre as medidas relevantes para o projeto estão: obtenção de consentimento explícito, minimização de dados coletados (guardar apenas o necessário), proteção das credenciais (hashing seguro), comunicação via HTTPS e fornecimento de mecanismos para que titulares possam acessar, corrigir ou excluir seus dados (BRASIL, 2018).

O FomeZap deve incorporar na interface e na documentação do sistema políticas de privacidade e fluxos para atender solicitações de titulares, além de armazenar logs de acesso e operações administrativas quando requerido (BRASIL, 2018).

## 11.6 Pagamentos e Integração com WhatsApp

Para um MVP, o envio de pedidos via WhatsApp é uma alternativa prática e de baixo custo para restaurantes que não desejam integrar um gateway de pagamento imediatamente. A mensagem formatada via `wa.me` simplifica a adesão, porém possui limitações (ausência de confirmação automática de pagamento, dependência do aplicativo cliente).

Futuras versões podem integrar gateways (Stripe, PagSeguro, etc.) para aceitar pagamentos online, reduzir fricção e automatizar confirmação de pedidos.

## 11.7 Conclusão da Revisão

As decisões do projeto FomeZap (isolamento lógico por `tenantId`, stack React/Node/MongoDB, uso de WhatsApp no MVP) estão alinhadas com práticas documentadas na literatura e na indústria para projetos SaaS de baixo custo operacional e alto tempo de entrega. As recomendações geradas pela revisão incluem reforçar as proteções de isolamento por tenant, implementar testes de segurança e delinear um roadmap para integração de pagamentos e analytics por tenant.

## 11.8 Referências (ABNT NBR 6023:2018)

FOWLER, Martin. Patterns of Enterprise Application Architecture. Boston: Addison-Wesley, 2002.

AMAZON WEB SERVICES. Architecting for multi‑tenant SaaS: patterns and best practices. Amazon Web Services, 2020. Disponível em: <https://aws.amazon.com/solutions/saas/>. Acesso em: 15 nov. 2025.

REACT. React — A JavaScript library for building user interfaces. React Project, 2024. Disponível em: <https://reactjs.org/>. Acesso em: 15 nov. 2025.

NODE.JS. Node.js. Node.js Foundation, 2024. Disponível em: <https://nodejs.org/>. Acesso em: 15 nov. 2025.

MONGODB, Inc. Data Modeling — MongoDB Manual. MongoDB Documentation, 2024. Disponível em: <https://www.mongodb.com/docs/manual/core/data-modeling-introduction/>. Acesso em: 15 nov. 2025.

NIELSEN NORMAN GROUP. Ten usability heuristics for user interface design. Nielsen Norman Group, 1995. Disponível em: <https://www.nngroup.com/articles/ten-usability-heuristics/>. Acesso em: 15 nov. 2025.

BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). Diário Oficial da União, 14 ago. 2018. Disponível em: <https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm>. Acesso em: 15 nov. 2025.

STRIPE. Stripe API reference. Stripe Documentation, 2025. Disponível em: <https://stripe.com/docs/api>. Acesso em: 15 nov. 2025.

WHATSAPP (META). WhatsApp Business API — Documentation. Meta for Developers, 2025. Disponível em: <https://developers.facebook.com/docs/whatsapp/>. Acesso em: 15 nov. 2025.

PANDOC. Pandoc — a universal document converter. Pandoc Project, 2025. Disponível em: <https://pandoc.org/>. Acesso em: 15 nov. 2025.

---

Observação: as referências acima foram reformatadas para seguir a estrutura básica da ABNT NBR 6023:2018 (autor, título, local/organização, ano, disponibilidade e data de acesso). Posso enriquecer cada entrada com cidade/edição/DOI quando essas informações bibliográficas estiverem disponíveis ou quando preferir que eu busque metadados (posso fazê-lo automaticamente para obras indexadas). Também posso gerar a seção de referências em ordem alfabética e com espaçamento e recuo conforme a norma (formatação final para Word/LaTeX), se desejar.