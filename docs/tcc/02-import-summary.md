# Importação e Análise Inicial dos Documentos do PI (Agenda-Fatec)

## Origem
Os documentos fonte estão hospedados no repositório público da organização `Agenda-Fatec` no GitHub:

- Repositório: https://github.com/Agenda-Fatec/Documentos
- Pastas de interesse: `Requisitos/`, `Canvas/`, `Slides/`

Arquivos principais identificados:
- `Requisitos/PI.docx` (1.42 MB) — versão Word do documento do PI (não foi possível baixar automaticamente devido a restrições de rede/raw).
- `Requisitos/PI.pdf` — versão PDF do PI (download automático não concluído).
- `Requisitos/Prioridades.txt` — arquivo de texto com lista de prioridades (baixado com sucesso).
- `Canvas/Resumo.txt` — resumo do canvas (baixado com sucesso).
- `Slides/PI.pptx` e `Slides/PI.pdf` — slides de apresentação.

## O que foi extraído até agora (trechos relevantes)

### Prioridades (trecho)
- Tela de Cadastro e Login; ✔ (Requisito Funcional 01.)
- Tela de apresentação do site; ✔ (Requisito Funcional 02.)
- Tela de exibição dos locais dos blocos e suas salas (integração com agendamento); ❌ (Requisito Funcional 03.)
- Tela de exibição de salas e status (Disponível, indisponível, agendado, em análise); ✔ (Requisito Funcional 04.)
- Tela de exibição de descrição da sala e listagem de equipamentos; ✔ (Requisito Funcional 05.)
- Tela de agendamento (exibição das salas, dias e horários disponíveis); ✔ (Requisito Funcional 06.)
- Tela de listagem de salas que o usuário agendou; ❌ (Requisito Funcional 07.)
- Tela de como utilizar o site. ❌ (Requisito Funcional 08.)

(arquivo completo em `Agenda-Fatec/Documentos/Requisitos/Prioridades.txt`)

### Canvas — Proposta de Valor (trecho)
- Desenvolver um software de gerenciamento e agendamento de salas com o objetivo de facilitar e otimizar a disponibilidade e utilização das salas da Fatec Jahu.

Parcerias-chave: Fatec Jahu.

Atividades-chave: Gerenciamento, Agendamento.

Recursos: Desenvolvedores (Alunos), Computadores, Internet, Ferramentas de Desenvolvimento.

Relacionamento com o Cliente: Email e WhatsApp (Chatbot).

Segmento: Alunos e professores da Fatec Jahu.

Canais: Redes sociais e site da Fatec Jahu.

(arquivo completo em `Agenda-Fatec/Documentos/Canvas/Resumo.txt`)

## Problema encontrado
- O download automático do `PI.docx`/`PI.pdf` falhou (restrição ao obter arquivo raw do GitHub no ambiente atual). Portanto não foi possível converter automaticamente o `.docx` para Markdown.

## Opções para seguir
1. **Você faz upload do arquivo `PI.docx` aqui no workspace** (arrastar/soltar no chat ou dizer onde está no seu sistema) — eu converto para Markdown e mapeio as seções automaticamente.
2. **Você autoriza outro link de download** (por exemplo, um link direto de drive ou Dropbox) — eu baixo e converto.
3. **Continuo com o material já extraído (`Prioridades.txt`, `Resumo.txt`, Slides) e redijo as seções do TCC manualmente** com base nesses e no código do `FomeZap` (menos preciso do que usar o `.docx` completo).

## Recomendação imediata
A rota mais rápida é que você **faça upload do `PI.docx`** aqui (se for possível). Se preferir, posso gerar o esqueleto das seções (Introdução, Objetivos, Revisão Bibliográfica, Metodologia) e preenche-las parcialmente com o conteúdo que já temos.

---

Próximo passo sugerido: envie o `PI.docx` ou confirme que eu prossiga redigindo a partir dos trechos já extraídos. (Tarefa `Solicitar upload do PI.docx` está marcada como em progresso.)