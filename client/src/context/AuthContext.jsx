import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/refresh-token`, {}, { withCredentials: true });
      if (res.data.success) {
        setAccessToken(res.data.accessToken);
        const decoded = parseJwt(res.data.accessToken);
        setUser(decoded);
        setIsLoading(false);
        return;
      }
    } catch (err) {}

    try {
      const res = await axios.post(`${API_URL}/api/auth/admin/refresh-token`, {}, { withCredentials: true });
      if (res.data.success) {
        setAccessToken(res.data.accessToken);
        const decoded = parseJwt(res.data.accessToken);
        setUser(decoded);
      }
    } catch (e) {}

    setIsLoading(false);
  };

  const login = (token, userData) => {
    setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {}
    setAccessToken(null);
    setUser(null);
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) { return null; }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, isAuthenticated: !!user, login, logout }}>
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0d1a', color: '#00b4ff' }}>
          Loading...
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;