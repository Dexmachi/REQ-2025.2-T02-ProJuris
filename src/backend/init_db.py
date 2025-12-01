from app import create_app, db
from app.models import User

app = create_app()

with app.app_context():
    # Cria todas as tabelas (incluindo a nova coluna 'prioridade' em Demanda)
    db.create_all()
    print("✅ Banco de dados inicializado com sucesso!")
    
    # === CRIAÇÃO DOS USUÁRIOS CHAVE ===
    
    # 1. Usuário SÓCIO (Dr. Fausto Correia)
    if not User.query.filter_by(email='fausto@legispro.com').first():
        fausto_user = User(
            nome='Dr. Fausto Correia',
            email='fausto@legispro.com',
            telefone='(11) 98765-4321',
            cpf='123.456.789-00', # CPF fictício para teste
            oab='OAB/SP 123456',
            role='socio'
        )
        fausto_user.password = '123456' # Senha padrão
        db.session.add(fausto_user)
        print("✅ Usuário SÓCIO (Fausto) criado.")

    # 2. Usuário FUNCIONÁRIO (João Silva)
    if not User.query.filter_by(email='joao@legispro.com').first():
        joao_user = User(
            nome='João Silva',
            email='joao@legispro.com',
            telefone='(11) 91234-5678',
            cpf='987.654.321-00', # CPF fictício para teste
            oab='',
            role='funcionario'
        )
        joao_user.password = '123456' # Senha padrão
        db.session.add(joao_user)
        print("✅ Usuário FUNCIONÁRIO (João) criado.")
        
    # 3. Usuário FUNCIONÁRIO (Maria Santos)
    if not User.query.filter_by(email='maria@legispro.com').first():
        maria_user = User(
            nome='Maria Santos',
            email='maria@legispro.com',
            telefone='(11) 95555-4444',
            cpf='456.789.123-00', # CPF fictício para teste
            oab='',
            role='funcionario'
        )
        maria_user.password = '123456' # Senha padrão
        db.session.add(maria_user)
        print("✅ Usuário FUNCIONÁRIO (Maria) criado.")

    try:
        db.session.commit()
    except Exception as e:
        print(f"⚠️ Erro ao comitar usuários: {e}")

    print("✅ Inicialização de usuários concluída.")