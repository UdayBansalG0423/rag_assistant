import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { loginUser, registerUser } from "@/services/auth.service";
import {
  AuthUser,
  clearStoredToken,
  decodeAuthToken,
  getStoredToken,
  setStoredToken,
  setStoredRefreshToken,
  setStoredUserId,
} from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
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

  const login = async (email: string, password: string) => {
    const response = await loginUser({ email, password });
    
    // Store Supabase tokens
    setStoredToken(response.access_token);
    setStoredRefreshToken(response.refresh_token);
    setStoredUserId(response.user_id);
    
    setToken(response.access_token);
    const decodedUser = decodeAuthToken(response.access_token);
    if (decodedUser) {
      setUser(decodedUser);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    await registerUser({ name, email, password });
    // After signup, user should login
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
