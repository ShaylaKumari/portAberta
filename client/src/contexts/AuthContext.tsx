import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function initializeAuth() {
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user ?? null);
    setLoading(false);
  }

  const loginWithGoogle = useCallback(async () => {
    const redirectUrl = `${window.location.origin}/login`;
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      // 1. Avisa o Supabase para encerrar a sessão
      await supabase.auth.signOut();
      
      // 2. Limpa o estado local IMEDIATAMENTE
      setUser(null);
      
      // 3. Opcional: Limpa o storage manualmente para garantir
      localStorage.clear(); 
      
      // 4. Redireciona usando o método do navegador para limpar o cache da memória
      window.location.assign('/'); 
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  }, []);

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
