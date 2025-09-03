'use client';

import { ReactNode, useEffect, createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const API = process.env.NEXT_PUBLIC_API_URL!;

// Define types
type User = {
  username: string;
  profileCompleted: boolean;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  login: (username: string, password: string) => Promise<User>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  login: async () => ({ username: '', profileCompleted: false }),
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export function AxiosProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(()=> new QueryClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  // Define performLogout at component level, not inside useEffect
  const performLogout = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };
  // Public logout function
  const handleLogout = (): void => performLogout();

  const initAuth = async () => {
    const access = localStorage.getItem('accessToken');
    if (access) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      try {
        setUser({ username: 'user', profileCompleted: true });
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to restore auth session', e);
        performLogout(); // Now correctly scoped
      }
    }
    setLoading
  };

  useEffect(() => {
    axios.defaults.baseURL = API;
    const req = axios.interceptors.request.use((config) => {
      const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
      if (isFormData) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
      return config;
    });

    // Add a 401 interceptor to auto-refresh
    const interceptor = axios.interceptors.response.use(
      res => res,
      async err => {
        const origReq = err.config;
        if (origReq && err.response?.status === 401 && !origReq._retry) {
          origReq._retry = true;

          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            performLogout(); // Now correctly scoped
            return Promise.reject(new Error('Session expired'));
          }

          try {
            const { data } = await axios.post(
              `${API}/api/token/refresh`,
              { refresh: refreshToken }
            );
            localStorage.setItem('accessToken', data.access);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
            origReq.headers['Authorization'] = `Bearer ${data.access}`;
            return axios(origReq);
          } catch {
            performLogout(); // Now correctly scoped
            return Promise.reject(new Error('Session expired'));
          }
        }
        return Promise.reject(err);
      }
    );

    initAuth();

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router]); // Added router as dependency
  
  async function handleLogin(username: string, password: string): Promise<User> {
    try {
      // Get JWT tokens
      const { data: tokens } = await axios.post(`${API}/api/token`, {
        username,
        password,
      });
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
      
      // Use hardcoded user data for now
      const userData: User = { 
        username, 
        profileCompleted: false // Force redirect to setup-profile
      };
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
      
    } catch (error) {
      throw error;
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider 
        value={{ 
          user, 
          loading, 
          logout: handleLogout, 
          login: handleLogin,
          isAuthenticated 
        }}
      >
        {children}
      </AuthContext.Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}