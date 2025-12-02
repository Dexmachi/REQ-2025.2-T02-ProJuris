# 🧪 Guia de Teste - Dashboard KPIs

**Feature:** RNF06 - Dashboard de KPIs e Métricas de Desempenho  
**Componente:** `DashboardKPIs.jsx` + Endpoint `/dashboard/kpis`  
**Status:** ✅ Pronto para Teste

---

## 📋 Pré-requisitos

1. ✅ Backend rodando (`python src/backend/run.py`)
2. ✅ Frontend rodando (`npm start` em `frontend/`)
3. ✅ Usuário com papel `socio` logado
4. ✅ Pelo menos algumas demandas cadastradas no banco

---

## 🧪 Roteiro de Testes

### 1. Acessar Dashboard KPIs

**Passos:**
1. Fazer login como sócio
2. No sidebar esquerdo, localizar o item "Dashboard KPIs" (ícone TrendingUp)
3. Clicar em "Dashboard KPIs"

**Resultado Esperado:**
- ✅ Tela do Kanban some
- ✅ Dashboard KPIs aparece
- ✅ 4 cards principais são exibidos
- ✅ Filtro "7 dias" está ativo por padrão
- ✅ Loading state aparece brevemente
- ✅ Dados carregam corretamente

---

### 2. Verificar Cards Principais

**Cards a validar:**

#### Card 1: Volume de Tarefas
- ✅ Ícone CheckCircle (azul)
- ✅ Título "Volume de Tarefas"
- ✅ Exibe: Total, Concluídas, Pendentes
- ✅ Percentual de conclusão calculado corretamente
- ✅ Exemplo: "45 total | 28 concluídas | 17 pendentes | 62.22% conclusão"

#### Card 2: Tempo Médio de Conclusão
- ✅ Ícone Clock (verde)
- ✅ Título "Tempo Médio de Conclusão"
- ✅ Valor em dias (ex: "8.5 dias")
- ✅ Valor baseado apenas em demandas concluídas

#### Card 3: Taxa de Cumprimento
- ✅ Ícone TrendingUp (amarelo)
- ✅ Título "Taxa de Cumprimento de Prazos"
- ✅ Percentual (ex: "85.3%")
- ✅ Considera apenas demandas com prazo definido

#### Card 4: Demandas Atrasadas
- ✅ Ícone AlertTriangle (vermelho)
- ✅ Título "Demandas Atrasadas"
- ✅ Total de atrasadas
- ✅ Quantidade de urgentes atrasadas
- ✅ Exemplo: "6 total | 3 urgentes"

---

### 3. Testar Filtros de Período

#### Teste 3.1: Filtro 7 dias
**Passos:**
1. Clicar no botão "7 dias"

**Resultado Esperado:**
- ✅ Botão "7 dias" fica ativo (background azul)
- ✅ Outros botões ficam inativos (background cinza)
- ✅ Loading state aparece
- ✅ KPIs atualizam com dados dos últimos 7 dias
- ✅ Form de data personalizada some

#### Teste 3.2: Filtro 30 dias
**Passos:**
1. Clicar no botão "30 dias"

**Resultado Esperado:**
- ✅ Botão "30 dias" fica ativo
- ✅ KPIs atualizam com dados dos últimos 30 dias
- ✅ Valores mudam (geralmente aumentam)

#### Teste 3.3: Período Personalizado
**Passos:**
1. Clicar no botão "Personalizado"
2. Preencher "Data Início": 01/11/2024
3. Preencher "Data Fim": 30/11/2024
4. Clicar em "Aplicar Filtro"

**Resultado Esperado:**
- ✅ Form de datas aparece ao clicar "Personalizado"
- ✅ Campos de data são do tipo "date"
- ✅ Botão "Aplicar Filtro" fica visível
- ✅ Após aplicar, KPIs atualizam com período custom
- ✅ Loading state aparece durante atualização

---

### 4. Verificar Seções de Detalhamento

