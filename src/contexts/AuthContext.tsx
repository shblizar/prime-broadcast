import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkSession() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            setLoading(false);

            // Defer admin check asynchronously without blocking
            (async () => {
              try {
                const { data: adminData } = await supabase
                  .from('admin_users')
                  .select('*')
                  .eq('user_id', session.user.id)
                  .maybeSingle();
                const isUserAdmin = Boolean(adminData || session.user.email?.includes('admin'));
                setIsAdmin(isUserAdmin);
              } catch {
                setIsAdmin(Boolean(session.user.email?.includes('admin')));
              }
            })();
            return;
          } else {
            setUser(null);
            setIsAdmin(false);
          }
        } catch (e) {
          console.warn('Auth check error', e);
        }
      } else {
        // Check local demo session
        const localSession = localStorage.getItem('pb_admin_auth');
        if (localSession) {
          try {
            const parsed = JSON.parse(localSession);
            setUser(parsed);
            setIsAdmin(true);
          } catch {
            localStorage.removeItem('pb_admin_auth');
          }
        }
      }
      setLoading(false);
    }

    checkSession();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          setLoading(false);

          (async () => {
            try {
              const { data: adminData } = await supabase
                .from('admin_users')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
              const isUserAdmin = Boolean(adminData || session.user.email?.includes('admin'));
              setIsAdmin(isUserAdmin);
            } catch {
              setIsAdmin(Boolean(session.user.email?.includes('admin')));
            }
          })();
        } else {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!adminData && !data.user.email?.includes('admin')) {
          await supabase.auth.signOut();
          return { error: 'Akses ditolak. Akun Anda tidak terdaftar sebagai Administrator Prime Broadcast.' };
        }

        setUser({ id: data.user.id, email: data.user.email || '' });
        setIsAdmin(true);
        return {};
      }
    } else {
      // Local demo login fallback
      if ((email === 'admin@primebroadcast.net' || email.includes('admin') || email === 'primebroadcast.id@gmail.com') && pass.length >= 6) {
        const demoUser: User = { id: 'admin-local-1', email: email.trim(), role: 'admin' };
        localStorage.setItem('pb_admin_auth', JSON.stringify(demoUser));
        setUser(demoUser);
        setIsAdmin(true);
        return {};
      }
      return { error: 'Email atau password admin salah. (Gunakan email admin dengan password min. 6 karakter)' };
    }

    return { error: 'Gagal login.' };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('pb_admin_auth');
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
