import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        
        // Verifica se o token ainda é válido
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          // Token inválido ou expirado
          console.error('Token inválido:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
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
      const response = await authAPI.login(email, senha);
      const { token, user: userData } = response.data;
      
      // Armazena no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      console.log('✅ Login bem-sucedido:', userData);
      
      return userData;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      const message = error.response?.data?.message || 'Erro ao realizar login';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      console.log('✅ Logout realizado');
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      console.log('✅ Usuário cadastrado:', response.data);
      return { success: true, message: response.data.message || 'Cadastro realizado com sucesso!' };
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      const message = error.response?.data?.message || 'Erro ao realizar cadastro';
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
