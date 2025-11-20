CENTRO PAULA SOUZA
FACULDADE DE TECNOLOGIA DE JAHU
CURSO DE TECNOLOGIA EM DESENVOLVIMENTO DE SOFTWARE MULTIPLATAFORMA






⦁	
DOCUMENTAÇÃO DO PROJETO INTERDISCIPLINAR (PI)






Agenda Fatec
Software de Gerenciamento e Agendamento de Salas








Jaú, SP
3º semestre/2025
Deivide Benedito dos Santos
Pablo Valentin
Pedro Henrique Lucatto
Thiago Franca de Figueredo







DOCUMENTAÇÃO DO PROJETO INTERDISCIPLINAR (PI)







Agenda Fatec
Software de Gerenciamento e Agendamento de Salas








Jaú, SP
3º semestre/2025
SUMÁRIO

1	Descrição do Projeto	6
1.1	Introdução	6
1.2	Cronograma	6
2	Objetivos	7
2.1	Geral	7
2.2	Específicos	7
3	Documento de Requisitos	8
3.1	Histórias de Usuário	8
3.2	Requisitos Funcionais	8
3.2.1	Cadastrar usuário	9
3.2.2	Logar na aplicação	9
3.2.3	Exibir salas	9
3.2.4	Descrever sala	9
3.2.5	Agendar sala	9
3.2.6	Exibir salas agendadas	10
3.2.7	Gerenciar perfil de usuário	10
3.2.8	Gerenciar dados da aplicação	10
3.2.9	Confirmar pedido de agendamento de sala	10
3.2.10	Promover usuários	10
3.3	Requisitos Não Funcionais	10
3.4	Regra de Negócio	11
3.4.1	O que será elaborado?	11
3.4.2	Como será elaborado?	12
3.4.3	Para quem será elaborado?	12
3.4.4	Quanto custará?	13
4	Estudo de Viabilidade	14
4.1	Análise de Mercado (Concorrência, Situação e LGPD)	14
4.2	Análise SWOT (FOFA)	14
4.3	Revisão Financeira e Humana	15
4.4	Análise Técnica	15
4.5	Análise Operacional	16
5	Casos de Uso	17
5.1	Diagrama	18
5.2	Alto Nível	19
5.2.1	Realizar cadastro	19
5.2.2	Realizar login	19
5.2.3	Gerenciar perfil	19
5.2.4	Solicitar sala	20
5.2.5	Visualizar salas cadastradas na aplicação	20
5.2.6	Visualizar salas solicitadas	20
5.2.7	Gerenciar dados da aplicação	20
5.2.8	Confirmar pedido de agendamento de sala	21
5.2.9	Promover usuários	21
5.3	Baixo Nível	21
5.3.1	Solicitar Sala	21
5.3.2	Confirmar pedido de agendamento de sala	22
6	Diagrama de Classes	23
7	Banco de Dados	24
7.1	Diagrama Entidade Relacionamento	24
7.2	Modelo Físico	24
7.3	MongoDB	25
8	Design	26
8.1	Paleta de Cores	26
8.2	Tipografia	27
8.3	Ícone e Logotipo	28
9	Protótipo	30
10	Aplicação	31
10.1	Tela de Cadastro	31
10.2	Tela de Login	32
10.3	Tela de Agendamento de Sala	33
10.4	Tela de Listagem de Salas (Usuário Comum)	34
11	Considerações Finais	35
12	Referências Bibliográficas	36


⦁	Descrição do Projeto

⦁	Introdução

Desenvolver um software de gerenciamento e agendamento de salas com o objetivo de facilitar e otimizar a questão da disponibilidade e utilização das salas da Fatec Jahu.

⦁	Cronograma

Encontra-se a seguir, o link para o acesso ao cronograma criado para este projeto, na ferramenta Trello.

https://trello.com/invite/b/uqG1Or5u/ATTIaec459f631b53ebb7df0857c48b4fa9d5D498EAD/projeto-integrador


















⦁	Objetivos

⦁	Geral

Desenvolver uma aplicação que proporcione praticidade e agilidade em relação ao agendamento e consulta de salas da Fatec Jahu, respectivamente.

⦁	Específicos

⦁	Entrevistar os auxiliares de docente da Fatec Jahu.























⦁	Documento de Requisitos

Um documento de requisitos de um sistema, trata-se de um material que engloba tudo que o sistema proposto deve ser capaz de fazer, e como ele deve se comportar ao executar essas funcionalidades.

