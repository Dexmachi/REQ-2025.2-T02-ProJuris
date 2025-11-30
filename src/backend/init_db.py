from app import create_app, db
from app.models import User

app = create_app()

with app.app_context():
    # Cria todas as tabelas
    db.create_all()
    print("✅ Banco de dados inicializado com sucesso!")
    
    # Opcional: Criar um usuário de teste
    existing_user = User.query.filter_by(email='teste@legispro.com').first()
    if not existing_user:
        test_user = User(
            nome='Usuário Teste',
            email='teste@legispro.com',
            telefone='(11) 99999-9999',
            cpf='123.456.789-00',
            oab='OAB/SP 123456',
            role='socio'
        )
        test_user.password = '123456'
        db.session.add(test_user)
        db.session.commit()
        print("✅ Usuário de teste criado:")
        print("   Email: teste@legispro.com")
        print("   Senha: 123456")
        print("   Role: socio")
