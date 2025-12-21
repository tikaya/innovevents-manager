import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doitChangerMdp, setDoitChangerMdp] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedDoitChangerMdp = localStorage.getItem('doit_changer_mdp');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setDoitChangerMdp(savedDoitChangerMdp === 'true');
    }
    setLoading(false);
  }, []);

  const login = async (email, mot_de_passe) => {
    const response = await api.post('/auth/login', { email, mot_de_passe });
    const { token, user, doit_changer_mdp } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('doit_changer_mdp', doit_changer_mdp ? 'true' : 'false');
    
    setUser(user);
    setDoitChangerMdp(doit_changer_mdp || false);
    
    return { ...response.data, doit_changer_mdp };
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('doit_changer_mdp', 'false');
    
    setUser(user);
    setDoitChangerMdp(false);
    
    return response.data;
  };

  const logout = async () => {
    try {
      // Appeler l'API pour logger la déconnexion
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur logout:', error);
    } finally {
      // Toujours nettoyer le localStorage même si l'API échoue
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('doit_changer_mdp');
      setUser(null);
      setDoitChangerMdp(false);
    }
  };

  const clearDoitChangerMdp = () => {
    localStorage.setItem('doit_changer_mdp', 'false');
    setDoitChangerMdp(false);
  };

  const isAdmin = () => user?.role === 'admin';
  const isEmploye = () => user?.role === 'employe';
  const isClient = () => user?.role === 'client';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAdmin,
      isEmploye,
      isClient,
      isAuthenticated: !!user,
      doitChangerMdp,
      clearDoitChangerMdp
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
