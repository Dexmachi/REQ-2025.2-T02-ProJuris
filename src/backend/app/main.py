from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models import User

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