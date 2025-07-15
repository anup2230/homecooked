"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Mock user data, you can replace this with your actual user data structure
const consumerUser = { name: "Alice Johnson", email: "alice.j@example.com", avatarUrl: "https://placehold.co/100x100.png" };
const cookUser = { name: "Nonna Isabella", email: "nonna.isabella@example.com", avatarUrl: "https://placehold.co/100x100.png" };

interface AuthContextType {
  isLoggedIn: boolean;
  isCook: boolean;
  user: { name: string; email: string; avatarUrl: string };
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isCook, setIsCook] = useState(true);

  const user = isCook ? cookUser : consumerUser;

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  const value = { isLoggedIn, isCook, user, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
