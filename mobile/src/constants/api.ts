import { Platform } from 'react-native';

// Use your machine's local IP for physical device
// Change this IP if your network changes
const LOCAL_IP = '172.28.17.56';

const DEV_API_URL = Platform.select({
  ios: `http://${LOCAL_IP}:5001`,
  android: `http://${LOCAL_IP}:5001`,
  default: 'http://localhost:5001',
});

const PROD_API_URL = 'https://pure-adventure-production-bcc2.up.railway.app/api';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
  },
  DISHES: '/api/dishes',
  MENUS: '/api/menus',
  TABLES: '/api/tables',
  ORDERS: {
    BASE: '/api/orders',
    MY: '/api/orders/my',
  },
  DELIVERIES: {
    BASE: '/api/deliveries',
    RIDERS: '/api/deliveries/riders',
    STATS: '/api/deliveries/stats',
    MY: '/api/deliveries/my',
    ASSIGN: (id: string) => `/api/deliveries/${id}/assign`,
  },
  FINANCIALS: {
    BASE: '/api/financials',
    SUMMARY: '/api/financials/summary',
  },
  REVIEWS: {
    BASE: '/api/reviews',
    MY: '/api/reviews/my',
  },
};
