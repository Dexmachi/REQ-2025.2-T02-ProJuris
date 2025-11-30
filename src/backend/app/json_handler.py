"""
Módulo para gerenciar arquivos JSON de backup dos usuários.
Cada usuário terá um arquivo JSON individual com suas informações.
"""
import json
import os
from datetime import datetime
from pathlib import Path

# Diretório onde os arquivos JSON serão salvos
JSON_DIR = Path(__file__).parent / 'user_data'

def ensure_json_directory():
    """Cria o diretório de dados JSON se não existir."""
    JSON_DIR.mkdir(exist_ok=True)
    
    # Criar subdiretórios para sócios e funcionários
    (JSON_DIR / 'socios').mkdir(exist_ok=True)
    (JSON_DIR / 'funcionarios').mkdir(exist_ok=True)


def get_user_json_path(user_id, role):
    """
    Retorna o caminho do arquivo JSON para um usuário.
    
    Args:
        user_id: ID do usuário
        role: Tipo do usuário ('socio' ou 'funcionario')
    
    Returns:
        Path: Caminho completo do arquivo JSON
    """
    ensure_json_directory()
    
    subdir = 'socios' if role == 'socio' else 'funcionarios'
    filename = f'user_{user_id}.json'
    
    return JSON_DIR / subdir / filename


def save_user_to_json(user):
    """
    Salva as informações de um usuário em arquivo JSON.
    
    Args:
        user: Objeto User do SQLAlchemy
    
    Returns:
        str: Caminho do arquivo salvo
    """
    ensure_json_directory()
    
    # Preparar dados do usuário
    user_data = {
        'id': user.id,
        'nome': user.nome,
        'email': user.email,
        'telefone': user.telefone or '',
        'cpf': user.cpf,
        'oab': user.oab or '',
        'role': user.role,
        'criado_em': datetime.utcnow().isoformat(),
        'atualizado_em': datetime.utcnow().isoformat()
    }
    
    # Determinar caminho do arquivo
    file_path = get_user_json_path(user.id, user.role)
    
    # Salvar arquivo JSON
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(user_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Usuário salvo em JSON: {file_path}")
    return str(file_path)


def update_user_json(user):
    """
    Atualiza o arquivo JSON de um usuário existente.
    
    Args:
        user: Objeto User do SQLAlchemy
    """
    file_path = get_user_json_path(user.id, user.role)
    
    # Se o arquivo existe, carregar e atualizar
    if file_path.exists():
        with open(file_path, 'r', encoding='utf-8') as f:
            user_data = json.load(f)
        
        # Atualizar campos
        user_data.update({
            'nome': user.nome,
            'email': user.email,
            'telefone': user.telefone or '',
            'cpf': user.cpf,
            'oab': user.oab or '',
            'role': user.role,
            'atualizado_em': datetime.utcnow().isoformat()
        })
    else:
        # Se não existe, criar novo
        user_data = {
            'id': user.id,
            'nome': user.nome,
            'email': user.email,
            'telefone': user.telefone or '',
            'cpf': user.cpf,
            'oab': user.oab or '',
            'role': user.role,
            'criado_em': datetime.utcnow().isoformat(),
            'atualizado_em': datetime.utcnow().isoformat()
        }
    
    # Salvar arquivo
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(user_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Usuário atualizado em JSON: {file_path}")


def delete_user_json(user_id, role):
    """
    Remove o arquivo JSON de um usuário.
    
    Args:
        user_id: ID do usuário
        role: Tipo do usuário ('socio' ou 'funcionario')
    """
    file_path = get_user_json_path(user_id, role)
    
    if file_path.exists():
        file_path.unlink()
        print(f"🗑️  Arquivo JSON removido: {file_path}")
    else:
        print(f"⚠️  Arquivo JSON não encontrado: {file_path}")


def load_user_from_json(user_id, role):
    """
    Carrega informações de um usuário do arquivo JSON.
    
    Args:
        user_id: ID do usuário
        role: Tipo do usuário ('socio' ou 'funcionario')
    
    Returns:
        dict: Dados do usuário ou None se não encontrado
    """
    file_path = get_user_json_path(user_id, role)
    
    if file_path.exists():
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    return None


def list_all_users_json():
    """
    Lista todos os usuários salvos em JSON.
    
    Returns:
        dict: Dicionário com listas de sócios e funcionários
    """
    ensure_json_directory()
    
    result = {
        'socios': [],
        'funcionarios': []
    }
    
    # Listar sócios
    socios_dir = JSON_DIR / 'socios'
    if socios_dir.exists():
        for json_file in socios_dir.glob('user_*.json'):
            with open(json_file, 'r', encoding='utf-8') as f:
                result['socios'].append(json.load(f))
    
    # Listar funcionários
    funcionarios_dir = JSON_DIR / 'funcionarios'
    if funcionarios_dir.exists():
        for json_file in funcionarios_dir.glob('user_*.json'):
            with open(json_file, 'r', encoding='utf-8') as f:
                result['funcionarios'].append(json.load(f))
    
    return result


def sync_all_users_to_json():
    """
    Sincroniza todos os usuários do banco de dados para arquivos JSON.
    Útil para migração ou backup completo.
    """
    from app.models import User
    
    users = User.query.all()
    
    for user in users:
        save_user_to_json(user)
    
    print(f"✅ {len(users)} usuários sincronizados para JSON")
