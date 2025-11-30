# Configuração do Sistema de Login e Cadastro

## Alterações Realizadas

### Backend (Flask)

1. **Modelo User atualizado** (`src/backend/app/models.py`):
   - Adicionados campos: `nome`, `telefone`, `cpf`, `oab`, `role`
   - Método `to_dict()` para serialização
   
2. **Endpoints de autenticação** (`src/backend/app/auth.py`):
   - `/auth/register` - Cadastro de usuários com validação
   - `/auth/login` - Login com JWT token
   - `/auth/logout` - Logout
   - `/auth/me` - Obter dados do usuário atual
   - `/auth/status` - Verificar status de autenticação

3. **CORS configurado** (`src/backend/app/__init__.py`):
   - Permite requisições do frontend (localhost:3000)
   - Suporta credenciais e todos os métodos HTTP necessários

4. **Dependências adicionadas** (`src/backend/requirements.txt`):
   - `Flask-CORS` - Para comunicação entre frontend e backend
   - `PyJWT` - Para geração de tokens JWT

### Frontend (React)

1. **AuthContext atualizado** (`frontend/src/context/authContext.jsx`):
   - Removido sistema de mock
   - Integrado com API real do backend
   - Funções: `login()`, `logout()`, `register()`

2. **API service** (`frontend/src/services/api.js`):
   - Adicionado `authAPI.register()`

3. **Componente de Cadastro** (`frontend/src/components/auth/cadastro.jsx`):
   - Usa função `register` do AuthContext
   - Melhor tratamento de erros

## Como Configurar e Executar

### 1. Configurar o Backend

```bash
# Navegar para a pasta do backend
cd "src/backend"

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Inicializar o banco de dados
flask db init  # Se ainda não foi feito
flask db migrate -m "Add user fields"
flask db upgrade

# Executar o servidor
python run.py
```

O backend estará disponível em: `http://localhost:5000`

### 2. Configurar o Frontend

```bash
# Navegar para a pasta do frontend
cd frontend

# Instalar dependências
npm install

# Executar o frontend
npm start
```

O frontend estará disponível em: `http://localhost:3000`

## Testando o Sistema

### 1. Cadastrar um novo usuário

1. Acesse `http://localhost:3000/cadastro`
2. Preencha o formulário:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
   - Telefone (opcional)
   - CPF
   - OAB (opcional)
   - Tipo de usuário (Funcionário ou Sócio)
3. Clique em "Cadastrar"

### 2. Fazer Login

1. Acesse `http://localhost:3000/login`
2. Use o email e senha cadastrados
3. Você será redirecionado para o dashboard apropriado:
   - **Sócios**: `/dashboard-socio`
   - **Funcionários**: `/dashboard-funcionario`

## Estrutura de Dados

### Usuário (User)

```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "telefone": "(11) 98765-4321",
  "cpf": "123.456.789-00",
  "oab": "OAB/SP 123456",
  "role": "funcionario"
}
```

### Token JWT

O token é retornado no login e deve ser incluído no header das requisições:
```
Authorization: Bearer <token>
```

## Variáveis de Ambiente

### Backend (.env na raiz de src/backend/)

```env
SECRET_KEY=sua-chave-secreta-aqui
DATABASE_URL=sqlite:///app.db
FLASK_ENV=development
```

### Frontend (.env na raiz de frontend/)

```env
REACT_APP_API_URL=http://localhost:5000
```

## Problemas Comuns

### CORS Error
- Verifique se o backend está rodando na porta 5000
- Confirme que o Flask-CORS está instalado
- Verifique a configuração em `src/backend/app/__init__.py`

### Token expirado
- Tokens JWT expiram em 7 dias
- Faça logout e login novamente

### Erro de conexão com banco de dados
- Execute as migrações: `flask db upgrade`
- Verifique se o arquivo `app.db` foi criado

## Próximos Passos

- [ ] Implementar recuperação de senha
- [ ] Adicionar validação de CPF
- [ ] Implementar refresh token
- [ ] Adicionar testes unitários
- [ ] Melhorar validações de campos
