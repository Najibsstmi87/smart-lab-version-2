import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role } from '../types';
import { mockUsers } from '../lib/mockData';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
};

interface AuthContextType {
  user: StoredUser | null;
  loading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string, role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'smartlab_user';
const LOCAL_REGISTERED_KEY = 'smartlab_registered_users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<StoredUser[]>([]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(LOCAL_USER_KEY);
      const storedRegistered = localStorage.getItem(LOCAL_REGISTERED_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (storedRegistered) {
        setRegisteredUsers(JSON.parse(storedRegistered));
      }
    } catch (error) {
      console.error('Gagal baca localStorage auth:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string, password: string) => {
    const emailTrimmed = email.trim().toLowerCase();

    // Demo users: kekalkan demo login mudah
    const demoUser = mockUsers.find((u) => u.email.toLowerCase() === emailTrimmed);
    if (demoUser) {
      setUser(demoUser as StoredUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      return true;
    }

    // User berdaftar: wajib semak password
    const foundUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === emailTrimmed && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(foundUser));
      return true;
    }

    const emailExists = registeredUsers.some((u) => u.email.toLowerCase() === emailTrimmed);

    if (emailExists) {
      alert('Kata laluan salah.');
    } else {
      alert('Emel tidak dijumpai. Sila daftar dahulu.');
    }

    return false;
  };

  const register = (name: string, email: string, password: string, role: Role) => {
    const emailTrimmed = email.trim().toLowerCase();

    const allUsers = [...mockUsers, ...registeredUsers];
    if (allUsers.some((u) => u.email.toLowerCase() === emailTrimmed)) {
      alert('Emel ini telah didaftarkan. Sila log masuk.');
      return false;
    }

    const newUser: StoredUser = {
      id: `u${Date.now()}`,
      name: name.trim(),
      email: emailTrimmed,
      password,
      role,
    };

    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem(LOCAL_REGISTERED_KEY, JSON.stringify(updatedUsers));

    setUser(newUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
