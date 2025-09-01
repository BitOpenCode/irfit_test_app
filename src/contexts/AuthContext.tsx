import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => void;
  updateUserFromToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Моковые данные для демонстрации
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@irfit.com',
    name: 'Администратор',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '2',
    email: 'teacher@irfit.com',
    name: 'Иван Петров',
    role: 'teacher',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date(),
  },
  {
    id: '3',
    email: 'student@irfit.com',
    name: 'Анна Сидорова',
    role: 'student',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    lastLogin: new Date(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Проверяем localStorage для аутентификации
    const isAuth = localStorage.getItem('irfit_is_authenticated');
    const userData = localStorage.getItem('irfit_user_data');
    const token = localStorage.getItem('irfit_token');
    
    if (isAuth === 'true' && userData && token) {
      try {
        const parsedUserData = JSON.parse(userData);
        const user = {
          id: parsedUserData.userId,
          email: parsedUserData.email,
          name: parsedUserData.email.split('@')[0], // Используем email как имя
          role: parsedUserData.role || 'student', // Берем роль напрямую из localStorage
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        return user;
      } catch (error) {
        console.error('Ошибка парсинга данных пользователя:', error);
        return null;
      }
    }
    
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('irfit_is_authenticated') === 'true';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('user');
      setIsAuthenticated(false);
    }
  }, [user]);

  // Дополнительный useEffect для синхронизации с localStorage
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuth = localStorage.getItem('irfit_is_authenticated') === 'true';
      const token = localStorage.getItem('irfit_token');
      const userData = localStorage.getItem('irfit_user_data');
      
      if (isAuth && token && userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          const user = {
            id: parsedUserData.userId,
            email: parsedUserData.email,
            name: parsedUserData.email.split('@')[0],
            role: parsedUserData.role || 'student', // Берем роль напрямую из localStorage
            isActive: true,
            createdAt: new Date(),
            lastLogin: new Date(),
          };
          setUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Ошибка парсинга данных пользователя:', error);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    // Проверяем статус при загрузке
    checkAuthStatus();

    // Слушаем изменения в localStorage
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'password') { // Простая проверка для демо
      setUser(foundUser);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Очищаем все данные аутентификации
    localStorage.removeItem('irfit_token');
    localStorage.removeItem('irfit_is_authenticated');
    localStorage.removeItem('irfit_user_data');
    localStorage.removeItem('user');
    // Перенаправляем на профиль для входа
    window.location.href = '/#profile';
  };

  const register = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return false; // Пользователь уже существует
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      isActive: true,
      createdAt: new Date(),
    };

    mockUsers.push(newUser);
    setUser(newUser);
    return true;
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  const updateUserFromToken = (token: string) => {
    try {
      // Декодируем JWT токен
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const tokenData = JSON.parse(jsonPayload);
      
      const user = {
        id: tokenData.userId,
        email: tokenData.email,
        name: tokenData.email.split('@')[0],
        role: tokenData.role || 'student', // Берем роль напрямую из токена
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      };
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Ошибка обновления пользователя из токена:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      register,
      updateProfile,
      updateUserFromToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 