import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    authService.getUser()
  );

  const login = (userData: User, token: string) => {
    authService.login(token, userData);
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
