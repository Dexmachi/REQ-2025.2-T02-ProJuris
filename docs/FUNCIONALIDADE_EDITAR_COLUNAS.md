# Funcionalidade: Edição de Colunas do Kanban (Exclusivo Sócio)

## 📋 Descrição

Esta funcionalidade permite que usuários com role de **sócio** configurem as colunas do quadro Kanban, podendo criar, editar e remover colunas personalizadas.

## 🎯 Requisitos Funcionais

- ✅ **RF-KANBAN-01**: Sócio pode visualizar todas as colunas do Kanban
- ✅ **RF-KANBAN-02**: Sócio pode criar novas colunas customizadas
- ✅ **RF-KANBAN-03**: Sócio pode editar nome e cor de colunas existentes
- ✅ **RF-KANBAN-04**: Sócio pode deletar colunas (com confirmação)
- ✅ **RF-KANBAN-05**: Cada coluna possui mapeamento para status da demanda

## 🏗️ Arquitetura

### Backend

#### Modelo de Dados (`models.py`)
```python
class KanbanColumn(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cor = db.Column(db.String(20), nullable=False, default='#3b82f6')
    ordem = db.Column(db.Integer, nullable=False)
    status_mapping = db.Column(db.String(100), nullable=False)
    data_criacao = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
```

#### Endpoints API (`main.py`)

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/kanban/colunas` | Lista todas as colunas | Token JWT (qualquer usuário) |
| POST | `/kanban/colunas` | Cria nova coluna | Token JWT (apenas sócio) |
| PUT | `/kanban/colunas/<id>` | Atualiza coluna | Token JWT (apenas sócio) |
| DELETE | `/kanban/colunas/<id>` | Deleta coluna | Token JWT (apenas sócio) |

#### Exemplo de Requisição (POST)
```json
{
  "nome": "Em Revisão",
  "cor": "#ec4899",
  "status_mapping": "Aguardando Revisão"
}
```

#### Exemplo de Resposta
```json
{
  "message": "Coluna criada com sucesso!",
  "coluna": {
    "id": 5,
    "nome": "Em Revisão",
    "cor": "#ec4899",
    "ordem": 5,
    "status_mapping": "Aguardando Revisão",
    "data_criacao": "2024-12-01T07:44:59.123456"
  }
}
```

### Frontend

#### Componente Principal
- **`EditarColunas.jsx`**: Gerenciador de colunas com interface completa

#### Funcionalidades da Interface
1. **Visualização**: Grid responsivo com cards das colunas
2. **Edição**: Formulário inline para editar nome, cor e status mapping
3. **Criação**: Botão "Adicionar Nova Coluna" com formulário
4. **Deleção**: Botão com confirmação antes de deletar
5. **Cores**: Paleta pré-definida com 7 opções

#### Integração no Dashboard
- Botão "Editar Colunas" (ícone `Columns`) no header do Kanban
- Modal overlay para exibir o gerenciador
- Callback `onColunasAtualizadas` para atualizar dashboard após mudanças

## 🚀 Instalação e Configuração

### 1. Criar Tabela no Banco de Dados
```bash
cd src/backend
python3 -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

### 2. Inicializar Colunas Padrão
```bash
python3 init_colunas.py
```

Isso criará 4 colunas padrão:
- **Novos** (Azul) → Status: Elaboração
- **Em Andamento** (Amarelo) → Status: Em Andamento
- **Aguardando** (Roxo) → Status: Aguardando Revisão
- **Concluídos** (Verde) → Status: Concluído

### 3. Testar Endpoints
```bash
python3 test_colunas.py
```

## 🎨 Customização

### Cores Disponíveis
| Cor | Valor HEX |
|-----|-----------|
| Azul | `#3b82f6` |
| Verde | `#10b981` |
| Amarelo | `#f59e0b` |
| Vermelho | `#ef4444` |
| Roxo | `#8b5cf6` |
| Rosa | `#ec4899` |
| Cinza | `#6b7280` |

### Adicionar Novas Cores
Edite `EditarColunas.jsx`:
```javascript
const coresDisponiveis = [
  { nome: 'Nova Cor', valor: '#HEXCODE' },
  // ...
];
```

## 🔒 Segurança

- ✅ Endpoints protegidos com decorator `@token_required`
- ✅ Verificação de role no backend (apenas sócio pode criar/editar/deletar)
- ✅ Token JWT validado em todas as requisições
- ✅ Mensagens de erro apropriadas para tentativas não autorizadas

## 🧪 Testes

### Teste Manual com cURL

1. **Gerar token** (executar `test_colunas.py`)
2. **Listar colunas**:
```bash
curl -H 'Authorization: Bearer <TOKEN>' \
     http://localhost:5000/kanban/colunas
```

3. **Criar coluna** (como sócio):
```bash
curl -X POST http://localhost:5000/kanban/colunas \
     -H 'Authorization: Bearer <TOKEN>' \
     -H 'Content-Type: application/json' \
     -d '{"nome":"Teste","cor":"#ff0000","status_mapping":"Status Teste"}'
```

4. **Tentar criar como funcionário** (deve falhar):
```bash
# Use token de funcionário (ver erro 403)
```

## 📝 Fluxo de Uso

1. Sócio faz login no sistema
2. Acessa o dashboard
3. Clica em "Editar Colunas" no header do Kanban
4. Modal abre com lista de colunas atuais
5. Sócio pode:
   - Clicar em "Editar" (ícone lápis) para modificar coluna
   - Clicar em "Deletar" (ícone lixeira) para remover coluna
   - Clicar em "Adicionar Nova Coluna" para criar coluna
6. Ao salvar, dashboard é atualizado automaticamente

## 🐛 Troubleshooting

### Erro 403 (Acesso Negado)
- Verifique se o usuário tem role `socio`
- Confirme que o token JWT está válido

### Colunas não aparecem
- Execute `init_colunas.py` para criar colunas padrão
- Verifique se a tabela `kanban_column` existe no banco

### Erro ao criar coluna
- Verifique campos obrigatórios: `nome`, `status_mapping`
- Confirme que o backend está rodando

## 📦 Arquivos Criados/Modificados

### Novos Arquivos
- `frontend/src/components/dashboard/EditarColunas.jsx`
- `frontend/src/style/editarColunas.css`
- `src/backend/init_colunas.py`
- `src/backend/test_colunas.py`

### Arquivos Modificados
- `src/backend/app/models.py` (+ KanbanColumn)
- `src/backend/app/main.py` (+ rotas /kanban/colunas)
- `frontend/src/services/api.js` (+ kanbanAPI)
- `frontend/src/components/dashboard/dashboardSocio.jsx` (+ botão e modal)
- `frontend/src/style/dashboardSocio.css` (+ estilos do botão)

## 🔮 Melhorias Futuras

- [ ] Drag & drop para reordenar colunas
- [ ] Colunas arquivadas (soft delete)
- [ ] Histórico de mudanças nas colunas
- [ ] Permissões granulares por coluna
- [ ] Exportar/importar configurações de colunas
- [ ] Temas de cores customizados
- [ ] Validação de unicidade de nomes

## 📄 Licença

Parte do sistema ProJuris - REQ 2025.2 T02
