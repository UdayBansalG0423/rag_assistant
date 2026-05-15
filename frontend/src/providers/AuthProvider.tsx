import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { loginUser, registerUser } from "@/lib/api";
import {
  AuthUser,
  clearStoredToken,
  decodeAuthToken,
  getStoredToken,
  setStoredToken,
} from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const decodedUser = decodeAuthToken(storedToken);
    if (!decodedUser) {
      clearStoredToken();
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    setUser(decodedUser);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await loginUser({ username, password });
    setStoredToken(response.access_token);
    setToken(response.access_token);
    setUser(decodeAuthToken(response.access_token));
  };

  const register = async (username: string, password: string) => {
    await registerUser({ username, password });
  };

  const signOut = async () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      signOut,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
