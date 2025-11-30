#!/bin/bash

echo "🔄 Sincronizando usuários do banco de dados para arquivos JSON..."

cd "src/backend"

python3 << 'EOF'
from app import create_app
from app.json_handler import sync_all_users_to_json, list_all_users_json

app = create_app()

with app.app_context():
    # Sincronizar todos os usuários
    sync_all_users_to_json()
    
    # Listar arquivos criados
    print("\n" + "=" * 70)
    print("📋 ARQUIVOS JSON CRIADOS")
    print("=" * 70)
    
    users_json = list_all_users_json()
    
    print(f"\n👔 SÓCIOS ({len(users_json['socios'])} arquivo(s)):")
    for user in users_json['socios']:
        print(f"   • {user['nome']:<30} | {user['email']:<30}")
        print(f"     Arquivo: user_data/socios/user_{user['id']}.json")
    
    print(f"\n👤 FUNCIONÁRIOS ({len(users_json['funcionarios'])} arquivo(s)):")
    for user in users_json['funcionarios']:
        print(f"   • {user['nome']:<30} | {user['email']:<30}")
        print(f"     Arquivo: user_data/funcionarios/user_{user['id']}.json")
    
    print("\n" + "=" * 70)
    print(f"✅ Total: {len(users_json['socios']) + len(users_json['funcionarios'])} usuário(s) sincronizados")
    print("=" * 70)
EOF

echo ""
echo "✅ Sincronização concluída!"
echo "📁 Arquivos salvos em: src/backend/app/user_data/"
