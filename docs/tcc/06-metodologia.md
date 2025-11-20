# 6. Metodologia

## 6.1 Abordagem de desenvolvimento

O desenvolvimento do FomeZap seguiu uma abordagem incremental e orientada a entregas (práticas ágeis). As iterações foram curtas (sprints de 1–2 semanas) e focadas na entrega de incrementos funcionais (MVP → features administrativas → refinamentos). As principais atividades incluíram: levantamento de requisitos, modelagem de dados, implementação, testes básicos, e documentação.

## 6.2 Ferramentas e tecnologias

- Editor/IDE: VS Code
- Controle de versão: Git (GitHub)
- Linguagens: JavaScript (ESModules), HTML, CSS
- Frontend: React + Vite (REACT, 2024)
- Backend: Node.js + Express (NODE.JS, 2024)
- Banco de dados: MongoDB (Mongoose) (MONGODB, 2024)
- Autenticação: JSON Web Tokens (JWT)
- Upload/imagens: Multer + Sharp
- Deploy Frontend: Vercel (configuração para subdomínios)
- Containerização (desenvolvimento/produção): Docker / docker-compose
- Outras: Axios (cliente HTTP), Tailwind/PostCSS (estilos), Lucide React (ícones)

## 6.3 Planejamento e cronograma

O cronograma foi organizado no Trello (link no repositório). As principais etapas do cronograma incluem:
- Sprint 0: Levantamento de requisitos e prototipação (wireframes no Figma)
- Sprint 1: Implementação do Cardápio público, carrinho e persistência local
- Sprint 2: Backend inicial — modelos, rotas públicas e conexão com MongoDB
- Sprint 3: Painel admin (rotas protegidas) e upload de imagens
- Sprint 4: Testes, documentação, deploy e ajustes finais

## 6.4 Recolha e validação de requisitos

Requisitos primários foram documentados com base em entrevistas informais com stakeholders (simulados) e levantamento a partir de protótipos e arquivos legacy (Agenda-Fatec). Requisitos foram transformados em histórias de usuário e priorizados para o MVP.

## 6.5 Testes

- Testes manuais: verificação do fluxo de pedidos, criação/edição de produtos, filtros por categoria e upload de imagens.
- Health check endpoint disponível no backend (`/health`) para verificação do serviço.
- Scripts de população (ex: rota `/setup-demo`) usados para criar dados de demonstração e validar o comportamento do sistema.

---

> Observação: posso detalhar cada subitem (ex.: matriz de riscos, critérios de aceitação por história, plano de testes automatizados) se quiser que eu gere esses artefatos agora.