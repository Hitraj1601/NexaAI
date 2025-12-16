import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated API calls
export const apiCall = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  const token = getAuthToken();
  
  console.log("🔍 Frontend - Token from localStorage:", token ? "Present" : "Missing");
  console.log("🔍 Frontend - Making request to:", `${API_BASE_URL}${endpoint}`);
  
  const config: RequestInit = {
    method: options.method || 'GET',
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  console.log("🔍 Frontend - Request headers:", config.headers);

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  const responseData = await response.json();
  console.log("🔍 Frontend - Response data:", responseData);
  return responseData.data; // Assuming ApiResponse structure
};

// Custom hook for API calls
export const useApi = <T>(endpoint: string, options: ApiOptions = {}): ApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall<T>(endpoint, options);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
};

// Specific hooks for profile and history
export const useUserProfile = () => {
  return useApi<{
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
    limits: {
      articles: { used: number; total: number };
      images: { used: number; total: number };
      titles: { used: number; total: number };
      backgroundRemovals: { used: number; total: number };
    };
  }>('/api/user/profile');
};

export const useUserHistory = (type: string = 'all', page: number = 1, limit: number = 10) => {
  const endpoint = `/api/user/history?type=${type}&page=${page}&limit=${limit}`;
  
  return useApi<{
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
  }>(endpoint);
};

export const useDashboardAnalytics = () => {
  return useApi<{
    dailyActivity: Array<{
      date: string;
      articles: number;
      images: number;
      titles: number;
      bgRemovals: number;
      total: number;
    }>;
  }>('/api/user/analytics');
};

// Functions for mutations
export const updateUserProfile = async (profileData: {
  username?: string;
  email?: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
}) => {
  return apiCall('/user/profile', {
    method: 'PUT',
    body: profileData,
  });
};

export const deleteHistoryItem = async (type: string, id: string) => {
  return apiCall(`/user/history/${type}/${id}`, {
    method: 'DELETE',
  });
};

export default { useApi, useUserProfile, useUserHistory, useDashboardAnalytics };