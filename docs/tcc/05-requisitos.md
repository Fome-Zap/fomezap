# 5. Documento de Requisitos

## 5.1 Histórias de Usuário

- Como usuário comum, quero requisitar uma sala para utilização.
- Como administrador, quero inserir as salas da Fatec Jahu na aplicação.
- Como administrador, quero gerenciar as salas da aplicação.
- Como usuário comum, quero gerenciar o meu perfil de usuário.
- Como administrador, quero receber notificações de novos pedidos de agendamento para poder aprová-los ou negá-los.

## 5.2 Requisitos Funcionais

1. Cadastrar usuário
   - Campos: nome completo, e-mail institucional, número de celular, senha.
   - Possível verificação futura por e-mail.

2. Logar na aplicação
   - Autenticação por e-mail institucional e senha.

3. Exibir salas
   - Listagem de salas cadastradas, com filtros planejados para versões futuras.

4. Descrever sala
   - Exibir nome, bloco, número, status e equipamentos; permitir adicionar/remover itens.

5. Agendar sala
   - Seleção de data, horário (início e término) e administrador responsável pela análise; confirmação do agendamento quando disponível.

6. Exibir salas agendadas
   - Listagem de agendamentos criados pelo usuário na aba de perfil.

7. Gerenciar perfil de usuário
   - Edição de dados pessoais do usuário.

8. Gerenciar dados da aplicação
   - Administradores podem inserir, alterar, ocultar, deletar ou exibir salas, equipamentos, cargos, blocos e itens.

9. Confirmar pedido de agendamento de sala
   - Administradores aprovam ou negam requisições.

10. Promover usuários
   - Administradores transformam outros usuários em administradores.

## 5.3 Requisitos Não Funcionais

- Responsividade: A interface deve se adaptar a dispositivos móveis e desktops.
- Disponibilidade: O sistema deve estar acessível nos horários de operação previstos.
- Acessibilidade: Considerar boas práticas de acessibilidade na interface.

## 5.4 Regras de Negócio (Resumo)

- O sistema deve garantir consentimento explícito para tratamento de dados pessoais (LGPD) (BRASIL, 2018).
- Administradores possuem permissões para gerenciar recursos e aprovar agendamentos.
- Agendamentos devem respeitar conflitos de horário e disponibilidade das salas.

---

Fonte: Conteúdo extraído do documento PI (`piAgenda.md`) e adaptado para formato de TCC.