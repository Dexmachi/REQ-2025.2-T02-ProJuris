from app import db, login_manager
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy.orm import relationship # Importação necessária para definir a relação

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    telefone = db.Column(db.String(20), nullable=True)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    oab = db.Column(db.String(50), nullable=True)
    role = db.Column(db.String(20), nullable=False, default='funcionario')  # 'socio' ou 'funcionario'

    def __repr__(self):
        return f'<User {self.nome} - {self.email}>'
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        from app import bcrypt
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        from app import bcrypt
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'telefone': self.telefone,
            'cpf': self.cpf,
            'oab': self.oab,
            'role': self.role
        }
    
class Demanda(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # RF01: Campo 'atividade'
    titulo = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=True) 
    
    # RF01: Campo 'andamento' (status inicial)
    # Usamos o status inicial como 'Elaboração', conforme as colunas Kanban (RF12)
    status = db.Column(db.String(50), nullable=False, default='Elaboração') 
    
    # RF01: Campo 'prazo'
    data_prazo = db.Column(db.DateTime, nullable=False)
    
    data_criacao = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # RF01: Campo 'responsavel'
    # Cria uma chave estrangeira para o ID do usuário responsável
    responsavel_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    responsavel = relationship('User', backref='demandas', lazy=True)

    def __repr__(self):
        return f'<Demanda {self.titulo} - Status: {self.status}>'

    # Método para serializar a demanda para resposta JSON
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'status': self.status,
            'data_prazo': self.data_prazo.isoformat(),
            'data_criacao': self.data_criacao.isoformat(),
            'responsavel_id': self.responsavel_id,
            'responsavel_email': self.responsavel.email # Exemplo de como pegar o email
        }