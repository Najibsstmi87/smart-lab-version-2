import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Role } from '../types';
import { mockUsers } from '../lib/mockData';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string; // untuk user daftar (local)
};

type AuthContextType = {
  user: StoredUser | null;
  loading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string, role: Role) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'smartlab_user';
const LOCAL_REGISTERED_KEY = 'smartlab_registered_users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<StoredUser[]>([]);

  // ✅ Restore session + registered users on app start (fix refresh logout)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(LOCAL_USER_KEY);
      const storedRegistered = localStorage.getItem(LOCAL_REGISTERED_KEY);

      if (storedRegistered) {
        setRegisteredUsers(JSON.parse(storedRegistered));
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Auth localStorage read failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string, password: string) => {
    const emailTrimmed = email.trim().toLowerCase();

    // 1) Demo/mock users: WAJIB password juga (supaya tak bypass)
    const demoUser = (mockUsers as any[]).find(
      (u) => (u.email || '').toLowerCase() === emailTrimmed
    );

    if (demoUser) {
      // kalau mockUsers tak simpan password, kita set default rule:
      // password mesti sama seperti "1234" (awak boleh tukar)
      const demoPass = (demoUser.password ?? '1234') as string;

      if (password !== demoPass) {
        alert('Kata laluan salah.');
        return false;
      }

      setUser(demoUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      return true;
    }

    // 2) Registered users: MUST match password
    const found = registeredUsers.find(
      (u) => u.email.toLowerCase() === emailTrimmed && u.password === password
    );

    if (found) {
      setUser(found);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(found));
      return true;
    }

    const emailExists = registeredUsers.some((u) => u.email.toLowerCase() === emailTrimmed);
    if (emailExists) alert('Kata laluan salah.');
    else alert('Emel tidak dijumpai.\nSila daftar dahulu.');

    return false;
  };

  const register = (name: string, email: string, password: string, role: Role) => {
    const emailTrimmed = email.trim().toLowerCase();
    const nameTrimmed = name.trim();

    if (password.trim().length < 4) {
      alert('Kata laluan terlalu pendek.\nMinimum 4 aksara.');
      return false;
    }

    // prevent duplicates across demo + registered
    const all = [...(mockUsers as any[]), ...registeredUsers];
    if (all.some((u) => (u.email || '').toLowerCase() === emailTrimmed)) {
      alert('Emel ini telah didaftarkan.\nSila log masuk.');
      return false;
    }

    const newUser: StoredUser = {
      id: `u${Date.now()}`,
      name: nameTrimmed,
      email: emailTrimmed,
      password: password.trim(),
      role,
    };

    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem(LOCAL_REGISTERED_KEY, JSON.stringify(updated));

    // auto login after register
    setUser(newUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, register }),
    [user, loading, registeredUsers]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
