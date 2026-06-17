import { apiClient as api } from '../api/client';
import type { MenuItem } from '../types/menu';

export const getMenuItems = async (params: { category?: string, search?: string }): Promise<MenuItem[]> => {
  const response = await api.get('/api/v1/menu/items', { params });
  return response.data;
};

export const getMenuCategories = async (): Promise<string[]> => {
  const response = await api.get('/api/v1/menu/categories');
  return response.data;
};