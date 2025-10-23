import AsyncStorage from '@react-native-async-storage/async-storage';

// URL da API (resiliente ao prefixo /api)
// Preferimos usar variável de ambiente pública do Expo (EXPO_PUBLIC_API_URL)
// e caímos para um valor local (ajuste conforme necessário) apenas em desenvolvimento.
// Exemplos de EXPO_PUBLIC_API_URL aceitos:
// - https://seu-backend.onrender.com (sem /api)  -> vira https://seu-backend.onrender.com/api
// - https://seu-backend.onrender.com/api (com /api)
// - http://10.0.2.2:3001 (sem /api)              -> vira http://10.0.2.2:3001/api
// - http://10.0.2.2:3001/api (com /api)
const RAW_API_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\s/g, '');
let NORMALIZED_BASE = RAW_API_BASE.replace(/\/+$/, ''); // remove barras finais
if (NORMALIZED_BASE && !/\/api$/i.test(NORMALIZED_BASE)) {
  NORMALIZED_BASE = `${NORMALIZED_BASE}/api`;
}
const API_URL = NORMALIZED_BASE || 'http://172.20.2.29:3001/api';
// if (__DEV__) console.log('[API] Base URL:', API_URL);

// Tipos
export interface User {
  id: number;
  nome: string;
  email: string;
  photo_url?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: any[];
}

// Função auxiliar para fazer requisições
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Adicionar headers personalizados
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Adicionar token se existir
    if (token && !endpoint.includes('/login') && !endpoint.includes('/register')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as T;
  } catch (error) {
    if (error && typeof error === 'object' && 'error' in error) {
      throw error;
    }
    throw {
      error: 'Erro de conexão',
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
    } as ApiError;
  }
}

// Auth API
export const authAPI = {
  // Login
  async login(email: string, senha: string): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });

    // Salvar token
    await AsyncStorage.setItem('@auth_token', response.token);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(response.user));

    return response;
  },

  // Cadastro
  async register(nome: string, email: string, senha: string): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha }),
    });

    // Salvar token
    await AsyncStorage.setItem('@auth_token', response.token);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(response.user));

    return response;
  },

  // Verificar token
  async verify(): Promise<{ valid: boolean; userId: number }> {
    return request('/auth/verify', { method: 'POST' });
  },

  // Obter dados do usuário autenticado
  async getMe(): Promise<{ user: User }> {
    return request('/auth/me');
  },

  // Logout
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@auth_user');
  },

  // Verificar se está autenticado
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) return false;

      // Verificar se token é válido
      await authAPI.verify();
      return true;
    } catch {
      // Token inválido, limpar dados
      await authAPI.logout();
      return false;
    }
  },

  // Obter usuário do storage
  async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('@auth_user');
      if (!userJson) return null;
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },
};

// Favorites API (opcional - para sincronizar favoritos na nuvem)
export const favoritesAPI = {
  // Buscar favoritos do servidor
  async getFavorites(): Promise<any[]> {
    const response = await request<{ favorites: any[] }>('/favorites');
    return response.favorites;
  },

  // Adicionar favorito
  async addFavorite(favorite: {
    book_slug: string;
    chapter_id: string;
    paragraph_index: number;
    paragraph_text: string;
  }): Promise<void> {
    await request('/favorites', {
      method: 'POST',
      body: JSON.stringify(favorite),
    });
  },

  // Remover favorito
  async removeFavorite(id: number): Promise<void> {
    await request(`/favorites/${id}`, {
      method: 'DELETE',
    });
  },

  // Limpar todos
  async clearAll(): Promise<void> {
    await request('/favorites', {
      method: 'DELETE',
    });
  },
};

// Upload API
export const uploadAPI = {
  // Upload de foto de perfil
  async uploadProfilePhoto(photoBase64: string): Promise<{ message: string; user: User }> {
    return request('/upload/profile-photo', {
      method: 'POST',
      body: JSON.stringify({ photoBase64 }),
    });
  },

  // Remover foto de perfil
  async removeProfilePhoto(): Promise<{ message: string; user: User }> {
    return request('/upload/profile-photo', {
      method: 'DELETE',
    });
  },
};
