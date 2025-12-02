# Análise de Requisitos Não Funcionais e Regras de Negócio

## Status de Implementação

### SEGURANÇA

#### RNF01 - Controle de Acesso por Perfil (RBAC)
**Status: ✅ IMPLEMENTADO PARCIALMENTE**
- ✅ Backend usa `@token_required` em todas as rotas
- ✅ Validação de role (sócio/funcionário) em operações críticas
- ✅ Funcionários não podem excluir demandas
- ✅ Funcionários não podem mover para "concluído"
- ❌ Falta: Retornar HTTP 403 em todas as validações (algumas retornam 200)
- ❌ Falta: Middleware centralizado de RBAC

**Ações necessárias:**
- Padronizar retorno HTTP 403 para acessos não autorizados
- Revisar todas as rotas para garantir validação de permissões

---

### DESEMPENHO

#### RNF02 - Experiência de Carregamento Ágil
**Status: ✅ IMPLEMENTADO PARCIALMENTE**
- ✅ Spinner de loading existe nos dashboards
- ❌ Falta: Verificar se spinner aparece para ações > 500ms
- ❌ Falta: Loading em outras operações (criar demanda, editar colunas)

**Ações necessárias:**
- Adicionar loading state em CadastrarDemanda
- Adicionar loading state em EditarColunas
- Adicionar loading em EditarDemanda

---

### USABILIDADE

#### RNF03 - Especificações da Interface e Fluxo
**Status: ✅ IMPLEMENTADO**
- ✅ Formulário de cadastro de demanda tem todos os campos obrigatórios
- ✅ Kanban tem colunas configuráveis (já implementado!)
- ✅ Importador ainda não existe, mas estrutura está preparada

---

### CONFIABILIDADE

#### RNF04 - Prevenção de Perda de Dados em Formulários
**Status: ❌ NÃO IMPLEMENTADO**
- ❌ Nenhum formulário tem auto-save com LocalStorage

**Ações necessárias:**
- Implementar auto-save no formulário de cadastro de demanda
- Implementar auto-save no formulário de edição de demanda
- Auto-save a cada 2 minutos usando LocalStorage

---

### CÓDIGO

#### RNF05 - Qualidade e Manutenibilidade do Código
**Status: ⚠️  IMPLEMENTADO PARCIALMENTE**
- ✅ Código está organizado e modular
- ❌ Falta: Code review formal
- ❌ Falta: Testes automatizados (nenhum teste implementado)

**Ações necessárias:**
- Criar testes unitários para funções críticas
- Implementar testes de integração para autenticação

---

### RELATÓRIOS E DASHBOARDS

#### RNF06 - Dashboard de Indicadores
**Status: ⚠️  IMPLEMENTADO PARCIALMENTE**
- ✅ Dashboard sócio mostra estatísticas
- ⚠️  Falta: KPIs completos (volume tarefas concluídas vs pendentes)
- ⚠️  Falta: Tempo médio de conclusão
- ⚠️  Falta: Taxa de cumprimento de prazos
- ❌ Falta: Filtros por período (7 dias, 30 dias, personalizado)

**Ações necessárias:**
- Criar endpoint para cálculo de KPIs
- Adicionar filtros de data no dashboard
- Implementar gráficos de tendência

#### RNF07 - Geração de Relatórios
**Status: ❌ NÃO IMPLEMENTADO**
- ❌ Nenhuma funcionalidade de PDF implementada

**Ações necessárias:**
- Instalar biblioteca de geração de PDF (reportlab ou weasyprint)
- Criar endpoint para gerar relatório em PDF
- Implementar botão "Exportar PDF" no dashboard

#### RNF08 - Visualização de Métricas por Responsável
**Status: ⚠️  IMPLEMENTADO PARCIALMENTE**
- ✅ Funcionários veem apenas suas demandas
- ⚠️  Falta: Métricas específicas (taxa conclusão, demandas atrasadas)
- ❌ Sócios não têm visão consolidada de métricas por responsável

**Ações necessárias:**
- Criar página de métricas por responsável para sócios
- Adicionar cálculo de taxa de conclusão
- Adicionar indicador de demandas atrasadas

---

## REGRAS DE NEGÓCIO

### RN01 - Prevenção de Duplicidade na Importação
**Status: ❌ NÃO IMPLEMENTADO**
- ❌ Funcionalidade de importação não existe

**Ações necessárias:**
- Criar funcionalidade de importação de planilhas
- Validar número da demanda como chave única
- Implementar atualização de demandas existentes

### RN02 - Sincronização de Status (Kanban, Atribuição)
**Status: ✅ IMPLEMENTADO**
- ✅ Drag and drop atualiza status no backend
- ✅ Atualização reflete imediatamente na interface

