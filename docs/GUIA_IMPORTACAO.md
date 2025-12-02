# 📊 Guia de Importação de Demandas - ProJuris

## 🎯 Visão Geral

O sistema ProJuris permite importação em lote de demandas através de arquivos Excel (.xlsx, .xls) ou CSV (.csv). Este documento explica como preparar seus arquivos para uma importação bem-sucedida.

---

## 📋 Formato do Arquivo

### Colunas Suportadas

O sistema reconhece as seguintes colunas (não é case-sensitive e aceita variações):

| Coluna | Variações Aceitas | Obrigatório | Formato |
|--------|-------------------|-------------|----------|
| **Título** | titulo, título, title, nome, name, assunto | ✅ **SIM** | Texto |
| **Descrição** | descricao, descrição, description, detalhes | ❌ Não | Texto longo |
| **Cliente** | cliente, client, customer | ❌ Não | Texto |
| **Prazo** | prazo, data_prazo, deadline, vencimento | ❌ Não | Data (veja formatos) |
| **Prioridade** | prioridade, priority, urgencia | ❌ Não | urgente, alta, normal, baixa |
| **Status** | status, estado, state | ❌ Não | pendente, em andamento, revisao, concluido |
| **Responsável** | responsavel, responsável, assigned | ❌ Não | Nome completo do usuário |

---

## 📅 Formatos de Data Aceitos

O sistema reconhece automaticamente os seguintes formatos de data:

- `DD/MM/YYYY` - Exemplo: 15/03/2025
- `DD-MM-YYYY` - Exemplo: 15-03-2025
- `YYYY-MM-DD` - Exemplo: 2025-03-15
- `YYYY/MM/DD` - Exemplo: 2025/03/15
- `DD/MM/YY` - Exemplo: 15/03/25
- `DD-MM-YY` - Exemplo: 15-03-25

---

## 🎨 Valores de Prioridade

| Valor no Arquivo | Sistema Normaliza Para |
|------------------|------------------------|
| urgente, urgent, crítico, alta+ | **urgente** |
| alta, high, importante | **alta** |
| normal, média, medium | **normal** |
| baixa, low | **baixa** |

⚠️ **Atenção:** Se a prioridade não for reconhecida, o sistema usará "normal" e emitirá um aviso.

---

## 📊 Valores de Status

| Valor no Arquivo | Sistema Normaliza Para |
|------------------|------------------------|
| pendente, novo, aberto | **pendente** |
| em andamento, working, trabalhando | **em_andamento** |
| revisao, revisão, review | **revisao** |
| concluido, concluído, done, finalizado | **concluido** |

⚠️ **Atenção:** Se o status não for reconhecido, o sistema usará "pendente" e emitirá um aviso.

---

## 📝 Exemplo de Arquivo Excel

### Estrutura Mínima (Apenas Título)

| Título |
|--------|
| Elaborar contrato de locação comercial |
| Revisar petição inicial - Caso Silva vs. Silva |
| Agendar reunião com cliente ABC Ltda |

### Estrutura Completa

| Título | Descrição | Cliente | Prazo | Prioridade | Status | Responsável |
|--------|-----------|---------|-------|------------|--------|-------------|
| Elaborar contrato de locação | Contrato para imóvel comercial com cláusulas específicas | Imobiliária ABC | 15/03/2025 | alta | pendente | João Silva |
| Revisar petição inicial | Caso de divórcio consensual Silva vs. Silva | Maria Silva | 20/03/2025 | urgente | em andamento | Ana Santos |
| Reunião com cliente | Primeira consulta para abertura de empresa | ABC Ltda | 10/03/2025 | normal | pendente | Pedro Costa |

---

## 🚀 Processo de Importação

### Passo 1: Preparar Arquivo
1. Organize os dados em uma planilha Excel ou CSV
2. Use a primeira linha como cabeçalho com os nomes das colunas
3. Preencha os dados a partir da segunda linha
4. Salve o arquivo no formato `.xlsx`, `.xls` ou `.csv`

