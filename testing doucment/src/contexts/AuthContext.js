import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 檢查本地存儲中是否有用戶信息
    const savedUser = localStorage.getItem('fishAppUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // 這裡應該連接到真實的後端API
      // 目前使用模擬登入
      const mockUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      localStorage.setItem('fishAppUser', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      // 這裡應該連接到真實的後端API
      // 目前使用模擬註冊
      const mockUser = {
        id: Date.now().toString(),
        email,
        name,
        createdAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      localStorage.setItem('fishAppUser', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fishAppUser');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
