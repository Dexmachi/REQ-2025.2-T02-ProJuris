from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db 
from app.models import Demanda, User 
from app.decorators import token_required
from datetime import datetime

bp = Blueprint('main', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'API do Sistema de Advocacia no ar!'})

@bp.route('/dashboard', methods=['GET'])
@token_required
def dashboard(current_user):
    
    return jsonify({
        'message': f'Bem-vindo ao seu dashboard, {current_user.email}!',
        'user_id': current_user.id
    })

@bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'id': current_user.id,
        'email': current_user.email
    })

@bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
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
@token_required
def create_demanda(current_user):
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
        data_prazo = datetime.fromisoformat(data['data_prazo'].replace('Z', '+00:00')) 
    except ValueError:
        return jsonify({'message': 'Formato de data de prazo inválido. Use formato ISO 8601.'}), 400

    # 4. Cria a nova demanda 
    nova_demanda = Demanda(
        titulo=data['titulo'],
        descricao=data.get('descricao'),
        data_prazo=data_prazo,
        responsavel_id=data['responsavel_id'],
        prioridade=data.get('prioridade', 'normal') # NOVO: Salva a prioridade
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
@token_required
def list_users(current_user):
    users = User.query.all()
    return jsonify([{'id': u.id, 'nome': u.nome, 'email': u.email} for u in users]), 200

# Rota Atualizar Demanda ---
@bp.route('/demandas/<int:demanda_id>', methods=['PUT'])
@token_required
def update_demanda(current_user, demanda_id):
    # Busca a demanda
    demanda = Demanda.query.get(demanda_id)
    if not demanda:
        return jsonify({'message': 'Demanda não encontrada.'}), 404
    
    # Verifica se o usuário tem permissão (sócio pode editar todas, funcionário só as suas)
    if current_user.role != 'socio' and demanda.responsavel_id != current_user.id:
        return jsonify({'message': 'Você não tem permissão para editar esta demanda.'}), 403
    
    data = request.get_json()
    
    # Atualiza os campos permitidos
    if 'titulo' in data:
        demanda.titulo = data['titulo']
    
    if 'descricao' in data:
        demanda.descricao = data['descricao']
    
    if 'data_prazo' in data:
        try:
            demanda.data_prazo = datetime.fromisoformat(data['data_prazo'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'message': 'Formato de data inválido.'}), 400
    
    if 'status' in data:
        demanda.status = data['status']
    
    if 'prioridade' in data: # NOVO: Atualiza a prioridade na edição
        demanda.prioridade = data['prioridade'] 
    
    # Apenas sócio pode reatribuir demandas
    if 'responsavel_id' in data and current_user.role == 'socio':
        responsavel = User.query.get(data['responsavel_id'])
        if not responsavel:
            return jsonify({'message': 'Responsável não encontrado.'}), 404
        demanda.responsavel_id = data['responsavel_id']
    
    try:
        db.session.commit()
        return jsonify({'message': 'Demanda atualizada com sucesso!', 'demanda': demanda.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro ao atualizar demanda: {str(e)}'}), 500
    
# Rota para atualização rápida de status (Kanban) ---
@bp.route('/demandas/<int:demanda_id>/status', methods=['PATCH'])
@token_required
def patch_demanda_status(current_user, demanda_id):
    # 1. Busca a demanda
    demanda = Demanda.query.get(demanda_id)
    if not demanda:
        return jsonify({'message': 'Demanda não encontrada.'}), 404
    
    # 2. Verifica permissão (Sócio pode alterar todas; Funcionário só pode alterar as suas)
    if current_user.role != 'socio' and demanda.responsavel_id != current_user.id:
        return jsonify({'message': 'Você não tem permissão para alterar o status desta demanda.'}), 403
    
    data = request.get_json()
    novo_status = data.get('status')
    
    if not novo_status:
        return jsonify({'message': 'Novo status não fornecido.'}), 400
        
    # 3. Atualiza apenas o status
    demanda.status = novo_status
    
    # 4. Salva no banco de dados
    try:
        db.session.commit()
        return jsonify({'message': 'Status atualizado com sucesso!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro ao atualizar status: {str(e)}'}), 500

# Rota Obter Demanda por ID ---
@bp.route('/demandas/<int:demanda_id>', methods=['GET'])
@token_required
def get_demanda(current_user, demanda_id):
    demanda = Demanda.query.get(demanda_id)
    if not demanda:
        return jsonify({'message': 'Demanda não encontrada.'}), 404
    
    return jsonify(demanda.to_dict()), 200

# Rota Listar Demandas ---
@bp.route('/demandas', methods=['GET'])
@token_required
def list_demandas(current_user):
    try:
        demandas = Demanda.query.all()
        return jsonify([d.to_dict() for d in demandas]), 200
    except Exception as e:
        return jsonify({'message': f'Erro ao listar demandas: {str(e)}'}), 500