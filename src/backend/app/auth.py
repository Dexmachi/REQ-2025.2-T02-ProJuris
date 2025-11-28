# app/auth.py
from flask import Blueprint, request, jsonify
from app import db
from app.models import User
from flask_login import login_user, logout_user, current_user, login_required

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    if current_user.is_authenticated:
        return jsonify({'message': 'Already logged in'}), 400

    data = request.get_json()
    if not data or not 'email' in data or not 'password' in data:
        return jsonify({'message': 'Missing email or password'}), 400

    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({'message': 'Email already registered'}), 400

    new_user = User(email=email)
    new_user.password = password 
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201


@bp.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return jsonify({'message': 'Already logged in'}), 200

    data = request.get_json()
    if not data or not 'email' in data or not 'password' in data:
        return jsonify({'message': 'Missing email or password'}), 400

    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        login_user(user, remember=data.get('remember', False))
        return jsonify({'message': 'Login successful'}), 200
    
    return jsonify({'message': 'Invalid email or password'}), 401


@bp.route('/logout', methods=['POST'])
@login_required  
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200


@bp.route('/status', methods=['GET'])
def status():
    if current_user.is_authenticated:
        return jsonify({'logged_in': True, 'user': {'id': current_user.id, 'email': current_user.email}}), 200
    else:
        return jsonify({'logged_in': False}), 200