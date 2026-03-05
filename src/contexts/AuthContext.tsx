import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { mockUsers } from '../lib/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  register: (name: string, email: string, role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('smartlab_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedRegistered = localStorage.getItem('smartlab_registered_users');
    if (storedRegistered) {
      setRegisteredUsers(JSON.parse(storedRegistered));
    }
  }, []);

  const login = (email: string) => {
    const allUsers = [...mockUsers, ...registeredUsers];
    const foundUser = allUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('smartlab_user', JSON.stringify(foundUser));
    } else {
      alert('Emel tidak dijumpai. Sila daftar akaun terlebih dahulu atau gunakan emel demo.');
    }
  };

  const register = (name: string, email: string, role: Role) => {
    const allUsers = [...mockUsers, ...registeredUsers];
    if (allUsers.find(u => u.email === email)) {
      alert('Emel ini telah didaftarkan! Sila log masuk.');
      return;
    }

    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      role
    };

    const updatedRegistered = [...registeredUsers, newUser];
    setRegisteredUsers(updatedRegistered);
    localStorage.setItem('smartlab_registered_users', JSON.stringify(updatedRegistered));
    
    // Auto login selepas daftar
    setUser(newUser);
    localStorage.setItem('smartlab_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartlab_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
