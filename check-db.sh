#!/bin/bash

cd "src/backend"

python3 << 'EOF'
import sqlite3
from datetime import datetime

# Conectar ao banco
conn = sqlite3.connect('app.db')
cursor = conn.cursor()

# Verificar se o banco existe e tem dados
print("\n" + "=" * 70)
print("🗄️  BANCO DE DADOS - LegisPRO")
print("=" * 70)

# Listar tabelas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("\n📋 Tabelas disponíveis:")
for table in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {table[0]};")
    count = cursor.fetchone()[0]
    print(f"  • {table[0]:<20} ({count} registros)")

# Estrutura da tabela user
print("\n" + "=" * 70)
print("👥 ESTRUTURA DA TABELA 'user'")
print("=" * 70)
cursor.execute("PRAGMA table_info(user);")
columns = cursor.fetchall()
print("\nCampos:")
for col in columns:
    null_str = "NOT NULL" if col[3] else "NULL"
    pk_str = " | PRIMARY KEY" if col[5] else ""
    print(f"  • {col[1]:<20} {col[2]:<15} {null_str:<10}{pk_str}")

# Dados dos usuários
print("\n" + "=" * 70)
print("👤 USUÁRIOS CADASTRADOS")
print("=" * 70)

cursor.execute("SELECT id, nome, email, telefone, cpf, oab, role FROM user;")
users = cursor.fetchall()

if users:
    for i, user in enumerate(users, 1):
        print(f"\n📌 Usuário #{i}:")
        print(f"  ID       : {user[0]}")
        print(f"  Nome     : {user[1]}")
        print(f"  Email    : {user[2]}")
        print(f"  Telefone : {user[3] or 'Não informado'}")
        print(f"  CPF      : {user[4]}")
        print(f"  OAB      : {user[5] or 'Não informado'}")
        print(f"  Tipo     : {user[6].upper()}")
        print("  " + "-" * 50)
else:
    print("\n⚠️  Nenhum usuário cadastrado ainda")
    print("   Acesse http://localhost:3000/cadastro para criar um usuário")

print("\n" + "=" * 70)
print(f"📊 TOTAL: {len(users)} usuário(s) no sistema")
print("=" * 70 + "\n")

conn.close()
EOF