⦁	Histórias de Usuário

História de usuário se trata de uma explicação de fácil compreensão, para que o usuário consiga entender uma funcionalidade de um software, sendo uma descrição curta, objetiva e informal. Veja a seguir, alguns exemplos.

⦁	Eu, como usuário comum, quero requisitar uma sala para utilização;

⦁	Eu, como administrador, quero inserir as salas da Fatec Jahu na aplicação;

⦁	Eu, como administrador, quero gerenciar as salas da aplicação;

⦁	Eu, como usuário comum, quero gerenciar o meu perfil de usuário;

⦁	Eu, como administrador, quero poder escolher receber notificações de novos pedidos de agendamento para poder aprová-los ou negá-los.

⦁	Requisitos Funcionais

Veja abaixo, os requisitos funcionais (Funcionalidades esperadas ou necessidades que devem ser atendidas) da aplicação.







⦁	Cadastrar usuário

Os usuários da aplicação devem possuir um cadastro, cujos dados serão seu nome completo, seu e-mail institucional, seu número de celular e uma senha de acesso. Esses dados serão usados para que o usuário seja identificado ao usar a aplicação. Como implementação futura, uma verificação de identidade será enviada para o e-mail informado.

⦁	Logar na aplicação

Os usuários da aplicação usarão seu e-mail institucional e sua senha, informados e cadastrados previamente, para que possam utilizar a aplicação.

⦁	Exibir salas

Exibe as salas que estiverem cadastradas na aplicação para que o usuário comum possa selecionar a que deseja requisitar. A possibilidade de filtragem será implementada na aplicação posteriormente.

⦁	Descrever sala

Exibe os dados da sala (Nome, bloco e número), seu status atual e seus itens (Equipamentos). Também terão as opções de adicionar ou remover itens da sala especificada.

⦁	Agendar sala

Exibe campos para definir uma data, um horário (Início e término) e um administrador, que ficará responsável por analisar a requisição, caso o usuário comum queira requisitar a sala selecionada. Ao final, haverá um botão para confirmar o agendamento, caso a sala esteja disponível.



⦁	Exibir salas agendadas

Serão mostrados todos os agendamentos que o usuário comum já requisitou, dentro da aba de perfil.

⦁	Gerenciar perfil de usuário

Os usuários da aplicação poderão alterar seus dados de perfil.

⦁	 Gerenciar dados da aplicação

Os administradores da aplicação poderão inserir, alterar, ocultar, deletar ou exibir dados de salas, equipamentos, cargos, blocos e itens de salas que estiverem ou virão a ser cadastrados.

⦁	 Confirmar pedido de agendamento de sala

Os administradores da aplicação irão determinar se um pedido de agendamento de uma sala, feito por um usuário comum, deve ser aprovado ou negado.

⦁	 Promover usuários

Os administradores da aplicação poderão transformar outros usuários em administradores.

⦁	Requisitos Não Funcionais

Veja abaixo, os requisitos não funcionais (Qualidade) da aplicação.

⦁	Responsividade;
⦁	Disponibilidade;
⦁	Acessibilidade.

⦁	Regra de Negócio

Veja na Figura 01, que se encontra a seguir, uma representação gráfica do modelo de negócio (Canvas) deste projeto.

Figura 01 - Modelo de Negócio (Canvas)

 

Fonte: os autores.

⦁	O que será elaborado?

⦁	Proposta de Valor

Desenvolver um software de gerenciamento e agendamento de salas com o objetivo de facilitar e otimizar a questão da disponibilidade e utilização das salas da Fatec Jahu.

⦁	Como será elaborado?

⦁	Parcerias Chave

⦁	Fatec Jahu.

⦁	Atividades Chave

⦁	Gerenciamento de salas;
⦁	Agendamento de salas.

⦁	Recursos Chave

⦁	Desenvolvedores (Alunos);
⦁	Computadores;
⦁	Internet;
⦁	Ferramentas de Desenvolvimento (Visual Studio, Visual Studio Code, etc).

⦁	Para quem será elaborado?

⦁	Relação com o cliente

⦁	E-mail;
⦁	WhatsApp (Chatbot).

⦁	Canais

⦁	Redes Sociais (Facebook, Instagram, LinkedIn, etc);
⦁	Site da Fatec Jahu.

⦁	Segmentos de Mercado

⦁	Alunos que frequentam a Fatec Jahu;
⦁	Professores que frequentam a Fatec Jahu;
⦁	Auxiliares de docente da Fatec Jahu.

⦁	Quanto custará?

⦁	Estrutura de Custos

⦁	Hospedagem.

⦁	Fontes de Renda

⦁	Possíveis anúncios;
⦁	Plano/Assinatura de remoção de anúncios, se houverem.























⦁	Estudo de Viabilidade

⦁	Análise de Mercado (Concorrência, Situação e LGPD)

⦁	Sistemas Acadêmicos Personalizados: muitas faculdades já possuem sistemas próprios de agendamento;

⦁	Situação do Mercado: por mais que existam outros sistemas com funcionalidades muito semelhantes, eles não podem ser considerados concorrentes deste projeto, pois foram desenvolvidos especificamente para outras instituições de ensino, enquanto este, foca na Fatec Jahu.

LGPD:

A plataforma deve garantir:

⦁	Consentimento explícito para uso de dados pessoais;

⦁	Segurança de dados com criptografia e autenticação segura;

⦁	Direitos aos usuários para acessar, corrigir e excluir dados.


⦁	 Análise SWOT (FOFA)

Forças:

⦁	Solução personalizada e eficiente;

⦁	Facilidade de uso e aumento da produtividade.

Oportunidades:

⦁	Mercado crescente, com demanda por digitalização;

⦁	Possibilidade de expandir para outras instituições.



Fraquezas:

⦁	Adaptação inicial ao novo sistema.

Ameaças:

⦁	Mudanças na legislação (LGPD);

⦁	Rápida evolução tecnológica, o que pode exigir atualizações constantes.

⦁	 Revisão Financeira e Humana

Custos:

⦁	Desenvolvimento: será feito pelo próprio grupo, sem custos envolvendo a mão de obra;

⦁	Hospedagem e softwares externos: por se tratar de um projeto envolvendo uma instituição de ensino, sendo realizado na mesma, não é necessário arcar com os custos de servidores, softwares utilizados na construção da aplicação, internet ou máquinas, pois estes recursos são fornecidos pela própria instituição.

Recursos Humanos:

⦁	Equipe de Desenvolvimento: grupo composto por quatro pessoas, que frequentam a instituição de ensino, sendo programadores e designers;

⦁	Suporte e Treinamento: equipe interna, para dar suporte e treinar usuários para utilização da aplicação.

⦁	 Análise Técnica

⦁	Tecnologias: uso de C# e MongoDB, permitindo validações e persistência de dados;

⦁	Segurança: implementação de um login seguro através de padronizações do framework ASP.NET Core, da plataforma DotNet.

⦁	Análise Operacional

⦁	Suporte ao Usuário: treinamento contínuo e suporte técnico disponível;

⦁	Manutenção e Atualizações: a plataforma será monitorada, garantindo um funcionamento adequado;

⦁	Escalabilidade: a plataforma será escalável para outras instituições, se necessário.

Conclui-se que o projeto é viável tanto tecnicamente quanto financeiramente, já que não há custos com uma equipe externa e os benefícios operacionais são claros. Com um ROI positivo, a plataforma atende às necessidades da instituição e garante conformidade com a LGPD. Além disso, devido ao fato de haver uma baixa concorrência, uma solução adaptada pode se destacar no mercado.





















⦁	Casos de Uso

Um caso de uso se trata de uma representação de uma ação que pode ser executada em uma aplicação e quem é o responsável por executá-la. Veja na Figura 02, que se encontra a seguir, o diagrama de casos de uso do Agenda Fatec.




























⦁	Diagrama

Figura 02 - Diagrama de Casos de Uso

 

Fonte: os autores.


⦁	Alto Nível

⦁	Realizar cadastro

Caso de Uso
Realizar cadastro
Descrição
Um usuário (Comum ou administrador), que ainda não possua um cadastro, deve fazê-lo para que possa efetuar login na aplicação.

⦁	Realizar login

Caso de Uso
Realizar login
Descrição
Um usuário (Comum ou administrador), que já estiver previamente cadastrado, deve efetuar login na aplicação para que possa acessar as funcionalidades disponíveis (Agendamento, etc) e ser identificado pelos administradores.

⦁	Gerenciar perfil

Caso de Uso
Gerenciar perfil
Descrição
Um usuário (Comum ou administrador), que já estiver previamente logado na aplicação, poderá editar dados de seu perfil, como nome de usuário, e-mail, etc.






⦁	Solicitar sala

