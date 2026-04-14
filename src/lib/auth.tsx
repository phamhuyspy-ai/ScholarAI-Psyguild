import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  subscription: 'free' | 'monthly' | 'yearly';
  subscriptionExpiry?: string;
}

interface AuthContextType {
  user: UserData | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Check if subscription expired
        if (parsedUser.subscription !== 'free' && parsedUser.subscriptionExpiry) {
          if (new Date(parsedUser.subscriptionExpiry) < new Date()) {
            parsedUser.subscription = 'free';
            localStorage.setItem('current_user', JSON.stringify(parsedUser));
            
            // Also update in mock DB
            const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
            const uIndex = users.findIndex((u: any) => u.email === parsedUser.email);
            if (uIndex !== -1) {
              users[uIndex].subscription = 'free';
              localStorage.setItem('mock_users', JSON.stringify(users));
            }
          }
        }
        
        setUser(parsedUser);
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('current_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'phamhuyspy@gmail.com';

  return (
    <AuthContext.Provider value={{ user, userData: user, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
