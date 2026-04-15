import { authService } from './auth';

const BASE_URL = 'http://localhost:5000/api';

export async function apiFetch(endpoint, options = {}) {
  const token = authService.getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    authService.logout();
    window.location.href = '/login';
    return;
  }

  return response;
}

