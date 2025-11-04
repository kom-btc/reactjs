// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json' // ⭐ ຕ້ອງມີນີ້
  }
});

// ຟັງຊັນດຶງຊື່ເຄື່ອງ
const getComputerName = () => {
  try {
    let computerName = localStorage.getItem('computerName');
    
    if (!computerName) {
      const platform = navigator.platform || 'Unknown';
      const userAgent = navigator.userAgent || '';
      
      const match = userAgent.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        const parts = match[1].split(';');
        computerName = parts[0]?.trim() || platform;
      } else {
        computerName = platform;
      }
      
      localStorage.setItem('computerName', computerName);
    }
    
    return computerName;
  } catch (error) {
    return 'Unknown';
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ເພີ່ມ Computer Name
    const computerName = getComputerName();
    config.headers['X-Computer-Name'] = computerName;
    
    // ⭐ ກວດສອບວ່າ data ເປັນ object ແລ້ວ axios ຈະ stringify ໃຫ້ເອງ
    // ບໍ່ຕ້ອງ stringify ເອງ!
    
    console.log('📤 Request:', {
      method: config.method,
      url: config.url,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;