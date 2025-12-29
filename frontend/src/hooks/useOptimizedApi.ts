// Custom hook for optimized data fetching with caching and deduplication
import { useState, useEffect, useCallback, useRef } from 'react';
import tokenManager from '@/utils/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresIn: number;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  cacheTime?: number; // Cache time in milliseconds (default: 5 minutes)
  staleTime?: number; // Stale time in milliseconds (default: 30 seconds)
  retry?: number; // Number of retries
  retryDelay?: number; // Delay between retries in milliseconds
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
  refetch: () => Promise<void>;
  invalidateCache: () => void;
}

// Global cache and request deduplication
const cache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<any>>();
const requestQueue = new Map<string, NodeJS.Timeout>();

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return tokenManager.getValidToken();
};

// Helper function to generate cache key
const getCacheKey = (endpoint: string, options: ApiOptions = {}): string => {
  const token = getAuthToken();
  const key = `${endpoint}_${JSON.stringify(options)}_${token || 'anonymous'}`;
  return btoa(key).replace(/[^a-zA-Z0-9]/g, ''); // Safe cache key
};

// Helper function to check if cache entry is valid
const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < entry.expiresIn;
};

// Helper function to check if cache entry is stale
const isCacheStale = (entry: CacheEntry, staleTime: number): boolean => {
  return Date.now() - entry.timestamp > staleTime;
};

