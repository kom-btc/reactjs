import api from './api';

export const authService = {
  login: async (username, password) => {
    // ລ້າງຂໍ້ມູນເກົ່າກ່ອນ
    localStorage.clear();
    
    const response = await api.post('/auth/login', { username, password });
    
    console.log('🔍 Login Response:', response.data);
    
    if (response.data.success) {
      const userData = response.data.data;
      
      // ກວດສອບວ່າມີ menus ບໍ່
      const menus = userData.menus || [];
      
      console.log('✅ Menus from server:', menus);
      console.log('✅ Menus count:', menus.length);
      
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData.user));
      localStorage.setItem('menus', JSON.stringify(menus)); // ບັນທຶກເປັນ array
      localStorage.setItem('tokenExpiry', userData.expiresAt);
      
      console.log('✅ Saved to localStorage');
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('menus');
    localStorage.removeItem('tokenExpiry');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getMenus: () => {
    try {
      const menusStr = localStorage.getItem('menus');
      if (!menusStr || menusStr === 'null' || menusStr === 'undefined') {
        console.warn('⚠️ No menus in localStorage');
        return [];
      }
      const menus = JSON.parse(menusStr);
      console.log('📋 Loaded menus:', menus);
      return Array.isArray(menus) ? menus : [];
    } catch (error) {
      console.error('❌ Error parsing menus:', error);
      return [];
    }
  },

  isTokenExpired: () => {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    return new Date() >= new Date(expiry);
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  refreshMenus: async () => {
    const response = await api.get('/auth/menus');
    if (response.data.success) {
      const menus = response.data.data || [];
      localStorage.setItem('menus', JSON.stringify(menus));
    }
    return response.data;
  }
};