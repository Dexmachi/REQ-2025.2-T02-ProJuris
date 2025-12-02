#  LegisPro

##  Visão Geral

O **LegisPro** é um sistema de gestão de processos jurídicos desenvolvido como projeto acadêmico na disciplina de Requisitos de Software da Universidade de Brasília (UnB). O objetivo principal é superar as limitações do controle manual de processos, trazendo **eficiência operacional, transparência interna e melhor comunicação com clientes**.

O sistema foi pensado para atender às necessidades específicas do escritório **Cortes, Santos Advogados**, que atualmente enfrenta gargalos operacionais no acompanhamento de demandas e utiliza planilhas Excel como principal ferramenta de controle.

---

##  Objetivos do Projeto

* **Geral:** Digitalizar e otimizar o fluxo de trabalho do escritório, reduzindo o uso de planilhas e microgerenciamento manual.
* **Específicos:**

  * Facilitar a visualização de demandas (OE1).
  * Reduzir sobrecarga do sócio na delegação de tarefas (OE2).
  * Minimizar riscos de falhas no cumprimento de prazos (OE3).
  * Melhorar a comunicação com clientes (OE4).
  * Disponibilizar indicadores de desempenho estratégicos (OE5).

---

##  Funcionalidades Principais

### Funcionalidades Base
* Cadastro de usuários e perfis de acesso (sócio/funcionário)
* Painel de controle Kanban com status visual das demandas
* Gestão completa de demandas (criar, editar, excluir, movimentar)
* Colunas personalizáveis do Kanban com cores e tipos de fluxo
* Dashboard de indicadores de desempenho
* Repositório pesquisável de cláusulas e modelos jurídicos

### ✨ Funcionalidades Recém-Implementadas (Dez/2025)

#### 🔐 RN03 - Sistema de Auditoria Compulsória
* Registro automático de todas as ações críticas
* Logs detalhados com usuário, timestamp e mudanças
* Consulta de histórico completo por demanda
* Acesso exclusivo de sócios aos logs completos
* **[Documentação completa →](docs/IMPLEMENTACAO_COMPLETA.md#1-rn03---auditoria-compulsória-de-ações)**

#### 💾 RNF04 - Auto-save de Formulários
* Salvamento automático a cada 2 minutos
* Recuperação de rascunhos ao reabrir formulário
* Limpeza automática após envio bem-sucedido
* Feedback visual para o usuário
* **[Documentação completa →](docs/IMPLEMENTACAO_COMPLETA.md#2-rnf04---auto-save-em-formulários)**

#### 🔔 RN04 - Sistema Completo de Notificações
* **5 tipos de notificações automáticas:**
  * Nova atribuição de demanda
  * Reatribuição de responsável
  * Mudança de status no Kanban
  * Envio para revisão (notifica sócios)
  * Prazo crítico (3 dias antes do vencimento)
* Verificador automático de prazos (cron job)
* API completa para consulta e marcação de lidas
* **[Documentação completa →](docs/NOTIFICACOES.md)**

#### 🔒 RNF01 - Controle de Acesso Robusto (RBAC)
* Papéis bem definidos: Sócio (completo) e Funcionário (restrito)
* Validações em todas as operações críticas
* Retornos HTTP padronizados (403)
* Restrições específicas:
  * Funcionário não pode excluir demandas
  * Funcionário não pode mover para "Concluído"
  * Funcionário não pode mover demandas em "Revisão"
  * Somente sócio gerencia colunas

### 📚 Documentação Disponível
* **[Guia de Uso](docs/GUIA_DE_USO.md)** - Como usar as novas funcionalidades
* **[Implementação Completa](docs/IMPLEMENTACAO_COMPLETA.md)** - Detalhes técnicos
* **[Sistema de Notificações](docs/NOTIFICACOES.md)** - Configuração e uso
* **[Análise de Requisitos](docs/ANALISE_REQUISITOS_IMPLEMENTACAO.md)** - Status de todos os requisitos

---

## Tecnologias Utilizadas

* **Frontend:** React.js
* **Backend:** Node.js + Express
* **Banco de Dados:** MySQL
* **Chatbot:** WhatsApp Business API + Node.js (via BSP como Blip/Twilio)
* **Arquitetura:** MVC (Model-View-Controller)

---

##  Diferenciais

* Workflow visual dinâmico.
* Importação assistida de planilhas Excel.
* Controle de acesso granular e trilhas de auditoria.
* Relatórios automatizados e configuráveis.
* Integração com WhatsApp para notificações a clientes.

---

## Equipe

* **Gestor do Projeto:** Gustavo Oki
* **Orquestrador:** Caio Rocha
* **Analistas de Requisitos:** Caio Soares, Davi Nunes, Lucas Machado, Marcos Filho, Gustavo Oki, Caio Rocha
* **Desenvolvedores:** Davi Nunes, Lucas Machado, Marcos Filho, Gustavo Oki, Caio Soares, Caio Rocha

---

## Impacto Esperado

* Substituição de planilhas por um painel visual claro.
* Redução do tempo de triagem e microgerenciamento.
* Comunicação mais transparente com clientes.
* Maior consistência e velocidade na produção de documentos.
* Eficiência operacional e maior competitividade do escritório.

