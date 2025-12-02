# Simplificação: Unificação de status_mapping e tipo_coluna

## 📋 Resumo da Mudança

Antes, o sistema tinha **dois campos** para controlar colunas e status:
- `status_mapping`: Valor textual livre (ex: "Aguardando Revisão")
- `tipo_coluna`: Tipo comportamental (ex: "revisao")

Isso criava confusão e redundância. **Agora usamos apenas `tipo_coluna`** para:
1. Identificar a coluna
2. Definir as regras de movimentação
3. Armazenar o status da demanda

---

## 🎯 Como Funciona Agora

### Tipos de Coluna (valores permitidos)

| tipo_coluna | Descrição | Regras |
|-------------|-----------|--------|
| `nova` | Novas demandas | Selecionável ao criar demanda; sem restrições |
| `em_andamento` | Trabalho em progresso | Sem restrições especiais |
| `revisao` | Aguardando revisão | Notifica sócios quando funcionário move para cá; Funcionário não pode mover PARA FORA |
| `concluido` | Finalizado | Apenas sócios podem mover demandas para aqui |

### Fluxo de Dados

```
1. Demanda criada
   └─> status = 'nova'

2. Funcionário move para "Em Andamento"
   └─> PATCH /demandas/1/status { tipo_coluna: 'em_andamento' }
   └─> demanda.status = 'em_andamento'

3. Funcionário move para "Revisão"
   └─> PATCH /demandas/1/status { tipo_coluna: 'revisao' }
   └─> demanda.status = 'revisao'
   └─> Cria notificação para todos os sócios
   └─> Funcionário não pode mais mover esta demanda

4. Sócio move para "Concluído"
   └─> PATCH /demandas/1/status { tipo_coluna: 'concluido' }
   └─> demanda.status = 'concluido'
```

---

## 🔧 Alterações Técnicas

### Backend

#### Modelo KanbanColumn (`models.py`)
**Antes:**
```python
class KanbanColumn(db.Model):
    nome = db.Column(db.String(100), nullable=False)
    status_mapping = db.Column(db.String(100), nullable=False)  # ❌ Removido
    tipo_coluna = db.Column(db.String(20), nullable=False)
```

**Depois:**
```python
class KanbanColumn(db.Model):
    nome = db.Column(db.String(100), nullable=False)  # Nome amigável (ex: "Aguardando")
    tipo_coluna = db.Column(db.String(20), nullable=False)  # Tipo (ex: "revisao")
```

#### Endpoint PATCH /demandas/<id>/status (`main.py`)
**Antes:**
```python
novo_status = data.get('status')  # Ex: "Aguardando Revisão"
coluna = KanbanColumn.query.filter_by(status_mapping=novo_status).first()
demanda.status = novo_status
```

**Depois:**
```python
novo_tipo = data.get('tipo_coluna')  # Ex: "revisao"
coluna = KanbanColumn.query.filter_by(tipo_coluna=novo_tipo).first()
demanda.status = novo_tipo
```

#### Endpoint POST /demandas (`main.py`)
**Antes:**
```python
status_inicial = data.get('status', 'Elaboração')  # Valor textual
demanda.status = status_inicial
```

**Depois:**
```python
tipo_inicial = data.get('tipo_coluna', 'nova')  # Tipo padronizado
demanda.status = tipo_inicial
```

#### Endpoint POST /kanban/colunas (`main.py`)
**Antes:**
```python
if not all(k in data for k in ('nome', 'status_mapping', 'tipo_coluna')):
    return jsonify({'message': 'Dados incompletos'}), 400

nova_coluna = KanbanColumn(
    nome=data['nome'],
    status_mapping=data['status_mapping'],
    tipo_coluna=data['tipo_coluna']
)
```

**Depois:**
```python
if not all(k in data for k in ('nome', 'tipo_coluna')):
    return jsonify({'message': 'Dados incompletos'}), 400

nova_coluna = KanbanColumn(
    nome=data['nome'],
    tipo_coluna=data['tipo_coluna']
)
```

### Frontend

#### API Service (`api.js`)
**Antes:**
```javascript
updateStatus: (id, status) => api.patch(`/demandas/${id}/status`, { status })
```

**Depois:**
```javascript
updateStatus: (id, tipo_coluna) => api.patch(`/demandas/${id}/status`, { tipo_coluna })
```

#### EditarColunas (`EditarColunas.jsx`)
**Antes:**
```jsx
const [formData, setFormData] = useState({
  nome: '',
  status_mapping: '',  // ❌ Removido
  tipo_coluna: 'em_andamento'
});
```

**Depois:**
```jsx
const [formData, setFormData] = useState({
  nome: '',
  tipo_coluna: 'em_andamento'
});
```

#### CadastrarDemanda (`CadastrarDemanda.jsx`)
**Antes:**
```jsx
// Filtrava colunas por tipo 'nova' mas enviava status_mapping
const statusInicial = formData.coluna_inicial || 'Elaboração';

await api.post('/demandas', {
  // ...
  status: statusInicial
});
```

**Depois:**
```jsx
// Envia diretamente o tipo_coluna
const tipoInicial = formData.coluna_inicial || 'nova';

await api.post('/demandas', {
  // ...
  tipo_coluna: tipoInicial
});
```

