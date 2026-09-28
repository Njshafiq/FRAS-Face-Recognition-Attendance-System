// Centralized API configuration for FRAS Frontend
// Connected via VITE_API_BASE_URL (defaults to http://localhost:8080/api for Spring Boot)

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('fras_auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('fras_auth_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('fras_auth_token');
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