### RN03 - Auditoria Compulsória de Ações
**Status: ❌ NÃO IMPLEMENTADO**
- ❌ Nenhum sistema de log implementado

**Ações necessárias:**
- Criar tabela de auditoria (logs)
- Registrar ações: criar, editar, excluir demanda, mover no Kanban
- Armazenar: usuário, ação, data/hora, ID demanda

### RN04 - Sistema de Notificações por Evento
**Status: ⚠️  IMPLEMENTADO PARCIALMENTE**
- ✅ Notificações para revisão implementadas
- ⚠️  Falta: Notificações em tempo real (atualmente só no reload)
- ❌ Falta: Notificações de nova atribuição
- ❌ Falta: Notificações de prazo crítico (3 dias antes)
- ❌ Falta: Notificações de mudança de status
- ❌ Falta: Notificações por e-mail (opcional)

**Ações necessárias:**
- Implementar notificação ao atribuir demanda
- Implementar job/cron para verificar prazos críticos
- Implementar notificação em mudanças de status
- (Opcional) Adicionar envio de e-mail

### RN05 - Restrição de Acesso
**Status: ✅ IMPLEMENTADO**
- ✅ Sócios podem criar, editar e excluir demandas
- ✅ Funcionários podem criar e editar, mas não excluir

### RN06 - Processamento em Segundo Plano
**Status: ❌ NÃO IMPLEMENTADO**
- ❌ Funcionalidade de importação não existe

**Ações necessárias:**
- Implementar import com validação assíncrona (Celery ou similar)
- Adicionar barra de progresso
- Notificar usuário ao concluir

### RN07 - Mapear Colunas da Planilha (De-Para)
**Status: ❌ NÃO IMPLEMENTADO**
- ❌ Funcionalidade de importação não existe

**Ações necessárias:**
- Criar interface de mapeamento de colunas
- Salvar mapeamento para reutilização

### RN08 - Destacar Erros na Pré-visualização
**Status: ❌ NÃO IMPLEMENTADO**
- ❌ Funcionalidade de importação não existe

**Ações necessárias:**
- Criar pré-visualização de importação
- Destacar linhas com erros em vermelho
- Exibir tooltip com erro ao passar mouse

### RN09 - Validar Dados e Exibir Pré-visualização
**Status: ❌ NÃO IMPLEMENTADO**
- ❌ Funcionalidade de importação não existe

**Ações necessárias:**
- Validar dados antes de importar
- Exibir tabela com dados válidos (verde) e inválidos (vermelho)
- Permitir correção antes de confirmar

### RN10 - Executar Importação em Lote
**Status: ❌ NÃO IMPLEMENTADO**
- ❌ Funcionalidade de importação não existe

**Ações necessárias:**
- Permitir até 3 importações simultâneas
- Limitar tamanho de arquivo a 5 MB

---

## RESUMO

### ✅ Totalmente Implementado (3/18)
- RN02 - Sincronização de Status
- RN05 - Restrição de Acesso  
- RNF03 - Especificações da Interface

### ⚠️  Parcialmente Implementado (5/18)
- RNF01 - RBAC (falta padronização HTTP 403)
- RNF02 - Loading (falta em alguns componentes)
- RNF05 - Qualidade (falta testes)
- RNF06 - Dashboard (falta KPIs completos)
- RNF08 - Métricas por Responsável
- RN04 - Notificações (falta tempo real e outros eventos)

### ❌ Não Implementado (10/18)
- RNF04 - Auto-save em formulários
- RNF07 - Geração de PDF
- RN01 - Prevenção duplicidade na importação
- RN03 - Auditoria de ações
- RN06-RN10 - Toda funcionalidade de importação

---

## PRIORIDADE DE IMPLEMENTAÇÃO

### 🔴 CRÍTICO (Implementar primeiro)
1. **RN03 - Auditoria de Ações** - Essencial para rastreabilidade
2. **RNF04 - Auto-save** - Previne perda de dados
3. **RN04 - Notificações Completas** - Melhora comunicação da equipe
4. **RNF01 - Padronizar RBAC** - Segurança

### 🟡 IMPORTANTE (Implementar depois)
5. **RNF06 - Dashboard KPIs Completos** - Valor para gestão
6. **RNF07 - Geração de PDF** - Relatórios essenciais
7. **RNF02 - Loading em todos componentes** - UX

### 🟢 DESEJÁVEL (Futuro)
8. **RN01, RN06-RN10 - Importação de Planilhas** - Feature completa
9. **RNF05 - Testes Automatizados** - Qualidade de código
10. **RNF08 - Métricas por Responsável** - Analytics avançado
