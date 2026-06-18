import { apiClient } from '../api/client';
import { AuthResponse } from '../types/auth';

async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', { email, password });
  return response.data;
}

export default {
  login,
};