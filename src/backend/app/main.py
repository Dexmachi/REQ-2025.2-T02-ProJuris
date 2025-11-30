from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db # Importe o db do __init__.py
from app.models import Demanda, User # Importe os modelos criados
from datetime import datetime

bp = Blueprint('main', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'API do Sistema de Advocacia no ar!'})

@bp.route('/dashboard', methods=['GET'])
@login_required  
def dashboard():
    
    return jsonify({
        'message': f'Bem-vindo ao seu dashboard, {current_user.email}!',
        'user_id': current_user.id
    })

@bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    return jsonify({
        'id': current_user.id,
        'email': current_user.email
    })

@bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Nenhum dado enviado'}), 400
    
    if 'email' in data:
        novo_email = data['email']
        
        user_existente = User.query.filter(User.email == novo_email, User.id != current_user.id).first()
        if user_existente:
            return jsonify({'message': 'Este email já está em uso por outra conta'}), 400
        
        current_user.email = novo_email

    db.session.commit()
    
    return jsonify({'message': 'Perfil atualizado com sucesso!'})

@bp.route('/demandas', methods=['POST'])
@login_required 
def create_demanda():
    data = request.get_json()
    
    # 1. Validação dos campos obrigatórios (RF01)
    if not all(k in data for k in ('titulo', 'data_prazo', 'responsavel_id')):
        return jsonify({'message': 'Dados incompletos. Título, Prazo e Responsável são obrigatórios.'}), 400

    # 2. Verifica se o responsável existe (RF03)
    responsavel = User.query.get(data['responsavel_id'])
    if not responsavel:
        return jsonify({'message': 'Responsável não encontrado.'}), 404

    # 3. Processa a data do prazo (deve vir no formato ISO 8601)
    try:
        # Tenta converter a string de data para objeto datetime
        data_prazo = datetime.fromisoformat(data['data_prazo'].replace('Z', '+00:00')) 
    except ValueError:
        return jsonify({'message': 'Formato de data de prazo inválido. Use formato ISO 8601.'}), 400

    # 4. Cria a nova demanda 
    nova_demanda = Demanda(
        titulo=data['titulo'],
        descricao=data.get('descricao'),
        data_prazo=data_prazo,
        responsavel_id=data['responsavel_id']
    )

    # 5. Salva no banco de dados
    try:
        db.session.add(nova_demanda)
        db.session.commit()
        return jsonify({'message': 'Demanda cadastrada com sucesso!', 'demanda': nova_demanda.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro ao salvar a demanda: {str(e)}'}), 500

# Rota Listar Usuários (Auxiliar para RF03) ---
@bp.route('/usuarios', methods=['GET'])
@login_required
def list_users():
    # Retorna o ID e o email de todos os usuários para que o frontend possa listar os responsáveis
    users = User.query.all()
    return jsonify([{'id': u.id, 'email': u.email} for u in users]), 200