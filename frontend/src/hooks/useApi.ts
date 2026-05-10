// Re-export optimized API hooks for backward compatibility
export { 
  useOptimizedApi as useApi,
  useUserProfile,
  useUserHistory,
  useDashboardAnalytics,
  updateUserProfile,
  deleteHistoryItem,
  apiCall,
  clearCache,
  getCacheStats
} from './useOptimizedApi';

// Keep the original API for any components that might need it
import tokenManager from '@/utils/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Legacy API call function (deprecated - use optimized version)
export const legacyApiCall = async <T>(endpoint: string, options: any = {}): Promise<T> => {
  const token = tokenManager.getValidToken();
  
  const config: RequestInit = {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    
    if (response.status === 401 && (errorData.message?.includes('expired') || errorData.message?.includes('Invalid token'))) {
      tokenManager.logout();
      throw new Error('Session expired. Please log in again.');
    }
    
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  const responseData = await response.json();
  return responseData.data;
};