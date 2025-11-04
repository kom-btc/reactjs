// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [userGroups, setUserGroups] = useState([]); // ⭐ ເພີ່ມນີ້
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/profile');
        if (response.data.success) {
          const userData = response.data.data;
          setUser({
            id: userData.id,
            username: userData.username,
            fullName: userData.full_name,
            email: userData.email,
            isAdmin: userData.is_admin === 1
          });
          setUserGroups(userData.groups || []); // ⭐ ເກັບ groups
          
          const menusResponse = await api.get('/auth/menus');
          if (menusResponse.data.success) {
            setMenus(menusResponse.data.data);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        const { token, user, menus } = response.data.data;
        localStorage.setItem('token', token);
        setUser(user);
        setMenus(menus);
        
        // ດຶງ groups
        const profileResponse = await api.get('/auth/profile');
        if (profileResponse.data.success) {
          setUserGroups(profileResponse.data.data.groups || []);
        }
        
        navigate('/dashboard');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setMenus([]);
    setUserGroups([]);
    navigate('/login');
  };

  // ⭐ ຟັງຊັນກວດສອບວ່າຢູ່ໃນ admin group
  const isInAdminGroup = () => {
    return userGroups.some(group => group.name.toLowerCase() === 'admin');
  };

  // ⭐ ຟັງຊັນກວດສອບວ່າມີສິດ admin
  const hasAdminAccess = () => {
    return user?.isAdmin || isInAdminGroup();
  };

  const value = {
    user,
    menus,
    userGroups,           // ⭐ ເພີ່ມ
    loading,
    login,
    logout,
    isInAdminGroup,       // ⭐ ເພີ່ມ
    hasAdminAccess        // ⭐ ເພີ່ມ
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthContext };