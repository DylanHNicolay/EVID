import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  athlete_id?: number | null;
  team_id?: number | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((newToken: string, newUser: AuthUser): void => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback((): void => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` },
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error('invalid');
        return r.json();
      })
      .then((data: AuthUser) => {
        setToken(stored);
        setUser(data);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
    return (): void => controller.abort();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