Caso de Uso
Solicitar sala (Agendamento)
Descrição
Um usuário comum, que já estiver previamente logado na aplicação, poderá solicitar uma sala para utilização em um dia e intervalo de tempo especificados.

⦁	Visualizar salas cadastradas na aplicação

Caso de Uso
Visualizar salas cadastradas na aplicação
Descrição
Um usuário (Comum ou administrador), que já estiver previamente logado na aplicação, poderá visualizar todas as salas listadas pela aplicação.

⦁	Visualizar salas solicitadas

Caso de Uso
Visualizar salas solicitadas
Descrição
Um usuário comum, que já estiver previamente logado na aplicação, poderá visualizar todos os agendamentos que já criou, tendo sido aprovados ou não.

⦁	Gerenciar dados da aplicação

Caso de Uso
Gerenciar dados da aplicação
Descrição
Um administrador, que já estiver previamente logado na aplicação, poderá cadastrar, editar, desativar ou excluir salas, equipamentos, cargos, blocos e itens de salas na aplicação, garantindo que sempre haja uma listagem de dados atualizada.

⦁	Confirmar pedido de agendamento de sala

Caso de Uso
Confirmar pedido de agendamento de sala
Descrição
Um administrador, que já estiver previamente logado na aplicação, poderá aprovar ou negar uma requisição de utilização de sala feita por um usuário comum.

⦁	Promover usuários

Caso de Uso
Promover usuários
Descrição
Um administrador, que já estiver previamente logado na aplicação, poderá transformar outros usuários em administradores.

⦁	Baixo Nível

⦁	Solicitar Sala

Caso de Uso
Solicitar sala (Agendamento)
Ator(es)
Usuário comum (Aluno, professor, etc)
Finalidade
Permitir que um usuário comum possa requisitar uma sala para utilização.
Visão Geral
Um usuário comum, ao estar logado na aplicação, poderá consultar as salas existentes no sistema, selecionar a que melhor atende as suas demandas e requisitá-la para utilização, precisando aguardar a confirmação de um administrador da aplicação.
Tipo
Primário
Referências Cruzadas
3.2.1, 3.2.2, 3.2.3 e 3.2.4
⦁	
⦁	Confirmar pedido de agendamento de sala

Caso de Uso
Confirmar pedido de agendamento de sala
Ator(es)
Administrador
Finalidade
Confirmar se quem requisitou a sala tem a permissão para utilizá-la.
Visão Geral
Após uma sala ser requisitada para uso, por um usuário comum, o administrador responsável pela aplicação no momento deverá aprovar ou negar a requisição, a depender da situação atual ou dos seus critérios de avaliação.
Tipo
Primário
Referências Cruzadas
3.2.1, 3.2.2, 3.2.3, 3.2.4 e 3.2.8













⦁	Diagrama de Classes

Um diagrama de classes se trata de uma representação gráfica de todas as as entidades existentes por trás da aplicação (Back-End), representando suas propriedades, métodos e relações que possuem entre si. Veja na Figura 03, que se encontra a seguir, o diagrama de classes do Agenda Fatec.

Figura 03 - Diagrama de Classes

 

Fonte: os autores.




⦁	Banco de Dados

⦁	Diagrama Entidade Relacionamento

Um diagrama entidade relacionamento, ou DER, abreviando, trata-se de uma representação gráfica abstrata de um banco de dados, ou seja, o banco de dados real ainda não existe nesta etapa. Veja na Figura 04, que se encontra a seguir, o DER do banco de dados do Agenda Fatec.

Figura 04 - Diagrama Entidade Relacionamento (DER)

 

Fonte: os autores.

⦁	Modelo Físico

O modelo físico de um banco de dados refere-se a uma representação gráfica de um banco de dados já existente e disponível para uso. Veja na Figura 05, que se encontra a seguir, o modelo físico do banco de dados do Agenda Fatec.




Figura 05 - Modelo Físico

 

Fonte: os autores.

⦁	MongoDB

Os dois últimos tópicos referem-se ao banco de dados do projeto do ponto de vista relacional, mas devido ao grande volume de dados da aplicação, o banco de dados utilizado atualmente é não relacional, sendo o MongoDB, que armazena os dados em formato JSON (Java Script Object Notation).




⦁	Design

⦁	Paleta de Cores

