import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

// ========== MOCK DE USUÁRIOS PRÉ-CADASTRADOS ==========
const MOCK_USERS = [
  {
    id: '1',
    nome: 'Dr. Fausto Correia',
    email: 'fausto@legispro.com',
    senha: '123456',
    role: 'socio',
    telefone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    oab: 'OAB/SP 123456',
    avatar: 'https://ui-avatars.com/api/?name=Fausto+Correia&background=1e3a8a&color=fff'
  },
  {
    id: '2',
    nome: 'João Silva',
    email: 'joao@legispro.com',
    senha: '123456',
    role: 'funcionario',
    telefone: '(11) 91234-5678',
    cpf: '987.654.321-00',
    oab: '',
    avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=1e3a8a&color=fff'
  },
  {
    id: '3',
    nome: 'Maria Santos',
    email: 'maria@legispro.com',
    senha: '123456',
    role: 'funcionario',
    telefone: '(11) 95555-4444',
    cpf: '456.789.123-00',
    oab: '',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=1e3a8a&color=fff'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Simula verificação de autenticação
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      // Simula delay de requisição
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Busca usuário no mock
      const foundUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
      );
      
      if (!foundUser) {
        throw new Error('Email ou senha inválidos');
      }
      
      // Remove a senha antes de armazenar
      const { senha: _, ...userWithoutPassword } = foundUser;
      
      // Gera um token fake
      const fakeToken = `fake-jwt-token-${foundUser.id}-${Date.now()}`;
      
      // Armazena no localStorage
      localStorage.setItem('token', fakeToken);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      setUser(userWithoutPassword);
      
      console.log('✅ Login bem-sucedido:', userWithoutPassword);
      
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('✅ Logout realizado');
  };

  const register = async (userData) => {
    try {
      // Simula delay de requisição
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verifica se email já existe
      const emailExists = MOCK_USERS.some(
        u => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      
      if (emailExists) {
        throw new Error('Email já cadastrado');
      }
      
      // Cria novo usuário
      const newUser = {
        id: String(MOCK_USERS.length + 1),
        ...userData,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.nome)}&background=1e3a8a&color=fff`
      };
      
      // Adiciona ao mock (em produção, isso seria salvo no backend)
      MOCK_USERS.push(newUser);
      
      console.log('✅ Usuário cadastrado:', newUser);
      
      return { success: true, message: 'Cadastro realizado com sucesso!' };
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};