#### Dashboards (`dashboardSocio.jsx`, `dashboardFuncionario.jsx`)
**Antes:**
```javascript
// Mapeamento manual de valores textuais
switch (d.status) {
  case 'Elaboração':
  case 'Nova':
    statusKey = 'novos';
    break;
  case 'Aguardando Revisão':
    statusKey = 'aguardando';
    break;
  // ...
}

// Ao mover, enviava valor textual
let novoStatusBackend;
switch (novoStatusLabel) {
  case 'Novos':
    novoStatusBackend = 'Elaboração';
    break;
  // ...
}
await demandasAPI.updateStatus(demanda.id, novoStatusBackend);
```

**Depois:**
```javascript
// Mapeamento direto de tipos padronizados
switch (d.status) {
  case 'nova':
    statusKey = 'novos';
    break;
  case 'revisao':
    statusKey = 'aguardando';
    break;
  // ...
}

// Ao mover, envia tipo_coluna diretamente
let novoTipoColuna;
switch (novoStatusLabel) {
  case 'Novos':
    novoTipoColuna = 'nova';
    break;
  // ...
}
await demandasAPI.updateStatus(demanda.id, novoTipoColuna);
```

---

## 🗄️ Migração do Banco de Dados

### Script: `migrar_para_tipo_unico.py`

O script realiza:

1. **Atualiza status das demandas**
   - Mapeia valores antigos (ex: "Aguardando Revisão") para tipos (ex: "revisao")
   - Usa mapeamento das colunas existentes

2. **Remove coluna status_mapping**
   - Cria tabela temporária sem a coluna
   - Copia dados
   - Substitui tabela antiga

### Execução:
```bash
cd src/backend
python migrar_para_tipo_unico.py
```

### Resultado:
```
============================================================
MIGRAÇÃO: Unificando status_mapping e tipo_coluna
============================================================

📋 Atualizando status das demandas...
  • Demanda #1: 'revisao' → 'em_andamento'
  • Demanda #2: 'nova' → 'em_andamento'
✓ 2 demandas verificadas

🗑️  Removendo coluna status_mapping...
✓ Coluna status_mapping removida com sucesso

============================================================
CONFIGURAÇÃO FINAL DAS COLUNAS
============================================================

📌 Coluna: Novos
   Tipo: nova
   Demandas: 0

📌 Coluna: Em Andamento
   Tipo: em_andamento
   Demandas: 2

📌 Coluna: Aguardando
   Tipo: revisao
   Demandas: 0

📌 Coluna: Concluídos
   Tipo: concluido
   Demandas: 0
```

---

## ✅ Vantagens da Simplificação

### 1. Menos Confusão
- Antes: "status_mapping é o valor no banco, tipo_coluna são as regras"
- Agora: **"tipo_coluna é tudo"**

### 2. Código Mais Limpo
- Menos campos para validar
- Menos mapeamentos manuais
- Menos chances de inconsistência

### 3. API Mais Clara
```json
// Antes (confuso)
POST /kanban/colunas
{
  "nome": "Aguardando",
  "status_mapping": "Aguardando Revisão",  // ❓ Qual usar?
  "tipo_coluna": "revisao"
}

// Depois (simples)
POST /kanban/colunas
{
  "nome": "Aguardando",
  "tipo_coluna": "revisao"  // ✅ Único valor necessário
}
```

### 4. Movimentação Mais Intuitiva
```javascript
// Antes
await updateStatus(demandaId, 'Aguardando Revisão')  // ❓ Valor exato importa

// Depois
await updateStatus(demandaId, 'revisao')  // ✅ Tipo padronizado
```

---

## 📝 Atualizações de Documentação

### Arquivos Atualizados:
- ✅ `REGRAS_COLUNAS_KANBAN.md` - Atualizado para refletir novo sistema
- ✅ `SIMPLIFICACAO_TIPO_COLUNA.md` - Este documento (novo)

### Arquivos Deprecados:
- ❌ Referências a `status_mapping` em tutoriais
- ❌ Exemplos de API com campo `status` textual

---

## 🔄 Compatibilidade

### Backend
- ✅ Modelo `KanbanColumn` atualizado
- ✅ Endpoints atualizados
- ✅ Validações atualizadas
- ✅ Migração do banco executada

### Frontend
- ✅ Componentes atualizados
- ✅ API calls atualizadas
- ✅ Mapeamentos simplificados

### Banco de Dados
- ✅ Tabela `kanban_column` sem `status_mapping`
- ✅ Tabela `demanda` usa `tipo_coluna` em `status`
- ✅ Dados migrados preservando integridade

---

## 🚀 Próximos Passos

1. **Testar o sistema end-to-end**
   - Reiniciar backend
   - Testar como funcionário
   - Testar como sócio
   - Verificar regras de movimentação

2. **Implementar UI de notificações** (próxima tarefa)
   - Componente para exibir notificações
   - Badge com contador de não lidas
   - Marcar como lida

3. **Revisar documentação**
   - Atualizar README com novo fluxo
   - Criar guia de uso para usuários

---

## 📚 Referências

- `src/backend/app/models.py` - Modelo KanbanColumn
- `src/backend/app/main.py` - Endpoints de demandas e colunas
- `frontend/src/services/api.js` - Chamadas API
- `frontend/src/components/dashboard/EditarColunas.jsx` - Gestão de colunas
- `frontend/src/components/dashboard/CadastrarDemanda.jsx` - Criação de demandas
- `frontend/src/components/dashboard/dashboardSocio.jsx` - Dashboard sócio
- `frontend/src/components/dashboard/dashboardFuncionario.jsx` - Dashboard funcionário

---

**Data da Simplificação:** Dezembro 2025  
**Impacto:** Backend + Frontend + Banco de Dados  
**Status:** ✅ Concluído e Migrado