Encontram-se nas Figuras 06, 07, 08 e 09, as cores utilizadas para a criação dos wireframes feitos no Figma e do protótipo HTML. Vale destarcar, que, por se tratar de um software voltado a ajudar a Fatec Jahu, suas cores foram escolhidas de acordo com as cores do próprio site da instituição, e, também, do Centro Paula Souza (CPS). Veja a seguir, a paleta de cores deste projeto.

Figura 06 - Vermelho - Centro Paula Souza (CPS)








Fonte: Centro Paula Souza.

Figura 07 - Azul - Centro Paula Souza (CPS)








Fonte: Centro Paula Souza.





Figura 08 - Preto Puro









Fonte: os autores.

Figura 09 - Branco Puro








Fonte: os autores.

⦁	Tipografia

A tipografia escolhida para ser utilizada no Agenda Fatec, foi a Trebuchet MS, um estilo de fonte sem serifa, projetada e desenvolvida em 1996, por Vincent Connare, da Microsoft, tendo uma aparência forte e inconfundível. Veja um exemplo dela na Figura 10, que se encontra a seguir.

Figura 10 - Trebuchet MS (Exemplo)

 

Fonte: Microsoft Learn.

⦁	Ícone e Logotipo

O ícone e logotipo do Agenda Fatec, foram desenvolvidos se inspirando nas cores utilizadas pela rede de ensino Fatec, muito semelhantes às cores utilizadas pelo Centro Paula Souza (CPS). Analise-os nas Figuras 11 e 12, que se encontram a seguir.

Figura 11 - Ícone (Agenda Fatec)

 

Fonte: os autores.











Figura 12 - Logotipo (Agenda Fatec)

 

Fonte: os autores.
















⦁	Protótipo

Encontra-se a seguir, o link para o acesso ao protótipo desenvolvido para este projeto, na ferramenta Figma.

https://www.figma.com/file/0YOvLh2Zu1DpA57Q6KdQkl/Projeto-Integrador?type=design&node-id=1-3&mode=design&t=IqclwaukEFLuiWzw-0


























⦁	Aplicação

Encontra-se a seguir, links relacionados à aplicação do projeto.

Organização (GitHub): https://github.com/Agenda-Fatec

Repositório (GitHub): https://github.com/Agenda-Fatec/App_Agenda_Fatec_DotNet

Aplicação (Beta): https://agenda-fatec.infinityfreeapp.com

Veja nas Figuras 13, 14, 15 e 16, que se encontram a seguir, imagens de algumas das telas da aplicação citada na linha anterior.

⦁	Tela de Cadastro

Figura 13 - Tela de Cadastro de Usuário

 

Fonte: Aplicação - Agenda Fatec.



⦁	Tela de Login

Figura 14 - Tela de Login de Usuário

 

Fonte: Aplicação - Agenda Fatec.















⦁	Tela de Agendamento de Sala

Figura 15 - Tela de Agendamento de Sala

 

Fonte: Aplicação - Agenda Fatec.















⦁	Tela de Listagem de Salas (Usuário Comum)

Figura 16 - Tela de Listagem de Salas

 

Fonte: Aplicação - Agenda Fatec.


⦁	












⦁	Considerações Finais

Apesar das dificuldades, grande parte das metas estabelecidas, para este semestre, foram cumpridas. O reaproveitamento e a adaptação do código do projeto, devido ao fato da troca do ambiente de execução da aplicação (PHP → C#) e do método de persistência dos dados (MySQL → MongoDB), demonstraram ser desafiadores, mas, com análise e paciência, foi possível atingir o resultado final esperado.

























⦁	Referências Bibliográficas

ALIB-MS. Trebuchet MS Font Family - Typography. Disponível em: <https://learn.microsoft.com/pr-br/typography/font-list/trebuchet-ms>. Acesso em: 11 novembro 2024.

CPS. Identidade Visual. Disponível em: <https://www.cps.sp.gov.br/>. Acesso em: 28 maio 2024.

FATECJAHU. Site - Fatec Jahu. Disponível em: <https://fatecjahu.edu.br/>. Acesso em: 13 maio 2024.

USP. Meeting Room Booking System. Disponível em: <https://fcf.usp.br/agenda>. Acesso em:  13 maio 2024.

WORKSPACE. GOOGLE. Agendamento e calendário online partilháveis – Calendário do Google. Disponível em: <https://workspace.google.com/intl/pt-PT/products/calendar/>. Acesso em: 13 maio 2024.




OBS: é copiado/colado de um documento word, no qual pode faltar muitas coisas por conta de formato e até imagens.