### Passo 2: Fazer Upload
1. Acesse o Dashboard do Sócio
2. Clique em **"Importar Excel/CSV"** na sidebar
3. Selecione o arquivo preparado
4. Clique em **"Processar Arquivo"**

### Passo 3: Revisar Preview
O sistema processará o arquivo e mostrará:
- ✅ **Relatório de Processamento:** Total de linhas, válidas e inválidas
- ⚠️ **Avisos:** Valores normalizados ou não reconhecidos
- 🔍 **Preview:** Primeiras 10 demandas com formatação visual
- 🔄 **Duplicatas:** Lista de possíveis duplicatas detectadas

### Passo 4: Configurar Importação
1. **Selecione Responsável Padrão** (obrigatório)
   - Será atribuído às demandas sem responsável especificado
2. **Ignorar Duplicatas** (opcional)
   - Marque para pular demandas com títulos similares a existentes

### Passo 5: Confirmar
1. Clique em **"Confirmar Importação"**
2. Aguarde o processamento
3. Veja o resultado: demandas importadas e puladas
4. O kanban será atualizado automaticamente

---

## 🔒 Segurança e Validações

### Permissões
- ✅ Apenas **sócios** podem importar demandas em lote
- ❌ Funcionários não têm acesso a esta funcionalidade

### Validações Automáticas
- ✅ Formato de arquivo verificado (apenas .xlsx, .xls, .csv)
- ✅ Tamanho do arquivo limitado
- ✅ Título obrigatório para cada demanda
- ✅ Detecção de duplicatas por título
- ✅ Validação de responsável (se especificado)
- ✅ Normalização de prioridades e status
- ✅ Conversão de datas para formato padrão

### Auditoria
Todas as importações são registradas no sistema de auditoria com:
- Usuário que realizou a importação
- Data e hora da operação
- Quantidade de demandas importadas
- Arquivo de origem

---

## 📊 Detecção de Duplicatas

O sistema verifica duplicatas comparando:
- **Título da demanda** (case-insensitive)

Quando uma duplicata é detectada:
- ⚠️ O sistema exibe um alerta com a lista de duplicatas
- 🔲 Você pode marcar "Ignorar duplicatas" para pular essas demandas
- ✅ Ou pode desmarcar para importar mesmo assim

---

## 💡 Dicas e Boas Práticas

### ✅ Faça
- Use nomes de colunas em português ou inglês
- Formate datas de forma consistente
- Revise o preview antes de confirmar
- Mantenha títulos descritivos e únicos
- Teste com um arquivo pequeno primeiro

### ❌ Evite
- Deixar células de título vazias
- Misturar formatos de data no mesmo arquivo
- Usar valores customizados para prioridade/status sem verificar
- Importar arquivos muito grandes de uma vez (divida em lotes)

---

## 🐛 Resolução de Problemas

### Arquivo não é processado
- ✅ Verifique o formato (.xlsx, .xls ou .csv)
- ✅ Confirme que o arquivo não está corrompido
- ✅ Certifique-se de que há pelo menos uma coluna "Título"

### Muitas linhas inválidas
- ✅ Verifique se a primeira linha contém cabeçalhos
- ✅ Confirme que há valores na coluna "Título"
- ✅ Revise os avisos no relatório de processamento

### Responsável não é encontrado
- ✅ O nome deve corresponder exatamente ao cadastrado no sistema
- ✅ Verifique espaços extras antes/depois do nome
- ✅ Use o responsável padrão para atribuir depois manualmente

### Datas não são reconhecidas
- ✅ Use um dos formatos suportados (veja seção acima)
- ✅ Formate a coluna como "Texto" no Excel antes de inserir datas
- ✅ Evite datas relativas como "amanhã" ou "próxima semana"

---

## 📞 Suporte

Para dúvidas ou problemas com importação:
- 📧 Email: suporte@projuris.com.br
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Portal: https://projuris.com.br/suporte

---

**Última atualização:** 01/12/2025  
**Versão do sistema:** 1.5.0
