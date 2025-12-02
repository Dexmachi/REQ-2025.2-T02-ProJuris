# 🔐 Sistema de Regras de Colunas do Kanban

## 📋 Visão Geral

O sistema agora possui **4 tipos diferentes de colunas** com regras específicas de movimentação e notificação, garantindo um fluxo de trabalho controlado entre sócios e funcionários.

## 🎯 Tipos de Colunas

### 1. **Nova Demanda** (`nova`)
**Ícone:** 🆕 | **Cor Padrão:** Azul (#3b82f6)

**Funcionalidade:**
- Ao **criar uma demanda**, o usuário escolhe em qual coluna de "novas demandas" ela deve começar
- Permite múltiplas colunas deste tipo (ex: "Novas - Urgente", "Novas - Normal")
- **Sem restrições** de movimentação para funcionários

**Exemplo de uso:**
- "Novos Processos"
- "Aguardando Início"
- "Backlog"

---

### 2. **Em Andamento** (`em_andamento`)
**Ícone:** ⚙️ | **Cor Padrão:** Amarelo (#f59e0b)

**Funcionalidade:**
- **Sem restrições especiais**
- Funcionários podem mover suas demandas livremente entre colunas deste tipo
- Sócios podem mover qualquer demanda

**Exemplo de uso:**
- "Em Desenvolvimento"
- "Análise"
- "Documentação"

---

### 3. **Revisão** (`revisao`)
**Ícone:** 👁️ | **Cor Padrão:** Roxo (#8b5cf6)

**Funcionalidade:**

#### ✅ **Quando funcionário move demanda PARA esta coluna:**
- ✉️ **Notificação automática** é enviada para todos os sócios
- Notificação contém:
  - Nome do funcionário que enviou
  - Título da demanda
  - Link/ID da demanda

#### ❌ **Quando funcionário tenta mover demanda DESTA coluna:**
- **BLOQUEADO** - Apenas sócio pode retirar demanda da revisão
- Mensagem de erro: "Demandas em revisão só podem ser movidas pelo sócio"

#### ✅ **Sócio tem liberdade total:**
- Pode mover demandas para revisão
- Pode mover demandas para fora da revisão

**Exemplo de uso:**
- "Aguardando Revisão"
- "Em Análise do Sócio"
- "Validação"

---

### 4. **Concluído** (`concluido`)
**Ícone:** ✅ | **Cor Padrão:** Verde (#10b981)

**Funcionalidade:**

#### ❌ **Funcionário NÃO PODE:**
- Mover demandas para esta coluna
- Mensagem de erro: "Apenas sócios podem mover demandas para a coluna de Concluído"

#### ✅ **Apenas Sócio pode:**
- Marcar demandas como concluídas
- Finalizar processos

**Exemplo de uso:**
- "Concluídos"
- "Finalizados"
- "Entregues"

---

## 🔒 Matriz de Permissões

| Ação | Funcionário (Própria Demanda) | Funcionário (Outra Demanda) | Sócio |
|------|-------------------------------|----------------------------|-------|
| Mover para coluna **Nova** | ✅ Sim | ❌ Não | ✅ Sim |
| Mover para coluna **Em Andamento** | ✅ Sim | ❌ Não | ✅ Sim |
| Mover para coluna **Revisão** | ✅ Sim (notifica sócios) | ❌ Não | ✅ Sim |
| Mover DE coluna **Revisão** | ❌ Não | ❌ Não | ✅ Sim |
| Mover para coluna **Concluído** | ❌ Não | ❌ Não | ✅ Sim |
| Editar detalhes da demanda | ✅ Sim | ❌ Não | ✅ Sim |

---

## 🔔 Sistema de Notificações

### Estrutura da Notificação

```json
{
  "id": 1,
  "tipo": "revisao",
  "mensagem": "João Silva enviou a demanda 'Análise de contrato' para revisão.",
  "lida": false,
  "data_criacao": "2024-12-01T10:30:00",
  "destinatario_id": 1,
  "demanda_id": 5,
  "remetente_id": 2,
  "remetente_nome": "João Silva"
}
```

### Endpoints de Notificações

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/notificacoes` | Lista todas as notificações do usuário |
| PATCH | `/notificacoes/<id>/marcar-lida` | Marca notificação como lida |
| PATCH | `/notificacoes/marcar-todas-lidas` | Marca todas como lidas |

---

## 🛠️ Implementação Técnica

### Backend (Flask)

#### Validações no endpoint `PATCH /demandas/<id>/status`:

```python
# 1. Verifica se funcionário pode mover para coluna de CONCLUÍDO
if current_user.role == 'funcionario' and coluna_destino.tipo_coluna == 'concluido':
    return jsonify({'message': 'Apenas sócios podem mover...'}), 403

# 2. Verifica se demanda está em REVISÃO e funcionário tenta mover
if coluna_origem.tipo_coluna == 'revisao' and current_user.role == 'funcionario':
    return jsonify({'message': 'Demandas em revisão...'}), 403

# 3. Cria notificação quando funcionário move para REVISÃO
if coluna_destino.tipo_coluna == 'revisao' and current_user.role == 'funcionario':
    socios = User.query.filter_by(role='socio').all()
    for socio in socios:
        notificacao = Notificacao(...)
        db.session.add(notificacao)
```

### Frontend (React)

#### Tratamento de erros de movimentação:

```javascript
try {
  await demandasAPI.updateStatus(demanda.id, novoStatus);
  loadDashboardData();
} catch (error) {
  if (error.response?.status === 403) {
    const tipo = error.response.data.tipo;
    if (tipo === 'restricao_concluido') {
      alert('⚠️ Apenas sócio pode concluir demandas');
    } else if (tipo === 'restricao_revisao') {
      alert('⚠️ Demanda em revisão, aguarde aprovação do sócio');
    }
  }
  // Reverte movimento
  loadDashboardData();
}
```

---

## 📊 Fluxo de Trabalho Típico

```
1. Sócio cria demanda → Coluna "Nova"
                ↓
2. Funcionário move → Coluna "Em Andamento"
                ↓
3. Funcionário move → Coluna "Revisão"
                ↓
    [🔔 Notificação enviada para sócios]
                ↓
4. Sócio revisa:
   - Se OK → Coluna "Concluído"
   - Se não → Coluna "Em Andamento" (com feedback)
```

---

## 🎨 Gerenciamento de Colunas (Sócio)

### Interface de Edição

**Acesso:** Botão "Editar Colunas" no dashboard do sócio

**Campos disponíveis:**
- **Nome:** Nome exibido da coluna
- **Status Mapping:** Status salvo no banco de dados
- **Tipo de Coluna:** ⚡ Campo crítico
  - 🆕 Nova Demanda
  - ⚙️ Em Andamento
  - 👁️ Revisão
  - ✅ Concluído
- **Cor:** Paleta de 7 cores

### Criando Nova Coluna

```javascript
// Exemplo: Criar coluna de revisão urgente
{
  nome: "Revisão Urgente",
  status_mapping: "Aguardando Revisão Urgente",
  tipo_coluna: "revisao",  // ← Define as regras aplicadas
  cor: "#ef4444"
}
```

---

## 🧪 Testes

### 1. Testar Restrição de Concluído
```bash
# Como funcionário, tentar mover demanda para "Concluído"
# Resultado esperado: Erro 403
```

### 2. Testar Notificação de Revisão
```bash
# Como funcionário, mover demanda para "Revisão"
# Verificar: GET /notificacoes (como sócio) deve retornar nova notificação
```

### 3. Testar Bloqueio de Revisão
```bash
# Mover demanda para "Revisão"
# Como funcionário, tentar mover de volta
# Resultado esperado: Erro 403
```

---

## 🔧 Scripts de Manutenção

### Atualizar banco de dados:
```bash
cd src/backend
python3 atualizar_colunas_tipos.py
```

### Verificar configuração:
```bash
python3 << 'EOF'
from app import create_app, db
from app.models import KanbanColumn

app = create_app()
with app.app_context():
    colunas = KanbanColumn.query.order_by(KanbanColumn.ordem).all()
    for col in colunas:
        print(f"{col.nome:20} | {col.tipo_coluna:15} | {col.status_mapping}")
EOF
```

---

## 📝 Logs e Debugging

### Logs importantes:

```python
# Ao mover demanda para revisão
print(f"✉️ Notificação criada: Demanda {demanda.id} → Sócio {socio.id}")

# Ao bloquear movimentação
print(f"❌ Bloqueado: Funcionário {user.id} tentou mover demanda de revisão")
```

---

## 🚀 Próximos Passos

- [ ] Interface visual de notificações no frontend
- [ ] Badge de contagem de notificações não lidas
- [ ] Som/animação ao receber notificação
- [ ] Histórico de movimentações de demanda
- [ ] Permissões granulares por coluna
- [ ] Workflow customizado por projeto

---

## 📄 Arquivos Modificados

### Backend
- `app/models.py` - Modelo Notificacao e campo tipo_coluna
- `app/main.py` - Validações e criação de notificações
- `atualizar_colunas_tipos.py` - Script de migração

### Frontend
- `components/dashboard/EditarColunas.jsx` - Campo tipo_coluna
- `components/dashboard/CadastrarDemanda.jsx` - Seleção de coluna inicial
- `style/editarColunas.css` - Estilos para select

---

**Documentação criada em:** 1 de dezembro de 2024
**Versão:** 1.0.0
