# Sistema de Notificações - RN04

## Verificador Automático de Prazos Críticos

O sistema inclui um verificador automático que notifica usuários sobre demandas com prazo próximo ao vencimento.

### Como Funciona

O script `verificar_prazos.py` verifica diariamente:
- **3 dias antes**: Notificação de alerta
- **2 dias antes**: Notificação de atenção
- **1 dia antes**: Notificação urgente
- **No dia**: Notificação urgente

### Executar Manualmente

```bash
cd src/backend
python verificar_prazos.py
```

### Configurar Execução Automática (Cron)

Para executar automaticamente todos os dias às 9h da manhã:

1. Abra o crontab:
```bash
crontab -e
```

2. Adicione a seguinte linha (ajuste o caminho conforme necessário):
```cron
0 9 * * * cd /caminho/completo/src/backend && /usr/bin/python3 verificar_prazos.py >> /var/log/projuris_prazos.log 2>&1
```

**Explicação:**
- `0 9 * * *`: Executa às 9h todos os dias
- `cd /caminho/completo/src/backend`: Navega para o diretório do backend
- `python3 verificar_prazos.py`: Executa o script
- `>> /var/log/projuris_prazos.log 2>&1`: Salva logs em arquivo

### Alternativa: Executar a cada 6 horas

```cron
0 */6 * * * cd /caminho/completo/src/backend && /usr/bin/python3 verificar_prazos.py >> /var/log/projuris_prazos.log 2>&1
```

### Verificar Logs

```bash
tail -f /var/log/projuris_prazos.log
```

## Tipos de Notificações Implementadas

### 1. **Nova Atribuição** (`nova_atribuicao`)
- Disparada quando uma demanda é criada e atribuída a um usuário
- Destinatário: Responsável pela demanda
- Momento: Ao criar demanda

### 2. **Reatribuição** (`reatribuicao`)
- Disparada quando um sócio altera o responsável de uma demanda
- Destinatário: Novo responsável
- Momento: Ao editar responsável

### 3. **Mudança de Status** (`mudanca_status`)
- Disparada quando alguém move uma demanda no Kanban
- Destinatário: Responsável pela demanda (se não for quem moveu)
- Momento: Ao mover card no Kanban

### 4. **Revisão** (`revisao`)
- Disparada quando funcionário envia demanda para revisão
- Destinatário: Todos os sócios
- Momento: Ao mover para coluna de revisão

### 5. **Prazo Crítico** (`prazo_critico`)
- Disparada automaticamente pelo verificador de prazos
- Destinatário: Responsável pela demanda
- Momento: Diariamente (via cron), para demandas com prazo em até 3 dias

## Estrutura das Notificações no Banco

```python
{
  'id': int,
  'tipo': str,  # nova_atribuicao, reatribuicao, mudanca_status, revisao, prazo_critico
  'mensagem': str,
  'lida': bool,
  'data_criacao': datetime,
  'destinatario_id': int,
  'demanda_id': int,
  'remetente_id': int (opcional)
}
```

## API Endpoints

- `GET /notificacoes` - Lista todas as notificações do usuário
- `PATCH /notificacoes/<id>/marcar-lida` - Marca notificação como lida
- `PATCH /notificacoes/marcar-todas-lidas` - Marca todas como lidas

## Observação sobre Tempo Real (RN04)

O requisito menciona **notificações em tempo real**. Atualmente, as notificações são:
- ✅ **In-app**: Armazenadas no banco e consultadas via API
- ⚠️ **Tempo real**: Requerem polling do frontend ou WebSocket (não implementado ainda)

Para implementar tempo real completo, considere:
- **WebSocket** (Flask-SocketIO)
- **Server-Sent Events (SSE)**
- **Polling** a cada 30-60 segundos (solução mais simples)
