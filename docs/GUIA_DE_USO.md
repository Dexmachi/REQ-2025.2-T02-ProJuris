# 🎯 Guia de Uso das Novas Funcionalidades

**Sistema ProJuris - Recursos Implementados**

---

## 📋 Índice

1. [Sistema de Auditoria (RN03)](#1-sistema-de-auditoria-rn03)
2. [Auto-save de Formulários (RNF04)](#2-auto-save-de-formulários-rnf04)
3. [Sistema de Notificações (RN04)](#3-sistema-de-notificações-rn04)
4. [Controle de Acesso (RNF01)](#4-controle-de-acesso-rnf01)

---

## 1. Sistema de Auditoria (RN03)

### O que é?
Sistema que registra automaticamente todas as ações críticas realizadas no sistema, criando um histórico completo de quem fez o quê e quando.

### Como usar?

#### Como Sócio - Consultar Logs de Auditoria

**Via API:**
```bash
# Listar todos os logs (últimos 100)
GET /auditoria
Authorization: Bearer {seu_token}

# Filtrar por tipo de entidade
GET /auditoria?entidade=demanda

# Filtrar por ID específico
GET /auditoria?entidade=demanda&entidade_id=5

# Filtrar por usuário
GET /auditoria?usuario_id=2

# Limitar quantidade de resultados
GET /auditoria?limit=50
```

**Resposta:**
```json
{
  "logs": [
    {
      "id": 1,
      "usuario_id": 2,
      "usuario_nome": "João Silva",
      "acao": "mover_kanban",
      "entidade": "demanda",
      "entidade_id": 5,
      "detalhes": "{\"titulo\": \"Processo XYZ\", \"coluna_origem_id\": 1, \"coluna_destino_id\": 3}",
      "data_hora": "2025-12-01T18:30:45"
    }
  ],
  "total": 1
}
```

#### Consultar Histórico de uma Demanda Específica

**Via API:**
```bash
GET /demandas/5/auditoria
Authorization: Bearer {seu_token}
```

**Resposta:**
```json
{
  "demanda_id": 5,
  "titulo": "Processo XYZ",
  "historico": [
    {
      "acao": "criar",
      "usuario_nome": "Maria Santos",
      "data_hora": "2025-12-01T10:00:00"
    },
    {
      "acao": "editar",
      "usuario_nome": "João Silva",
      "data_hora": "2025-12-01T14:30:00"
    },
    {
      "acao": "mover_kanban",
      "usuario_nome": "João Silva",
      "data_hora": "2025-12-01T18:30:45"
    }
  ],
  "total": 3
}
```

### O que é auditado?

- ✅ **Criar demanda** - Quem criou, quando, dados principais
- ✅ **Editar demanda** - Quem editou, quais campos foram alterados
- ✅ **Excluir demanda** - Quem excluiu, dados da demanda excluída
- ✅ **Mover no Kanban** - Quem moveu, de onde para onde
- ✅ **Criar coluna** - Quem criou, dados da coluna
- ✅ **Editar coluna** - Quem editou, quais campos alterados
- ✅ **Excluir coluna** - Quem excluiu, dados da coluna excluída

### Permissões

- 🔓 **Sócio:** Pode consultar TODOS os logs de auditoria
- 🔒 **Funcionário:** Pode consultar apenas histórico de demandas específicas

---

## 2. Auto-save de Formulários (RNF04)

### O que é?
Salvamento automático do conteúdo dos formulários a cada 2 minutos, evitando perda de dados em caso de falha do navegador, queda de internet, etc.

### Como funciona?

#### Cadastrar Nova Demanda

1. **Abra o formulário** de cadastro de demanda
2. **Comece a preencher** os campos
3. **Aguarde 2 minutos** - Você verá a mensagem:
   ```
   💾 Rascunho salvo automaticamente
   ```
4. **Se fechar o navegador** ou sair da página:
   - Ao retornar, seus dados estarão lá!
   - Você verá a mensagem:
   ```
   📝 Rascunho recuperado do auto-save
   ```
5. **Ao enviar com sucesso:**
   - O rascunho é automaticamente apagado
   - Não haverá dados antigos na próxima vez

#### Editar Demanda

Funciona da mesma forma! Ao editar uma demanda:
1. Preencha os campos
2. A cada 2 minutos: `💾 Rascunho salvo automaticamente`
3. Se sair e voltar: `📝 Rascunho recuperado do auto-save`
4. Após salvar: rascunho apagado automaticamente

### Onde os dados são salvos?

- **LocalStorage do navegador** (não no servidor)
- **Chaves usadas:**
  - `cadastrar_demanda_draft` - Para novo cadastro
  - `editar_demanda_{id}` - Para edição (um por demanda)

### Limitações

- ⚠️ Se limpar o cache do navegador, os rascunhos são perdidos
- ⚠️ Rascunhos não são compartilhados entre dispositivos
- ⚠️ Cada navegador tem seu próprio rascunho

### Limpeza Manual (se necessário)

Abra o Console do navegador (F12) e execute:
```javascript
// Limpar rascunho de cadastro
localStorage.removeItem('cadastrar_demanda_draft');

// Limpar rascunho de edição (exemplo demanda ID 5)
localStorage.removeItem('editar_demanda_5');
```

---

## 3. Sistema de Notificações (RN04)

### O que é?
Sistema completo de notificações que alerta sobre eventos importantes: novas atribuições, prazos críticos, mudanças de status.

### Tipos de Notificações

#### 1. 📢 Nova Atribuição
**Quando ocorre:** Alguém cria uma demanda e atribui a você  
**Você recebe:** "Você foi atribuído à demanda 'Título' por Nome do Sócio."

#### 2. 🔄 Reatribuição
**Quando ocorre:** Um sócio altera o responsável de uma demanda para você  
**Você recebe:** "A demanda 'Título' foi reatribuída para você por Nome do Sócio."

#### 3. 📝 Mudança de Status
**Quando ocorre:** Alguém move sua demanda no Kanban  
**Você recebe:** "A demanda 'Título' foi movida para 'Nome da Coluna' por Nome."

#### 4. 🔍 Enviado para Revisão
**Quando ocorre:** Funcionário envia demanda para revisão  
**Quem recebe:** TODOS os sócios  
**Mensagem:** "Nome do Funcionário enviou a demanda 'Título' para revisão."

#### 5. ⏰ Prazo Crítico
**Quando ocorre:** Demanda vence em 3 dias ou menos  
**Você recebe:**
- 3 dias antes: "⏰ A demanda 'Título' vence em 3 dias (04/12/2025 15:00)."
- 1 dia antes: "⚠️ ATENÇÃO: A demanda 'Título' vence AMANHÃ!"
- No dia: "⚠️ URGENTE: A demanda 'Título' vence HOJE!"

### Como ver minhas notificações?

**Via API:**
```bash
GET /notificacoes
Authorization: Bearer {seu_token}
```

**Resposta:**
```json
{
  "notificacoes": [
    {
      "id": 1,
      "tipo": "prazo_critico",
      "mensagem": "⚠️ ATENÇÃO: A demanda 'Processo XYZ' vence AMANHÃ!",
      "lida": false,
      "data_criacao": "2025-12-01T09:00:00",
      "demanda_id": 5,
      "remetente_nome": null
    }
  ],
  "total": 1,
  "nao_lidas": 1
}
```

### Como marcar como lida?

**Uma notificação:**
```bash
PATCH /notificacoes/1/marcar-lida
Authorization: Bearer {seu_token}
```

**Todas de uma vez:**
```bash
PATCH /notificacoes/marcar-todas-lidas
Authorization: Bearer {seu_token}
```

### Configurar Verificação Automática de Prazos

**Importante:** Para notificações de prazo crítico funcionarem, você precisa:

1. **Teste manual primeiro:**
```bash
cd src/backend
python verificar_prazos.py
```

2. **Configure cron job para execução diária:**
```bash
crontab -e
```

Adicione:
```cron
# Executar às 9h todos os dias
0 9 * * * cd /caminho/completo/src/backend && /usr/bin/python3 verificar_prazos.py >> /var/log/projuris_prazos.log 2>&1
```

3. **Verificar se está funcionando:**
```bash
tail -f /var/log/projuris_prazos.log
```

### Frequência Recomendada

- **Diária:** Uma vez por dia (suficiente para avisar 3 dias antes)
- **A cada 6h:** Se quiser notificações mais frequentes
- **A cada 1h:** Para ambientes críticos (não recomendado, gera muitas notificações)

---

## 4. Controle de Acesso (RNF01)

### O que é?
Sistema de permissões baseado em papéis que controla o que cada tipo de usuário pode fazer.

### Papéis Disponíveis

#### 👔 Sócio
**Permissões COMPLETAS:**
- ✅ Criar demandas
- ✅ Editar TODAS as demandas
- ✅ Excluir demandas
- ✅ Mover para qualquer coluna (inclusive Concluído)
- ✅ Gerenciar colunas do Kanban (criar, editar, excluir, reordenar)
- ✅ Reatribuir demandas
- ✅ Consultar logs de auditoria completos

#### 👨‍💼 Funcionário
**Permissões RESTRITAS:**
- ✅ Criar demandas
- ✅ Editar apenas SUAS demandas
- ❌ NÃO pode excluir demandas
- ⚠️ Pode mover no Kanban, **EXCETO:**
  - ❌ NÃO pode mover para "Concluído"
  - ❌ NÃO pode mover demandas que estão em "Revisão"
- ❌ NÃO pode gerenciar colunas
- ❌ NÃO pode reatribuir demandas
- ⚠️ Pode consultar apenas histórico de demandas específicas

### Mensagens de Erro

Quando tentar fazer algo não permitido, você verá:

```json
{
  "message": "Acesso negado. Apenas sócios podem excluir demandas.",
  "tipo": "restricao_concluido"
}
```

HTTP Status: **403 Forbidden**

### Exemplos de Restrições

#### Funcionário tenta excluir demanda:
```bash
DELETE /demandas/5
→ 403: "Acesso negado. Apenas sócios podem excluir demandas."
```

#### Funcionário tenta mover para Concluído:
```bash
PATCH /demandas/5/status
{
  "tipo_coluna": "concluido",
  "coluna_id": 8
}
→ 403: "Apenas sócios podem mover demandas para a coluna de Concluído."
```

#### Funcionário tenta mover demanda em Revisão:
```bash
PATCH /demandas/5/status
→ 403: "Demandas em revisão só podem ser movidas pelo sócio."
```

#### Funcionário tenta criar coluna:
```bash
POST /kanban/colunas
→ 403: "Acesso negado. Apenas sócios podem gerenciar colunas."
```

#### Funcionário tenta consultar todos os logs:
```bash
GET /auditoria
→ 403: "Acesso negado. Apenas sócios podem consultar logs de auditoria."
```

---

## 🆘 Troubleshooting

### Auto-save não está funcionando

1. **Verifique o console do navegador (F12):**
   - Deve mostrar mensagens de auto-save
   
2. **Teste o LocalStorage:**
```javascript
// No console do navegador
localStorage.setItem('teste', 'funciona');
console.log(localStorage.getItem('teste')); // Deve mostrar 'funciona'
```

3. **Verifique se está esperando 2 minutos completos**

### Notificações de prazo não chegam

1. **Verifique se o cron job está configurado:**
```bash
crontab -l
```

2. **Execute manualmente e veja os erros:**
```bash
cd src/backend
python verificar_prazos.py
```

3. **Verifique os logs:**
```bash
tail -100 /var/log/projuris_prazos.log
```

### Auditoria não registra logs

1. **Verifique se a tabela foi criada:**
```bash
cd src/backend
python -c "from app import create_app, db; app=create_app(); app.app_context().push(); print(db.inspect(db.engine).get_table_names())"
```

2. **Execute o teste:**
```bash
python testar_auditoria.py
```

3. **Verifique os logs do servidor backend**

### Erro 403 em ação permitida

1. **Verifique seu token JWT:**
```bash
# Faça login novamente
POST /auth/login
{
  "email": "seu@email.com",
  "senha": "sua_senha"
}
```

2. **Verifique seu papel (role):**
```bash
GET /profile
Authorization: Bearer {seu_token}
```

3. **Confirme que a ação é permitida para seu papel**

---

## 📞 Suporte Adicional

- **Documentação Técnica:** `docs/IMPLEMENTACAO_COMPLETA.md`
- **Análise de Requisitos:** `docs/ANALISE_REQUISITOS_IMPLEMENTACAO.md`
- **Sistema de Notificações:** `docs/NOTIFICACOES.md`

---

**Última atualização:** 01/12/2025
