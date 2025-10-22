import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, User } from '../api';
import { favoritesSyncService } from '../sync/FavoritesSyncService';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (nome: string, email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário ao iniciar
  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const isAuth = await authAPI.isAuthenticated();
      if (isAuth) {
        const storedUser = await authAPI.getStoredUser();
        setUser(storedUser);
        
        // Sincronizar favoritos após login
        try {
          await favoritesSyncService.syncFavorites();
        } catch (error) {
          console.warn('Erro ao sincronizar favoritos:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, senha: string) {
    try {
      const response = await authAPI.login(email, senha);
      setUser(response.user);
      
      // Sincronizar favoritos após login
      try {
        await favoritesSyncService.syncFavorites();
      } catch (error) {
        console.warn('Erro ao sincronizar favoritos:', error);
      }
    } catch (error) {
      throw error;
    }
  }

  async function signUp(nome: string, email: string, senha: string) {
    try {
      const response = await authAPI.register(nome, email, senha);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    await authAPI.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
