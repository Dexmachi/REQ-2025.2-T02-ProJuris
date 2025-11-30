#!/bin/bash

echo "📁 Visualizando arquivos JSON dos usuários..."
echo ""

cd "src/backend"

python3 << 'EOF'
from app.json_handler import list_all_users_json
import json
from pathlib import Path

users = list_all_users_json()

print("=" * 80)
print("👥 USUÁRIOS SALVOS EM JSON")
print("=" * 80)

if users['socios']:
    print(f"\n👔 SÓCIOS ({len(users['socios'])} arquivo(s)):\n")
    for i, user in enumerate(users['socios'], 1):
        print(f"  📄 Arquivo #{i}: user_data/socios/user_{user['id']}.json")
        print(f"     ├─ ID       : {user['id']}")
        print(f"     ├─ Nome     : {user['nome']}")
        print(f"     ├─ Email    : {user['email']}")
        print(f"     ├─ Telefone : {user['telefone']}")
        print(f"     ├─ CPF      : {user['cpf']}")
        print(f"     ├─ OAB      : {user['oab']}")
        print(f"     ├─ Role     : {user['role'].upper()}")
        print(f"     └─ Criado   : {user['criado_em']}")
        print()
else:
    print("\n👔 SÓCIOS: Nenhum arquivo encontrado\n")

print("-" * 80)

if users['funcionarios']:
    print(f"\n👤 FUNCIONÁRIOS ({len(users['funcionarios'])} arquivo(s)):\n")
    for i, user in enumerate(users['funcionarios'], 1):
        print(f"  📄 Arquivo #{i}: user_data/funcionarios/user_{user['id']}.json")
        print(f"     ├─ ID       : {user['id']}")
        print(f"     ├─ Nome     : {user['nome']}")
        print(f"     ├─ Email    : {user['email']}")
        print(f"     ├─ Telefone : {user['telefone']}")
        print(f"     ├─ CPF      : {user['cpf']}")
        print(f"     ├─ OAB      : {user['oab'] if user['oab'] else 'Não informado'}")
        print(f"     ├─ Role     : {user['role'].upper()}")
        print(f"     └─ Criado   : {user['criado_em']}")
        print()
else:
    print("\n👤 FUNCIONÁRIOS: Nenhum arquivo encontrado\n")

print("=" * 80)
total = len(users['socios']) + len(users['funcionarios'])
print(f"📊 TOTAL: {total} usuário(s) com backup em JSON")
print("=" * 80)
print()

# Mostrar estrutura de diretórios
print("📂 Estrutura de diretórios:")
print("   src/backend/app/user_data/")
print("   ├── socios/")
for user in users['socios']:
    print(f"   │   └── user_{user['id']}.json")
print("   └── funcionarios/")
for user in users['funcionarios']:
    print(f"       └── user_{user['id']}.json")
print()
EOF