#### Seção 1: Demandas por Status
**Validações:**
- ✅ Título "Demandas por Status" está presente
- ✅ Grid responsivo com cards
- ✅ Cada status tem seu card
- ✅ Nome do status capitalizado (primeira letra maiúscula)
- ✅ Quantidade exibida corretamente
- ✅ Exemplo: "Concluido: 28", "Em_andamento: 12"

#### Seção 2: Demandas por Prioridade
**Validações:**
- ✅ Título "Demandas por Prioridade" está presente
- ✅ Grid responsivo com cards
- ✅ Cada prioridade tem sua cor:
  - Urgente: Vermelho (#ef4444)
  - Alta: Laranja (#f59e0b)
  - Normal: Azul (#3b82f6)
  - Baixa: Cinza (#6b7280)
- ✅ Quantidade exibida corretamente

#### Seção 3: Top 5 Responsáveis
**Validações:**
- ✅ Título "Top 5 Responsáveis" está presente
- ✅ Grid com até 5 cards
- ✅ Cada card mostra:
  - Ícone Users
  - Nome do responsável
  - Quantidade de demandas
- ✅ Ordenado do maior para o menor
- ✅ Exemplo: "João Silva: 12", "Maria Santos: 10"

---

### 5. Testar Navegação

#### Teste 5.1: Voltar ao Kanban
**Passos:**
1. Com Dashboard KPIs aberto
2. Clicar em "Voltar ao Kanban" no header

**Resultado Esperado:**
- ✅ Dashboard KPIs some
- ✅ Kanban Board reaparece
- ✅ Dados do Kanban estão intactos
- ✅ Transição suave

#### Teste 5.2: Re-abrir Dashboard KPIs
**Passos:**
1. Do Kanban, clicar novamente em "Dashboard KPIs" no sidebar

**Resultado Esperado:**
- ✅ Dashboard KPIs reabre
- ✅ Último filtro aplicado é mantido
- ✅ Dados atualizam corretamente

---

### 6. Testar Estados de Loading e Erro

#### Teste 6.1: Loading State
**Como testar:**
1. Usar DevTools Network para simular "Slow 3G"
2. Aplicar um filtro

**Resultado Esperado:**
- ✅ Spinner de loading aparece
- ✅ Mensagem "Carregando KPIs..." exibida
- ✅ Conteúdo antigo some durante loading
- ✅ Após carregar, dados novos aparecem

#### Teste 6.2: Error State
**Como testar:**
1. Parar o backend
2. Tentar aplicar um filtro

**Resultado Esperado:**
- ✅ Mensagem de erro aparece
- ✅ Texto: "Erro ao carregar KPIs: [mensagem]"
- ✅ Cards não ficam quebrados
- ✅ Possível tentar novamente (recarregar página)

---

### 7. Testar Responsividade

#### Teste 7.1: Desktop (> 1024px)
- ✅ 4 cards em 1 linha (ou 2x2)
- ✅ Seções de detalhamento em grid com múltiplas colunas
- ✅ Sidebar visível
- ✅ Botão "Voltar ao Kanban" alinhado à direita

#### Teste 7.2: Tablet (768px - 1024px)
- ✅ Cards adaptam para 2 colunas
- ✅ Seções de detalhamento em 2 colunas
- ✅ Sidebar colapsável
- ✅ Filtros continuam acessíveis

#### Teste 7.3: Mobile (< 768px)
- ✅ Cards em 1 coluna
- ✅ Seções de detalhamento em 1 coluna
- ✅ Filtros empilhados verticalmente
- ✅ Form de data personalizada responsivo
- ✅ Sidebar minimizada por padrão

---

### 8. Validar Cálculos

#### Teste 8.1: Volume de Tarefas
**Cálculo esperado:**
```
total = COUNT(todas demandas no período)
concluidas = COUNT(demandas com status='concluido')
pendentes = total - concluidas
percentual = (concluidas / total) * 100
```

**Validação:**
- ✅ Somar manualmente no banco e comparar
- ✅ Percentual arredondado para 2 casas decimais

#### Teste 8.2: Tempo Médio de Conclusão
**Cálculo esperado:**
```
AVG((data_prazo - data_criacao).days) 
WHERE status = 'concluido'
```

**Validação:**
- ✅ Verificar query no backend
- ✅ Confirmar apenas demandas concluídas são consideradas
- ✅ Valor em dias (pode ter decimais)

#### Teste 8.3: Taxa de Cumprimento
**Cálculo esperado:**
```
cumpridas = COUNT(demandas WHERE prazo >= now() AND prazo IS NOT NULL)
total_com_prazo = COUNT(demandas WHERE prazo IS NOT NULL)
taxa = (cumpridas / total_com_prazo) * 100
```

**Validação:**
- ✅ Demandas sem prazo são ignoradas
- ✅ Percentual entre 0-100%
- ✅ Arredondado para 1 casa decimal

#### Teste 8.4: Demandas Atrasadas
**Cálculo esperado:**
```
atrasadas = COUNT(WHERE status != 'concluido' AND prazo < now())
urgentes_atrasadas = COUNT(WHERE status != 'concluido' AND prazo < now() AND prioridade = 'urgente')
```

**Validação:**
- ✅ Demandas concluídas não contam como atrasadas
- ✅ Apenas demandas com prazo passado
- ✅ Urgentes são subconjunto do total

---

### 9. Testar API Diretamente

#### Request Manual
```bash
# Terminal 1: Obter token
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"socio@projuris.com","senha":"senha123"}'

# Terminal 2: Testar KPIs (substituir <TOKEN>)
curl -X GET "http://localhost:5000/dashboard/kpis?periodo=7" \
  -H "Authorization: Bearer <TOKEN>"

# Terminal 3: Testar período personalizado
curl -X GET "http://localhost:5000/dashboard/kpis?data_inicio=2024-11-01&data_fim=2024-11-30" \
  -H "Authorization: Bearer <TOKEN>"
```

**Resultado Esperado:**
```json
{
  "volume_tarefas": {
    "total": 45,
    "concluidas": 28,
    "pendentes": 17,
    "percentual_conclusao": 62.22
  },
  "tempo_medio_conclusao_dias": 8.5,
  "taxa_cumprimento_prazos": 85.3,
  "demandas_por_status": [...],
  "demandas_por_prioridade": [...],
  "top_responsaveis": [...],
  "demandas_atrasadas": {
    "total": 6,
    "urgentes": 3
  }
}
```

---

### 10. Verificar Console do Navegador

**Durante os testes, confirmar:**
- ✅ Nenhum erro no console
- ✅ Nenhum warning React
- ✅ Requests API com status 200
- ✅ Nenhum memory leak
- ✅ Nenhuma re-renderização infinita

---

## ✅ Checklist Final

Antes de dar como concluído, verificar:

- [ ] Dashboard KPIs acessível via sidebar
- [ ] 4 cards principais exibindo dados corretos
- [ ] 3 filtros de período funcionando (7/30/custom)
- [ ] 3 seções de detalhamento renderizando
- [ ] Navegação Kanban ↔ KPIs fluida
- [ ] Loading states funcionando
- [ ] Error handling adequado
- [ ] Responsivo em mobile/tablet/desktop
- [ ] Cálculos validados manualmente
- [ ] API retornando JSON correto
- [ ] Nenhum erro no console
- [ ] Performance aceitável (< 2s para carregar)
- [ ] Botão "Voltar ao Kanban" funcionando
- [ ] Cores das prioridades corretas
- [ ] Top 5 ordenado corretamente

---

## 🐛 Problemas Conhecidos

*Nenhum problema conhecido até o momento.*

---

## 📞 Reportar Issues

Se encontrar bugs durante os testes:

1. Capturar screenshot
2. Copiar erro do console
3. Anotar passos para reproduzir
4. Verificar logs do backend
5. Criar issue no repositório

---

**Teste realizado em:** ___/___/______  
**Testador:** _________________  
**Status:** [ ] ✅ Aprovado | [ ] ⚠️ Com Ressalvas | [ ] ❌ Reprovado

---

**Versão:** 1.0  
**Última atualização:** 01/12/2025
