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

// SILA MASUKKAN URL GOOGLE SCRIPT CIKGU DI BAWAH INI:
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwSnIL8EVPYdyFcH8RLR-KB7olxDBsq5TVJ3y4muYkYrErf9oTCL5aA8w8cRuj15Zu-xg/exec";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('smartlab_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Ambil senarai pengguna dari Google Sheets
    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        if (data.users && data.users.length > 0) {
          setRegisteredUsers(data.users);
        }
      })
      .catch(err => console.error("Gagal ambil pengguna:", err));
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

  const register = async (name: string, email: string, role: Role) => {
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
    
    // Auto login selepas daftar
    setUser(newUser);
    localStorage.setItem('smartlab_user', JSON.stringify(newUser));

    // Hantar ke Google Sheets
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'register', user: newUser })
      });
    } catch (error) {
      console.error("Gagal daftar ke Google Sheets:", error);
    }
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
