import { apiClient } from '../api/client';
import { MenuItem } from '../types/menu';

export const createMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  const response = await apiClient.post<MenuItem>('/api/v1/admin/menu-items', item);
  return response.data;
};

export const updateMenuItem = async (id: string, item: Partial<MenuItem>): Promise<MenuItem> => {
  const response = await apiClient.put<MenuItem>(`/api/v1/admin/menu-items/${id}`, item);
  return response.data;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/admin/menu-items/${id}`);
};