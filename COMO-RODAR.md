# 🚀 Guia Rápido - LegisPRO

## Como Rodar o Sistema Completo

### Opção 1: Tudo de Uma Vez (Recomendado)

```bash
./start-all.sh
```

Este comando inicia automaticamente:
- ✅ Backend (Flask) na porta 5000
- ✅ Frontend (React) na porta 3000
- ✅ Banco de dados SQLite (criado automaticamente se não existir)

**Para parar:** Pressione `Ctrl+C`

---

### Opção 2: Rodar Separadamente

#### Terminal 1 - Backend
```bash
./start-backend.sh
```

#### Terminal 2 - Frontend
```bash
./start-frontend.sh
```

---

## Acessar o Sistema

Depois de iniciar os servidores:

- 🌐 **Aplicação**: http://localhost:3000
- 🔧 **API Backend**: http://localhost:5000

---

## Primeira Execução

### 1. Criar um usuário
1. Acesse: http://localhost:3000/cadastro
2. Preencha o formulário:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
   - CPF
   - Tipo: Funcionário ou Sócio

### 2. Fazer Login
1. Acesse: http://localhost:3000/login
2. Use o email e senha cadastrados
3. Você será redirecionado para o dashboard

---

## Troubleshooting

### Porta já em uso
```bash
# Verificar processos nas portas
lsof -ti:3000  # Frontend
lsof -ti:5000  # Backend

# Matar processos
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:5000)
```

### Resetar o banco de dados
```bash
cd src/backend
rm app.db
# Execute start-backend.sh novamente
```

### Reinstalar dependências

**Backend:**
```bash
cd src/backend
rm -rf venv
./start-backend.sh
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Estrutura de Logs

Os logs ficam salvos em:
- `backend.log` - Logs do servidor Flask
- `frontend.log` - Logs do servidor React

Para visualizar em tempo real:
```bash
tail -f backend.log
tail -f frontend.log
```

---

## Desenvolvimento

### Backend (Flask)
- Localização: `src/backend/`
- Porta: 5000
- Hot reload: ✅ Ativado (modo debug)

### Frontend (React)
- Localização: `frontend/`
- Porta: 3000
- Hot reload: ✅ Ativado

---

## Comandos Úteis

```bash
# Parar todos os processos Node e Python
pkill -f "react-scripts"
pkill -f "python.*run.py"

# Ver processos rodando
ps aux | grep python
ps aux | grep node

# Limpar tudo e reiniciar
./start-all.sh
```
