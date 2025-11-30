# 📁 Sistema de Backup JSON dos Usuários

## ✨ Funcionalidades Implementadas

### 🔄 Salvamento Automático
- ✅ Todo novo cadastro é salvo automaticamente em JSON
- ✅ Arquivos organizados por tipo de usuário (sócios/funcionários)
- ✅ Um arquivo JSON individual para cada usuário
- ✅ Timestamps de criação e última atualização

### 📂 Estrutura de Arquivos

```
src/backend/app/user_data/
├── socios/
│   └── user_1.json
│   └── user_3.json
│   └── ...
└── funcionarios/
    └── user_2.json
    └── user_4.json
    └── ...
```

### 📋 Formato dos Arquivos JSON

Cada arquivo contém:
```json
{
  "id": 1,
  "nome": "Nome do Usuário",
  "email": "email@exemplo.com",
  "telefone": "(11) 98765-4321",
  "cpf": "123.456.789-00",
  "oab": "OAB/SP 123456",
  "role": "socio",
  "criado_em": "2025-11-30T21:03:14.037176",
  "atualizado_em": "2025-11-30T21:03:14.037191"
}
```

## 🛠️ Scripts Disponíveis

### 1. Sincronizar Usuários Existentes
```bash
./sync-users-to-json.sh
```
- Cria arquivos JSON para todos os usuários já cadastrados no banco
- Útil após implementar o sistema de backup

### 2. Visualizar Arquivos JSON
```bash
./view-json-users.sh
```
- Lista todos os arquivos JSON criados
- Mostra informações completas de cada usuário
- Exibe a estrutura de diretórios

### 3. Verificar Banco de Dados
```bash
./check-db.sh
```
- Mostra usuários cadastrados no banco SQLite
- Útil para comparar com os arquivos JSON

## 📝 Como Funciona

### No Cadastro
Quando um usuário se cadastra:
1. ✅ Dados salvos no banco de dados SQLite
2. ✅ Arquivo JSON criado automaticamente em `user_data/`
3. ✅ Organizado na pasta correta (socios/funcionarios)

### No Login
- Sistema continua usando o banco de dados
- Arquivos JSON servem como backup/referência

## 🔧 Funções Disponíveis (json_handler.py)

```python
# Salvar usuário em JSON
save_user_to_json(user)

# Atualizar arquivo JSON existente
update_user_json(user)

# Remover arquivo JSON
delete_user_json(user_id, role)

# Carregar dados do JSON
load_user_from_json(user_id, role)

# Listar todos os JSONs
list_all_users_json()

# Sincronizar todos do banco para JSON
sync_all_users_to_json()
```

## 📊 Exemplos de Uso

### Criar novo usuário
O sistema já faz automaticamente no endpoint `/auth/register`

### Sincronizar usuários antigos
```bash
./sync-users-to-json.sh
```

### Ver todos os arquivos
```bash
./view-json-users.sh
```

### Acessar arquivos manualmente
```bash
cat src/backend/app/user_data/socios/user_1.json
cat src/backend/app/user_data/funcionarios/user_2.json
```

## 🔐 Segurança

- ⚠️ Senhas NÃO são salvas nos arquivos JSON
- ✅ Apenas informações de perfil são armazenadas
- ✅ Arquivos podem ser usados para backup/auditoria

## 🚀 Benefícios

1. **Backup Automático**: Cópia de segurança dos dados de usuários
2. **Organização**: Sócios e funcionários separados
3. **Auditoria**: Timestamps de criação e atualização
4. **Portabilidade**: Fácil exportar/importar dados
5. **Debugging**: Visualizar dados sem acessar o banco