// Optimized API call with caching and deduplication
export const apiCall = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  const {
    method = 'GET',
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    retry = 2,
    retryDelay = 1000
  } = options;

  const cacheKey = getCacheKey(endpoint, options);
  
  // For GET requests, check cache first
  if (method === 'GET') {
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && isCacheValid(cachedEntry)) {
      console.log(`🎯 Cache hit for ${endpoint}`);
      return cachedEntry.data;
    }

    // Check if there's a pending request for this endpoint
    const pendingRequest = pendingRequests.get(cacheKey);
    if (pendingRequest) {
      console.log(`⏳ Deduplicating request for ${endpoint}`);
      return pendingRequest;
    }
  }

  const makeRequest = async (attemptNumber = 0): Promise<T> => {
    const token = getAuthToken();
    
    const config: RequestInit = {
      method,
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

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        
        // Handle token expiration
        if (response.status === 401 && (errorData.message?.includes('expired') || errorData.message?.includes('Invalid token'))) {
          tokenManager.logout();
          throw new Error('Session expired. Please log in again.');
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      const data = responseData.data;

      // Cache GET requests
      if (method === 'GET') {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          expiresIn: cacheTime
        });
      }

      return data;
    } catch (error) {
      // Retry logic
      if (attemptNumber < retry && (error instanceof TypeError || error.message.includes('fetch'))) {
        console.log(`🔄 Retrying request ${attemptNumber + 1}/${retry} for ${endpoint}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attemptNumber + 1)));
        return makeRequest(attemptNumber + 1);
      }
      throw error;
    }
  };

  // For GET requests, add to pending requests to prevent duplication
  if (method === 'GET') {
    const requestPromise = makeRequest()
      .finally(() => {
        pendingRequests.delete(cacheKey);
      });
    
    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  return makeRequest();
};

// Optimized useApi hook with better caching and stale-while-revalidate pattern
export const useOptimizedApi = <T>(
  endpoint: string, 
  options: ApiOptions = {}
): ApiResponse<T> => {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000 // 30 seconds
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const cacheKey = getCacheKey(endpoint, options);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const invalidateCache = useCallback(() => {
    cache.delete(cacheKey);
    setIsStale(true);
  }, [cacheKey]);

  const fetchData = useCallback(async (backgroundUpdate = false) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (!backgroundUpdate) {
        setLoading(true);
        setError(null);
      }

      // Check for stale cache data first
      const cachedEntry = cache.get(cacheKey);
      if (cachedEntry && isCacheValid(cachedEntry)) {
        const isDataStale = isCacheStale(cachedEntry, staleTime);
        
        if (mountedRef.current) {
          setData(cachedEntry.data);
          setIsStale(isDataStale);
          setLoading(false);
        }

        // If data is stale but valid, fetch fresh data in background
        if (isDataStale && !backgroundUpdate) {
          fetchData(true);
        }
        return;
      }

      const result = await apiCall<T>(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'signal': controller.signal
        }
      });

      if (mountedRef.current && !controller.signal.aborted) {
        setData(result);
        setIsStale(false);
        setError(null);
      }
    } catch (err) {
      if (!controller.signal.aborted && mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setIsStale(false);
      }
    } finally {
      if (!controller.signal.aborted && mountedRef.current) {
        setLoading(false);
      }
    }
  }, [endpoint, cacheKey, staleTime, options]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
    
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { 
    data, 
    loading, 
    error, 
    isStale,
    refetch: () => fetchData(), 
    invalidateCache 
  };
};

// Enhanced hooks with optimizations
export const useUserProfile = () => {
  return useOptimizedApi<{
    user: {
      id: string;
      username: string;
      email: string;
      bio?: string;
      company?: string;
      location?: string;
      website?: string;
      joinDate: string;
      lastActive: string;
    };
    usage: {
      articles: number;
      images: number;
      titles: number;
      backgroundRemovals: number;
      total: number;
    };
    recentActivity: {
      articles: number;
      images: number;
      titles: number;
      backgroundRemovals: number;
      total: number;
    };
  }>('/api/user/profile', {
    cacheTime: 10 * 60 * 1000, // 10 minutes
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};

export const useUserHistory = (type: string = 'all', page: number = 1, limit: number = 10) => {
  const endpoint = `/api/user/history?type=${type}&page=${page}&limit=${limit}`;
  
  return useOptimizedApi<{
    history: Array<{
      id: string;
      type: 'article' | 'image' | 'title' | 'bg-removal';
      title: string;
      content: string;
      prompt?: string;
      originalImage?: string;
      createdAt: string;
      user: {
        username: string;
      };
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>(endpoint, {
    cacheTime: 3 * 60 * 1000, // 3 minutes
    staleTime: 30 * 1000 // 30 seconds
  });
};

export const useDashboardAnalytics = () => {
  return useOptimizedApi<{
    dailyActivity: Array<{
      date: string;
      articles: number;
      images: number;
      titles: number;
      bgRemovals: number;
      total: number;
    }>;
  }>('/api/user/analytics', {
    cacheTime: 15 * 60 * 1000, // 15 minutes
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Enhanced functions for mutations with cache invalidation
export const updateUserProfile = async (profileData: {
  username?: string;
  email?: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
}) => {
  const result = await apiCall('/api/user/profile', {
    method: 'PUT',
    body: profileData,
  });

  // Invalidate profile cache
  const profileCacheKey = getCacheKey('/api/user/profile');
  cache.delete(profileCacheKey);

  return result;
};

export const deleteHistoryItem = async (type: string, id: string) => {
  const result = await apiCall(`/api/user/history/${type}/${id}`, {
    method: 'DELETE',
  });

  // Invalidate history caches
  cache.forEach((value, key) => {
    if (key.includes('/api/user/history')) {
      cache.delete(key);
    }
  });

  // Also invalidate profile and analytics caches as they depend on this data
  const profileCacheKey = getCacheKey('/api/user/profile');
  const analyticsCacheKey = getCacheKey('/api/user/analytics');
  cache.delete(profileCacheKey);
  cache.delete(analyticsCacheKey);

  return result;
};

// Cache cleanup utility
export const clearCache = () => {
  cache.clear();
  pendingRequests.clear();
  requestQueue.clear();
};

// Get cache stats for debugging
export const getCacheStats = () => {
  const stats = {
    size: cache.size,
    pendingRequests: pendingRequests.size,
    entries: Array.from(cache.entries()).map(([key, entry]) => ({
      key: key.substring(0, 50) + '...',
      age: Date.now() - entry.timestamp,
      valid: isCacheValid(entry),
      stale: isCacheStale(entry, 30000)
    }))
  };
  console.table(stats.entries);
  return stats;
};

export default { 
  useOptimizedApi, 
  useUserProfile, 
  useUserHistory, 
  useDashboardAnalytics,
  clearCache,
  getCacheStats
};